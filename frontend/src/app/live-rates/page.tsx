"use client";

import { useEffect, useState } from "react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { TrendingUp, TrendingDown, RefreshCw, Coins } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import type { MetalRate, GoldCaratRate } from "@/lib/types";

const fallbackRates: MetalRate[] = [
  { metal: "Gold 9ct", price_per_gram: 37.68, price_per_oz: 1171.7, buying_price_per_gram: 35.8, change_24h: 1.2, currency: "GBP", updated_at: new Date().toISOString() },
  { metal: "Gold 18ct", price_per_gram: 75.37, price_per_oz: 2344.2, buying_price_per_gram: 71.6, change_24h: 1.2, currency: "GBP", updated_at: new Date().toISOString() },
  { metal: "Gold 22ct", price_per_gram: 92.05, price_per_oz: 2862.8, buying_price_per_gram: 87.45, change_24h: 1.2, currency: "GBP", updated_at: new Date().toISOString() },
  { metal: "Gold 24ct", price_per_gram: 100.39, price_per_oz: 3122.5, buying_price_per_gram: 95.37, change_24h: 1.2, currency: "GBP", updated_at: new Date().toISOString() },
  { metal: "Silver", price_per_gram: 1.5, price_per_oz: 46.74, buying_price_per_gram: 1.43, change_24h: 4.22, currency: "GBP", updated_at: new Date().toISOString() },
];

const fallbackCarats: GoldCaratRate[] = [
  { carat: "9ct", purity: 0.375, price_per_gram: 37.68, buying_price_per_gram: 35.8 },
  { carat: "18ct", purity: 0.75, price_per_gram: 75.37, buying_price_per_gram: 71.6 },
  { carat: "22ct", purity: 0.9167, price_per_gram: 92.05, buying_price_per_gram: 87.45 },
  { carat: "24ct", purity: 0.999, price_per_gram: 100.39, buying_price_per_gram: 95.37 },
];

export default function LiveRatesPage() {
  const [rates, setRates] = useState<MetalRate[]>(fallbackRates);
  const [carats, setCarats] = useState<GoldCaratRate[]>(fallbackCarats);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchRates() {
      try {
        setLoading(true);
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ""}/api/rates`);
        if (res.ok) {
          const data = await res.json();
          if (data.data?.length) setRates(data.data);
          if (data.gold_carats?.length) setCarats(data.gold_carats);
        }
      } catch {} finally { setLoading(false); }
    }
    fetchRates();
    const interval = setInterval(fetchRates, 30 * 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <section className="bg-black py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl md:text-5xl font-serif font-bold text-white mb-4">Live Gold &amp; Silver Prices UK</h1>
          <p className="text-white/70 max-w-2xl mx-auto text-lg">Real-time market-linked prices for gold and silver.</p>
          <div className="flex items-center justify-center gap-2 mt-4 text-sm text-white/50">
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : "animate-pulse"}`} /><span>Live rates — updates automatically</span>
          </div>
        </div>
      </section>

      <section id="we-pay" className="py-16 bg-surface scroll-mt-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading label="We Pay" title="Current Buying Prices" />
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 lg:gap-6">
            {rates.map((rate) => {
              const isUp = rate.change_24h >= 0;
              return (
                <div key={rate.metal} className="bg-white p-5 rounded-2xl border border-border hover:shadow-xl transition-all duration-200">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-8 h-8 rounded-lg bg-gold/10 flex items-center justify-center">
                      <Coins className="w-4 h-4 text-gold-dark" />
                    </div>
                    <span className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${isUp ? "bg-green-50 text-green-600" : "bg-red-50 text-red-500"}`}>
                      {isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}{Math.abs(rate.change_24h).toFixed(2)}%
                    </span>
                  </div>
                  <h3 className="font-bold text-black text-sm mb-3">{rate.metal}</h3>
                  <div className="space-y-2">
                    <div>
                      <p className="text-xs text-muted-foreground">We Pay / gram</p>
                      <p className="text-xl font-bold text-gold-dark">{formatCurrency(rate.buying_price_per_gram)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">We Pay / Troy Oz</p>
                      <p className="text-sm font-semibold text-gold-dark/70">{formatCurrency(rate.buying_price_per_gram * 31.1035)}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading label="Gold Prices" title="Gold Price by Carat" />
          <div className="overflow-x-auto rounded-2xl border border-border">
            <table className="w-full">
              <thead><tr className="border-b border-border bg-surface">
                <th className="text-left py-4 px-6 text-sm font-semibold text-muted-foreground">Carat</th>
                <th className="text-right py-4 px-6 text-sm font-semibold text-gold-dark">We Pay / gram</th>
              </tr></thead>
              <tbody>{carats.map((c) => (
                <tr key={c.carat} className="border-b border-border hover:bg-muted/50 transition-colors">
                  <td className="py-4 px-6 font-semibold text-black">{("label" in c && c.label) || c.carat}</td>
                  <td className="py-4 px-6 text-right font-bold text-gold-dark">{formatCurrency(c.buying_price_per_gram)}</td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        </div>
      </section>
    </>
  );
}
