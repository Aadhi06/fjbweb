"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { SectionHeading } from "@/components/ui/SectionHeading";
import {
  ArrowRight,
  Banknote,
  Calculator,
  CalendarDays,
  RefreshCw,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { API_BASE_URL, formatCurrency } from "@/lib/utils";
import type { MetalRate, GoldCaratRate } from "@/lib/types";

const fallbackRates: MetalRate[] = [
  { metal: "Gold 9ct", price_per_gram: 37.68, price_per_oz: 1171.7, buying_price_per_gram: 32.03, change_24h: 1.2, currency: "GBP", updated_at: new Date().toISOString() },
  { metal: "Gold 14ct", price_per_gram: 58.56, price_per_oz: 1821.5, buying_price_per_gram: 49.78, change_24h: 1.2, currency: "GBP", updated_at: new Date().toISOString() },
  { metal: "Gold 18ct", price_per_gram: 75.37, price_per_oz: 2344.2, buying_price_per_gram: 64.06, change_24h: 1.2, currency: "GBP", updated_at: new Date().toISOString() },
  { metal: "Gold 22ct", price_per_gram: 92.05, price_per_oz: 2862.8, buying_price_per_gram: 78.24, change_24h: 1.2, currency: "GBP", updated_at: new Date().toISOString() },
  { metal: "Gold 24ct", price_per_gram: 100.39, price_per_oz: 3122.5, buying_price_per_gram: 85.33, change_24h: 1.2, currency: "GBP", updated_at: new Date().toISOString() },
  { metal: "Silver", price_per_gram: 1.5, price_per_oz: 46.74, buying_price_per_gram: 1.2, change_24h: 4.22, currency: "GBP", updated_at: new Date().toISOString() },
];

const fallbackCarats: GoldCaratRate[] = [
  { carat: "9ct", purity: 0.375, price_per_gram: 37.68, buying_price_per_gram: 32.03 },
  { carat: "14ct", purity: 14 / 24, price_per_gram: 58.56, buying_price_per_gram: 49.78 },
  { carat: "18ct", purity: 0.75, price_per_gram: 75.37, buying_price_per_gram: 64.06 },
  { carat: "22ct", purity: 0.9167, price_per_gram: 92.05, buying_price_per_gram: 78.24 },
  { carat: "24ct", purity: 0.999, price_per_gram: 100.39, buying_price_per_gram: 85.33 },
];

const FAQS = [
  {
    question: "What do you pay for gold today?",
    answer:
      "We pay a live buying rate per gram for 9ct, 14ct, 18ct, 22ct and 24ct gold. The figures on this page are what we pay today — they update automatically every 30 seconds with the market.",
  },
  {
    question: "How often does today’s gold rate update?",
    answer:
      "Our buying prices refresh every 30 seconds. The rate we apply is the live rate at the time we test, weigh and you accept the offer.",
  },
  {
    question: "Do you buy all gold carats?",
    answer:
      "Yes. We buy 9ct, 14ct, 18ct, 22ct and 24ct gold — jewellery, scrap, broken pieces, coins and bars. Price is set by weight and purity, not condition.",
  },
  {
    question: "How do I sell at today’s gold rate?",
    answer:
      "Walk into our Hatton Garden showroom, or start a free valuation and send items by prepaid insured post from anywhere in the UK. Payment is the same day if you accept.",
  },
];

function formatPurity(purity: number): string {
  const pct = purity * 100;
  const text = pct >= 10 && pct % 1 === 0 ? pct.toFixed(0) : pct.toFixed(1);
  return `${text}% gold`;
}

function formatUpdated(iso?: string): string | null {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function LiveRatesPage() {
  const [rates, setRates] = useState<MetalRate[]>(fallbackRates);
  const [carats, setCarats] = useState<GoldCaratRate[]>(fallbackCarats);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchRates() {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE_URL}/api/rates`);
        if (res.ok) {
          const data = await res.json();
          if (data.data?.length) setRates(data.data);
          if (data.gold_carats?.length) setCarats(data.gold_carats);
        }
      } catch {
        // Keep fallback rates if the API is unreachable.
      } finally {
        setLoading(false);
      }
    }
    fetchRates();
    const interval = setInterval(fetchRates, 30 * 1000);
    return () => clearInterval(interval);
  }, []);

  const silver = rates.find((rate) => rate.metal.toLowerCase() === "silver");
  const goldChange = rates.find((rate) => /gold/i.test(rate.metal))?.change_24h ?? 0;
  const updatedLabel = formatUpdated(rates.find((rate) => rate.updated_at)?.updated_at);

  function changeFor(carat: string): number {
    const match = rates.find((rate) => rate.metal.toLowerCase().includes(carat.toLowerCase()));
    return match?.change_24h ?? goldChange;
  }

  return (
    <>
      <section className="relative overflow-hidden bg-black">
        <div className="absolute inset-0 opacity-[0.07] pointer-events-none" aria-hidden>
          <div className="absolute top-16 right-10 w-72 h-72 bg-gold rounded-full blur-[120px]" />
          <div className="absolute bottom-10 left-16 w-96 h-96 bg-gold-light rounded-full blur-[140px]" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 md:py-20">
          <div className="text-center mb-10 md:mb-12">
            <p className="text-gold font-semibold text-sm uppercase tracking-wider mb-3">Today&apos;s Gold Rate</p>
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-serif font-bold text-white mb-4">
              What We Pay for <span className="text-gold">Gold</span> Today
            </h1>
            <p className="text-white/70 max-w-2xl mx-auto text-lg leading-relaxed">
              Live buying prices for 9ct, 14ct, 18ct, 22ct and 24ct gold — this is what we pay, not a spot market quote.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 mt-5 text-sm text-white/50">
              <span className="inline-flex items-center gap-2">
                <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} aria-hidden />
                <span className="relative flex h-2 w-2" aria-hidden>
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
                </span>
                Live rates — updates every 30 seconds
              </span>
              {updatedLabel && <span>Updated {updatedLabel}</span>}
            </div>
          </div>

          <div id="we-pay" className="scroll-mt-28">
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 lg:gap-5">
              {carats.map((carat) => {
                const change = changeFor(carat.carat);
                const isUp = change >= 0;
                const label = carat.label?.replace(/^Gold\s+/i, "") || carat.carat;
                return (
                  <article
                    key={carat.carat}
                    className="rounded-2xl border border-gold/30 bg-gradient-to-b from-gold/15 to-gold/5 p-4 sm:p-5 text-left hover:border-gold/55 transition-colors duration-200 last:max-lg:col-span-2"
                  >
                    <div className="flex items-start justify-between gap-2 mb-4">
                      <h2 className="font-serif font-bold text-white text-xl sm:text-2xl">{label}</h2>
                      <span
                        className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${
                          isUp ? "bg-green-500/15 text-green-400" : "bg-red-500/15 text-red-400"
                        }`}
                      >
                        {isUp ? <TrendingUp className="w-3 h-3" aria-hidden /> : <TrendingDown className="w-3 h-3" aria-hidden />}
                        {Math.abs(change).toFixed(2)}%
                      </span>
                    </div>
                    <p className="text-[11px] uppercase tracking-wider text-gold/80 font-semibold mb-1">We Pay / gram</p>
                    <p className="text-2xl sm:text-3xl font-serif font-bold text-gold tabular-nums leading-tight">
                      {formatCurrency(carat.buying_price_per_gram)}
                    </p>
                    <p className="text-sm text-white/50 mt-2 tabular-nums">
                      {formatCurrency(carat.buying_price_per_gram * 31.1035)} / troy oz
                    </p>
                    <p className="text-xs text-white/40 mt-1">{formatPurity(carat.purity)}</p>
                  </article>
                );
              })}
            </div>
          </div>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/gold-calculator"
              className="inline-flex items-center justify-center min-h-12 px-8 py-4 bg-gold text-black font-bold rounded-full hover:bg-gold-light transition-colors shadow-lg cursor-pointer"
            >
              <Calculator className="w-5 h-5 mr-2" aria-hidden />
              Calculate Your Gold
            </Link>
            <Link
              href="/free-valuation"
              className="inline-flex items-center justify-center min-h-12 px-8 py-4 border-2 border-gold/40 text-gold font-semibold rounded-full hover:bg-gold/10 transition-colors cursor-pointer"
            >
              Get Free Valuation
              <ArrowRight className="w-5 h-5 ml-2" aria-hidden />
            </Link>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading
            label="Gold Buying Prices"
            title="What We Pay by Carat"
            description="The same live rates as the board above — listed so you can compare each carat at a glance."
          />
          <div className="overflow-x-auto rounded-2xl border border-border">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-surface">
                  <th className="text-left py-4 px-6 text-sm font-semibold text-muted-foreground">Carat</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-muted-foreground hidden sm:table-cell">Purity</th>
                  <th className="text-right py-4 px-6 text-sm font-semibold text-gold-dark">We Pay / gram</th>
                  <th className="text-right py-4 px-6 text-sm font-semibold text-gold-dark hidden md:table-cell">We Pay / troy oz</th>
                </tr>
              </thead>
              <tbody>
                {carats.map((carat) => (
                  <tr key={carat.carat} className="border-b border-border last:border-b-0 hover:bg-muted/50 transition-colors">
                    <td className="py-4 px-6 font-semibold text-black">{carat.label?.replace(/^Gold\s+/i, "") || carat.carat}</td>
                    <td className="py-4 px-6 text-muted-foreground hidden sm:table-cell">{formatPurity(carat.purity)}</td>
                    <td className="py-4 px-6 text-right font-bold text-gold-dark tabular-nums">{formatCurrency(carat.buying_price_per_gram)}</td>
                    <td className="py-4 px-6 text-right font-semibold text-gold-dark/70 tabular-nums hidden md:table-cell">
                      {formatCurrency(carat.buying_price_per_gram * 31.1035)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-sm text-muted-foreground mt-4 text-center">
            Final payment is based on tested purity and exact weight when you accept. Use the calculator for a weight estimate.
          </p>
        </div>
      </section>

      {silver && (
        <section className="py-16 bg-surface">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <SectionHeading label="Silver" title="What We Pay for Silver Today" />
            <div className="bg-white rounded-2xl border border-border p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-2">Sterling &amp; fine silver</p>
                <p className="text-xs text-muted-foreground mb-1">We Pay / gram</p>
                <p className="text-3xl font-serif font-bold text-black tabular-nums">{formatCurrency(silver.buying_price_per_gram)}</p>
                <p className="text-sm text-muted-foreground mt-2 tabular-nums">
                  {formatCurrency(silver.buying_price_per_gram * 31.1035)} / troy oz
                </p>
              </div>
              <Link
                href="/services/sell-silver"
                className="inline-flex items-center justify-center min-h-12 px-6 py-3 border-2 border-gold/40 text-gold-dark font-semibold rounded-full hover:bg-gold/10 transition-colors"
              >
                Sell Silver
                <ArrowRight className="w-4 h-4 ml-2" aria-hidden />
              </Link>
            </div>
          </div>
        </section>
      )}

      <section className="py-16 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading label="Questions" title="Today’s Gold Rate — FAQ" />
          <div className="space-y-4">
            {FAQS.map((faq) => (
              <details key={faq.question} className="group rounded-2xl border border-border bg-surface px-5 py-4">
                <summary className="cursor-pointer list-none font-semibold text-black min-h-11 flex items-center justify-between gap-4">
                  {faq.question}
                  <span className="text-gold-dark text-xl leading-none group-open:rotate-45 transition-transform" aria-hidden>
                    +
                  </span>
                </summary>
                <p className="text-muted-foreground leading-relaxed mt-3 pb-1">{faq.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 gold-gradient">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Banknote className="w-10 h-10 text-white mx-auto mb-4" aria-hidden />
          <h2 className="text-3xl font-serif font-bold text-white mb-4">Ready to sell at today&apos;s gold rate?</h2>
          <p className="text-white/90 mb-8 text-lg">
            Walk in to Hatton Garden or send by prepaid insured post. Same-day payment when you accept.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/free-valuation"
              className="inline-flex items-center justify-center min-h-12 px-8 py-4 bg-black text-white font-bold rounded-full hover:bg-black/80 transition-colors cursor-pointer"
            >
              Get Free Valuation <ArrowRight className="w-5 h-5 ml-2" aria-hidden />
            </Link>
            <Link
              href="/book-appointment"
              className="inline-flex items-center justify-center min-h-12 px-8 py-4 bg-white text-black font-bold rounded-full hover:bg-white/90 transition-colors cursor-pointer"
            >
              <CalendarDays className="w-5 h-5 mr-2" aria-hidden />
              Book Appointment
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
