"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { TrendingUp, TrendingDown, RefreshCw, Coins } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import type { MetalRate } from "@/lib/types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8002";

const fallbackRates: MetalRate[] = [
  { metal: "Gold 9ct", price_per_gram: 37.68, price_per_oz: 1171.7, buying_price_per_gram: 35.8, change_24h: 0, currency: "GBP", updated_at: "" },
  { metal: "Gold 18ct", price_per_gram: 75.37, price_per_oz: 2344.2, buying_price_per_gram: 71.6, change_24h: 0, currency: "GBP", updated_at: "" },
  { metal: "Gold 22ct", price_per_gram: 92.05, price_per_oz: 2862.8, buying_price_per_gram: 87.45, change_24h: 0, currency: "GBP", updated_at: "" },
  { metal: "Gold 24ct", price_per_gram: 100.39, price_per_oz: 3122.5, buying_price_per_gram: 95.37, change_24h: 0, currency: "GBP", updated_at: "" },
  { metal: "Silver", price_per_gram: 1.5, price_per_oz: 46.74, buying_price_per_gram: 1.43, change_24h: 0, currency: "GBP", updated_at: "" },
];

export function LiveRatesPreview() {
  const [rates, setRates] = useState<MetalRate[]>(fallbackRates);
  const [directions, setDirections] = useState<Record<string, "up" | "down">>({});
  const [loading, setLoading] = useState(false);
  const prevPricesRef = useRef<Record<string, number>>({});

  useEffect(() => {
    async function fetchRates() {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE}/api/rates`);
        if (res.ok) {
          const data = await res.json();
          if (data.data?.length) {
            const updates: Record<string, "up" | "down"> = {};
            for (const rate of data.data as MetalRate[]) {
              const prev = prevPricesRef.current[rate.metal];
              if (prev !== undefined && rate.buying_price_per_gram !== prev) {
                updates[rate.metal] = rate.buying_price_per_gram > prev ? "up" : "down";
              }
              prevPricesRef.current[rate.metal] = rate.buying_price_per_gram;
            }
            if (Object.keys(updates).length) {
              setDirections((d) => ({ ...d, ...updates }));
            }
            setRates(data.data);
          }
        }
      } catch {} finally { setLoading(false); }
    }
    fetchRates();
    const interval = setInterval(fetchRates, 30 * 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section id="we-pay" className="py-20 bg-white scroll-mt-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading label="Live Buying Rates" title="Today's Prices — What We Pay" description="Live market-linked buying rates. Check what we pay before you sell." />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 lg:gap-6">
          {rates.map((rate) => {
            const dir = directions[rate.metal];
            const isUp = dir !== "down";
            return (
              <div key={rate.metal} className="p-5 rounded-2xl border border-border bg-white hover:border-gold-dark/30 hover:shadow-xl transition-all duration-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-8 h-8 rounded-lg bg-gold/10 flex items-center justify-center">
                    <Coins className="w-4 h-4 text-gold-dark" />
                  </div>
                  <div className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${isUp ? "bg-green-50 text-green-600" : "bg-red-50 text-red-500"}`}>
                    {isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    {dir ? (isUp ? "Up" : "Down") : "Live"}
                  </div>
                </div>
                <h3 className="font-semibold text-black text-sm mb-3">{rate.metal}</h3>
                <div>
                  <p className="text-xs text-muted-foreground">We Pay / gram</p>
                  <p className="text-xl font-bold text-gold-dark">{formatCurrency(rate.buying_price_per_gram)}</p>
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : "animate-pulse text-green-500"}`} />
            <span>Live rates — updates every 30 seconds</span>
          </div>
          <Link href="/live-rates" className="text-sm font-semibold text-primary hover:underline cursor-pointer">View Full Rates & Charts →</Link>
        </div>
      </div>
    </section>
  );
}
