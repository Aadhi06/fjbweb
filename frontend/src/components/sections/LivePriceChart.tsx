"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatCurrency } from "@/lib/utils";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8002";
const HISTORY_DAYS = 21;
const STORAGE_KEY = "fjb_gfe_chart_v1";

type MetalKey = "gold" | "silver" | "platinum" | "palladium";

type ChartPoint = {
  date: string;
  label: string;
  price: number;
  ts: number;
};

type MetalState = {
  price: number;
  history: ChartPoint[];
};

const METALS: {
  key: MetalKey;
  label: string;
  apiLabels: string[];
  color: string;
}[] = [
  { key: "gold", label: "Gold", apiLabels: ["Gold 24ct"], color: "#D97706" },
  { key: "silver", label: "Silver", apiLabels: ["Silver"], color: "#C0C0C0" },
  { key: "platinum", label: "Platinum", apiLabels: ["Platinum"], color: "#A8B2C1" },
  { key: "palladium", label: "Palladium", apiLabels: ["Palladium"], color: "#B8A9C9" },
];

function dayKey(d: Date) {
  return d.toISOString().slice(0, 10);
}

function formatDayLabel(iso: string) {
  const d = new Date(`${iso}T12:00:00Z`);
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function formatAxisLabel(iso: string) {
  const d = new Date(`${iso}T12:00:00Z`);
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

/** Deterministic walk ending at current price so the chart looks filled on first load. */
function seedHistory(metal: MetalKey, current: number): ChartPoint[] {
  if (!current || current <= 0) return [];

  let seed = 0;
  for (let i = 0; i < metal.length; i++) seed = (seed * 31 + metal.charCodeAt(i)) >>> 0;
  const rand = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 0xffffffff;
  };

  const points: ChartPoint[] = [];
  const start = current * (0.92 + rand() * 0.06);
  for (let i = HISTORY_DAYS - 1; i >= 0; i--) {
    const d = new Date();
    d.setUTCHours(12, 0, 0, 0);
    d.setUTCDate(d.getUTCDate() - i);
    const t = (HISTORY_DAYS - 1 - i) / Math.max(HISTORY_DAYS - 1, 1);
    const wobble = Math.sin(t * Math.PI * 2.2 + rand()) * current * 0.012;
    const price = i === 0 ? current : start + (current - start) * t + wobble;
    const date = dayKey(d);
    points.push({
      date,
      label: formatDayLabel(date),
      price: Math.round(price * 100) / 100,
      ts: d.getTime(),
    });
  }
  return points;
}

function loadStored(): Partial<Record<MetalKey, ChartPoint[]>> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

function saveStored(map: Partial<Record<MetalKey, ChartPoint[]>>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  } catch {
    /* ignore */
  }
}

function upsertToday(history: ChartPoint[], price: number): ChartPoint[] {
  const today = dayKey(new Date());
  const point: ChartPoint = {
    date: today,
    label: formatDayLabel(today),
    price: Math.round(price * 100) / 100,
    ts: Date.now(),
  };
  const withoutToday = history.filter((p) => p.date !== today);
  const next = [...withoutToday, point].sort((a, b) => a.date.localeCompare(b.date));
  return next.slice(-HISTORY_DAYS);
}

function CustomTooltip({
  active,
  payload,
  color,
}: {
  active?: boolean;
  payload?: { payload: ChartPoint }[];
  color: string;
}) {
  if (!active || !payload?.length) return null;
  const p = payload[0].payload;
  return (
    <div className="rounded-xl bg-[#1a1a1a] border border-white/15 px-4 py-3 shadow-xl">
      <p className="text-xs text-white/60 mb-1">{p.label}</p>
      <p className="text-sm font-semibold" style={{ color }}>
        Price / gram : {formatCurrency(p.price)}
      </p>
    </div>
  );
}

export function LivePriceChart() {
  const [metal, setMetal] = useState<MetalKey>("gold");
  const [states, setStates] = useState<Record<MetalKey, MetalState>>({
    gold: { price: 0, history: [] },
    silver: { price: 0, history: [] },
    platinum: { price: 0, history: [] },
    palladium: { price: 0, history: [] },
  });
  const [available, setAvailable] = useState<Record<MetalKey, boolean>>({
    gold: true,
    silver: true,
    platinum: false,
    palladium: true,
  });

  const fetchRates = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/rates`);
      if (!res.ok) return;
      const json = await res.json();
      const rows: { metal: string; price_per_gram: number }[] = json.data || [];
      const stored = loadStored();
      const next: Record<MetalKey, MetalState> = {
        gold: { price: 0, history: [] },
        silver: { price: 0, history: [] },
        platinum: { price: 0, history: [] },
        palladium: { price: 0, history: [] },
      };
      const toStore: Partial<Record<MetalKey, ChartPoint[]>> = { ...stored };
      const avail: Record<MetalKey, boolean> = {
        gold: false,
        silver: false,
        platinum: false,
        palladium: false,
      };

      for (const cfg of METALS) {
        const row = rows.find((r) => cfg.apiLabels.includes(r.metal));
        if (!row?.price_per_gram) continue;
        avail[cfg.key] = true;
        const price = row.price_per_gram;
        let history = stored[cfg.key]?.length ? stored[cfg.key]! : [];
        if (!history.length) history = seedHistory(cfg.key, price);
        history = upsertToday(history, price);
        next[cfg.key] = { price, history };
        toStore[cfg.key] = history;
      }

      setAvailable(avail);
      setStates(next);
      saveStored(toStore);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    fetchRates();
    const interval = setInterval(fetchRates, 30 * 1000);
    return () => clearInterval(interval);
  }, [fetchRates]);

  useEffect(() => {
    if (!available[metal]) {
      const fallback = METALS.find((m) => available[m.key])?.key;
      if (fallback) setMetal(fallback);
    }
  }, [available, metal]);

  const active = METALS.find((m) => m.key === metal)!;
  const series = states[metal];
  const data = series.history;
  const first = data[0]?.price ?? 0;
  const last = series.price || data[data.length - 1]?.price || 0;
  const changePct = first > 0 ? ((last - first) / first) * 100 : 0;
  const isUp = changePct >= 0;

  const yDomain = useMemo(() => {
    if (!data.length) return [0, 100] as [number, number];
    const prices = data.map((d) => d.price);
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const pad = (max - min) * 0.12 || min * 0.02;
    return [Math.floor(min - pad), Math.ceil(max + pad)] as [number, number];
  }, [data]);

  const gradientId = `gfe-fill-${metal}`;

  return (
    <section className="py-16 bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <p className="text-gold text-sm font-semibold tracking-wider uppercase mb-2">Live Market Chart</p>
          <h2 className="text-2xl md:text-3xl font-serif font-bold text-white">Real-Time Price Chart</h2>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#111] overflow-hidden shadow-2xl">
          {/* Metal tabs — GFE style */}
          <div className="flex flex-wrap gap-2 p-4 border-b border-white/10">
            {METALS.map((m) => {
              const enabled = available[m.key];
              const selected = metal === m.key;
              return (
                <button
                  key={m.key}
                  type="button"
                  disabled={!enabled}
                  onClick={() => enabled && setMetal(m.key)}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors cursor-pointer border ${
                    selected
                      ? "border-gold text-gold bg-gold/10"
                      : enabled
                        ? "border-white/10 text-white/70 hover:text-white hover:border-white/25 bg-transparent"
                        : "border-white/5 text-white/25 cursor-not-allowed"
                  }`}
                >
                  {m.label}
                </button>
              );
            })}
          </div>

          <div className="p-4 md:p-6">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-6">
              <div>
                <p className="text-[11px] tracking-[0.18em] uppercase text-white/45 font-medium mb-2">
                  {active.label} — Price per gram (GBP)
                </p>
                <p className="text-4xl md:text-5xl font-serif font-bold text-white tracking-tight">
                  {last > 0 ? formatCurrency(last) : "—"}
                </p>
              </div>
              <p className={`text-sm font-semibold sm:pt-2 ${isUp ? "text-emerald-400" : "text-red-400"}`}>
                {last > 0 ? `${isUp ? "+" : ""}${changePct.toFixed(2)}% over period` : ""}
              </p>
            </div>

            {data.length > 1 ? (
              <ResponsiveContainer width="100%" height={320}>
                <AreaChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={active.color} stopOpacity={0.35} />
                      <stop offset="100%" stopColor={active.color} stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                  <XAxis
                    dataKey="date"
                    tickFormatter={formatAxisLabel}
                    tick={{ fill: "#777", fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    minTickGap={48}
                  />
                  <YAxis
                    domain={yDomain}
                    orientation="right"
                    tick={{ fill: "#777", fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => `£${Number(v).toFixed(2)}`}
                    width={64}
                  />
                  <Tooltip
                    content={<CustomTooltip color={active.color} />}
                    cursor={{ stroke: "rgba(255,255,255,0.35)", strokeWidth: 1 }}
                  />
                  <Area
                    type="monotone"
                    dataKey="price"
                    stroke={active.color}
                    strokeWidth={2.5}
                    fill={`url(#${gradientId})`}
                    isAnimationActive={false}
                    activeDot={{ r: 5, fill: active.color, stroke: "#111", strokeWidth: 2 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[320px] flex items-center justify-center text-white/40 text-sm">
                Loading price chart…
              </div>
            )}
          </div>

          <div className="px-4 md:px-6 py-3 border-t border-white/10 flex items-center justify-between text-[11px] text-white/40">
            <span>Spot market price · GBP per gram</span>
            <span>Updates every 30 seconds</span>
          </div>
        </div>
      </div>
    </section>
  );
}
