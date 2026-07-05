"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { TrendingUp, TrendingDown, RefreshCw } from "lucide-react";
import {
  ComposedChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Customized,
} from "recharts";
import { formatCurrency } from "@/lib/utils";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8002";
const CANDLE_INTERVAL_MS = 60_000;
const MAX_CANDLES = 60;

type Metal = "gold" | "silver";
type Direction = "up" | "down" | "none";

type Candle = {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  ts: number;
};

type Tick = { gold: number; silver: number; ts: number };

function directionFromChange(current: number, previous: number | null): Direction {
  if (previous === null) return "none";
  if (current > previous) return "up";
  if (current < previous) return "down";
  return "none";
}

function upsertCandle(candles: Candle[], price: number, now: number): Candle[] {
  const bucket = Math.floor(now / CANDLE_INTERVAL_MS) * CANDLE_INTERVAL_MS;
  const time = new Date(bucket).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
  const last = candles[candles.length - 1];

  if (!last || last.ts !== bucket) {
    const open = last ? last.close : price;
    return [
      ...candles.slice(-(MAX_CANDLES - 1)),
      {
        time,
        open,
        high: Math.max(open, price),
        low: Math.min(open, price),
        close: price,
        ts: bucket,
      },
    ];
  }

  return [
    ...candles.slice(0, -1),
    {
      ...last,
      high: Math.max(last.high, price),
      low: Math.min(last.low, price),
      close: price,
    },
  ];
}

function Candlesticks(props: {
  xAxisMap?: Record<number, { scale: (v: string) => number; bandwidth?: () => number }>;
  yAxisMap?: Record<number, { scale: (v: number) => number }>;
  offset?: { left: number; top: number; width: number; height: number };
  data?: Candle[];
}) {
  const xAxis = props.xAxisMap?.[0];
  const yAxis = props.yAxisMap?.[0];
  const data = props.data ?? [];
  if (!xAxis || !yAxis || !data.length) return null;

  const bandwidth = xAxis.bandwidth?.() ?? 12;

  return (
    <g>
      {data.map((c, i) => {
        const xCenter = xAxis.scale(c.time) + bandwidth / 2;
        const isUp = c.close >= c.open;
        const color = isUp ? "#26a69a" : "#ef5350";
        const yOpen = yAxis.scale(c.open);
        const yClose = yAxis.scale(c.close);
        const yHigh = yAxis.scale(c.high);
        const yLow = yAxis.scale(c.low);
        const bodyTop = Math.min(yOpen, yClose);
        const bodyH = Math.max(Math.abs(yClose - yOpen), 1);
        const w = Math.max(bandwidth * 0.65, 4);

        return (
          <g key={`${c.ts}-${i}`}>
            <line x1={xCenter} x2={xCenter} y1={yHigh} y2={yLow} stroke={color} strokeWidth={1} />
            <rect x={xCenter - w / 2} y={bodyTop} width={w} height={bodyH} fill={color} stroke={color} strokeWidth={1} />
          </g>
        );
      })}
    </g>
  );
}

export function LivePriceChart() {
  const [metal, setMetal] = useState<Metal>("gold");
  const [goldCandles, setGoldCandles] = useState<Candle[]>([]);
  const [silverCandles, setSilverCandles] = useState<Candle[]>([]);
  const [goldPrice, setGoldPrice] = useState(0);
  const [silverPrice, setSilverPrice] = useState(0);
  const [goldDir, setGoldDir] = useState<Direction>("none");
  const [silverDir, setSilverDir] = useState<Direction>("none");
  const [loading, setLoading] = useState(false);
  const prevRef = useRef<{ gold: number; silver: number } | null>(null);

  const fetchRates = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/api/rates`);
      if (!res.ok) return;
      const json = await res.json();
      const gold24 = json.data?.find((m: { metal: string }) => m.metal === "Gold 24ct");
      const silver = json.data?.find((m: { metal: string }) => m.metal === "Silver");
      if (!gold24 || !silver) return;

      const gold = gold24.price_per_gram;
      const silv = silver.price_per_gram;
      const prev = prevRef.current;
      const now = Date.now();

      setGoldDir(directionFromChange(gold, prev?.gold ?? null));
      setSilverDir(directionFromChange(silv, prev?.silver ?? null));
      setGoldPrice(gold);
      setSilverPrice(silv);
      prevRef.current = { gold, silver: silv };

      setGoldCandles((c) => upsertCandle(c, gold, now));
      setSilverCandles((c) => upsertCandle(c, silv, now));
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRates();
    const interval = setInterval(fetchRates, 30 * 1000);
    return () => clearInterval(interval);
  }, [fetchRates]);

  const candles = metal === "gold" ? goldCandles : silverCandles;
  const currentPrice = metal === "gold" ? goldPrice : silverPrice;
  const currentDir = metal === "gold" ? goldDir : silverDir;
  const lastCandle = candles[candles.length - 1];

  const yDomain = useMemo(() => {
    if (!candles.length) return [0, 100];
    const lows = candles.map((c) => c.low);
    const highs = candles.map((c) => c.high);
    const min = Math.min(...lows);
    const max = Math.max(...highs);
    const pad = (max - min) * 0.08 || min * 0.002;
    return [min - pad, max + pad];
  }, [candles]);

  const title = metal === "gold" ? "Gold 24ct Price, GBP / gram" : "Silver Price, GBP / gram";

  return (
    <section className="py-16 bg-[#0a0a0a]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <p className="text-gold text-sm font-semibold tracking-wider uppercase mb-2">Live Market Chart</p>
            <h2 className="text-2xl md:text-3xl font-serif font-bold text-white">Real-Time Price Chart</h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setMetal("gold")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors cursor-pointer ${metal === "gold" ? "bg-gold/20 text-gold border border-gold/40" : "bg-white/5 text-white/60 border border-white/10 hover:text-white"}`}
            >
              <img src="/images/gold-bar-icon.png" alt="" className="h-5 w-5 object-contain" />
              Gold
            </button>
            <button
              type="button"
              onClick={() => setMetal("silver")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors cursor-pointer ${metal === "silver" ? "bg-white/15 text-white border border-white/30" : "bg-white/5 text-white/60 border border-white/10 hover:text-white"}`}
            >
              <img src="/images/silver-bar-icon.png" alt="" className="h-5 w-5 object-contain" />
              Silver
            </button>
          </div>
        </div>

        {/* Trading terminal chart panel */}
        <div className="rounded-xl border border-white/10 bg-black overflow-hidden shadow-2xl">
          {/* Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 bg-[#111] border-b border-white/10">
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold text-white/90">{title}</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-white/10 text-white/50 font-mono">1m</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-white/10 text-white/50">Candlestick</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-white/50">
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : "text-green-400"}`} />
              <span className="text-green-400">● Live</span>
            </div>
          </div>

          {/* OHLC readout */}
          {lastCandle && (
            <div className="px-4 py-2 border-b border-white/5 flex flex-wrap gap-x-5 gap-y-1 text-xs font-mono">
              <span className="text-[#ef5350] font-semibold">{title}</span>
              <span className="text-white/50">O <span className="text-white">{lastCandle.open.toFixed(2)}</span></span>
              <span className="text-white/50">H <span className="text-[#26a69a]">{lastCandle.high.toFixed(2)}</span></span>
              <span className="text-white/50">L <span className="text-[#ef5350]">{lastCandle.low.toFixed(2)}</span></span>
              <span className="text-white/50">C <span className="text-white">{lastCandle.close.toFixed(2)}</span></span>
              <span className={`flex items-center gap-1 ml-auto ${currentDir !== "down" ? "text-[#26a69a]" : "text-[#ef5350]"}`}>
                {currentDir !== "down" ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {formatCurrency(currentPrice)}/g
              </span>
            </div>
          )}

          {/* Chart */}
          <div className="p-2 md:p-4">
            {candles.length > 0 ? (
              <ResponsiveContainer width="100%" height={340}>
                <ComposedChart data={candles} margin={{ top: 12, right: 56, left: 8, bottom: 8 }}>
                  <CartesianGrid stroke="#1a1a1a" strokeDasharray="0" vertical horizontal />
                  <XAxis
                    dataKey="time"
                    type="category"
                    tick={{ fill: "#666", fontSize: 10 }}
                    axisLine={{ stroke: "#222" }}
                    tickLine={false}
                    interval="preserveStartEnd"
                  />
                  <YAxis
                    domain={yDomain}
                    orientation="right"
                    tick={{ fill: "#888", fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => v.toFixed(2)}
                    width={52}
                  />
                  <Tooltip
                    contentStyle={{ background: "#111", border: "1px solid #333", borderRadius: 4, fontSize: 11, fontFamily: "monospace" }}
                    labelStyle={{ color: "#888" }}
                    formatter={(value, name) => {
                      const labels: Record<string, string> = { open: "O", high: "H", low: "L", close: "C" };
                      const n = value == null ? 0 : Number(value);
                      const key = String(name);
                      return [n.toFixed(2), labels[key] ?? key];
                    }}
                    labelFormatter={(label) => `${label} — 1 min`}
                  />
                  {currentPrice > 0 && (
                    <ReferenceLine
                      y={currentPrice}
                      stroke={currentDir !== "down" ? "#26a69a" : "#ef5350"}
                      strokeDasharray="4 4"
                      strokeWidth={1}
                    />
                  )}
                  <Bar dataKey="close" fill="transparent" isAnimationActive={false} />
                  <Customized component={(props: object) => (
                    <Candlesticks {...props} data={candles} />
                  )} />
                </ComposedChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[340px] flex items-center justify-center text-white/40 text-sm font-mono">
                Loading live candlestick data...
              </div>
            )}
          </div>

          {/* Legend */}
          <div className="px-4 py-2 border-t border-white/10 flex items-center justify-between text-[10px] text-white/40">
            <div className="flex gap-4">
              <span className="flex items-center gap-1.5"><span className="w-2 h-3 bg-[#26a69a] inline-block" /> Price up</span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-3 bg-[#ef5350] inline-block" /> Price down</span>
            </div>
            <span>Updates every 30 seconds · 1-minute candles</span>
          </div>
        </div>
      </div>
    </section>
  );
}
