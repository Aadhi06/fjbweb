"use client";

import { useState, useEffect, useRef, FormEvent } from "react";
import Link from "next/link";
import { SectionHeading } from "@/components/ui/SectionHeading";
import {
  Calculator,
  ArrowRight,
  Plus,
  X,
  Store,
  Scale,
  Layers,
  Banknote,
  CalendarDays,
  Sparkles,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { showFormError, showFormSuccess, showFormWarning } from "@/lib/alerts";
import { useSettings } from "@/lib/useSettings";

const goldCarats = [
  { label: "9ct", purity: 0.375, fallbackRate: 37.68 },
  { label: "18ct", purity: 0.75, fallbackRate: 75.37 },
  { label: "22ct", purity: 0.9167, fallbackRate: 92.05 },
  { label: "24ct", purity: 0.999, fallbackRate: 100.39 },
];

const SILVER_FALLBACK_RATE = 1.35;

interface CartItem {
  id: number;
  metalType: "gold" | "silver";
  caratLabel: string;
  weight: number;
  ratePerGram: number;
  wePayPerGram: number;
  wePay: number;
}

export default function GoldCalculatorPage() {
  const settings = useSettings();
  const [metalType, setMetalType] = useState<"gold" | "silver">("gold");
  const [selectedCarat, setSelectedCarat] = useState(goldCarats[1]);
  const [weight, setWeight] = useState<string>("10");
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [nextId, setNextId] = useState(1);

  const [goldRates, setGoldRates] = useState<Record<string, { market: number; buying: number }>>({});
  const [silverRate, setSilverRate] = useState<{ market: number; buying: number } | null>(null);

  const [showValuationForm, setShowValuationForm] = useState(false);
  const [valuationSubmitting, setValuationSubmitting] = useState(false);
  const [valuationError, setValuationError] = useState("");
  const formRef = useRef<HTMLDivElement>(null);
  const [formLoadedAt] = useState(() => Date.now());

  useEffect(() => {
    async function fetchRates() {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ""}/api/rates`);
        if (!res.ok) return;
        const data = await res.json();
        if (data.gold_carats) {
          const rates: Record<string, { market: number; buying: number }> = {};
          for (const c of data.gold_carats) {
            const match = goldCarats.find((gc) => Math.abs(gc.purity - c.purity) < 0.01);
            if (match) {
              rates[match.label] = { market: c.price_per_gram, buying: c.buying_price_per_gram };
            }
          }
          setGoldRates(rates);
        }
        if (data.data) {
          const silver = data.data.find((m: { metal: string }) => m.metal.toLowerCase() === "silver");
          if (silver) {
            setSilverRate({ market: silver.price_per_gram, buying: silver.buying_price_per_gram });
          }
        }
      } catch {}
    }
    fetchRates();
    const interval = setInterval(fetchRates, 30 * 1000);
    return () => clearInterval(interval);
  }, []);

  const currentBuyingRate = metalType === "silver"
    ? (silverRate?.buying || SILVER_FALLBACK_RATE * 0.95)
    : (goldRates[selectedCarat.label]?.buying || selectedCarat.fallbackRate * 0.95);

  const weightNum = parseFloat(weight) || 0;
  const wePayValue = currentBuyingRate * weightNum;

  function addItem() {
    if (weightNum <= 0) return;
    const item: CartItem = {
      id: nextId,
      metalType,
      caratLabel: metalType === "gold" ? `Gold ${selectedCarat.label}` : "Silver",
      weight: weightNum,
      ratePerGram: currentBuyingRate,
      wePayPerGram: currentBuyingRate,
      wePay: wePayValue,
    };
    setCartItems((prev) => [...prev, item]);
    setNextId((prev) => prev + 1);
    setWeight("10");
  }

  function removeItem(id: number) {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  }

  const grandTotal = cartItems.reduce((sum, item) => sum + item.wePay, 0);

  function handleGetValuation() {
    setShowValuationForm(true);
    setValuationError("");
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  }

  async function handleValuationSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formEl = e.currentTarget;
    setValuationError("");

    const fd = new FormData(formEl);
    const photo = fd.get("photos");
    if (!(photo instanceof File) || photo.size === 0) {
      const message = "Please upload at least one photo of your gold or silver items.";
      setValuationError(message);
      await showFormWarning("Photo Required", message);
      return;
    }

    setValuationSubmitting(true);
    fd.append("_honeypot", "");
    fd.append("_loaded_at", String(formLoadedAt));

    const itemsSummary = cartItems.map((item) =>
      `${item.caratLabel}: ${item.weight}g @ ${formatCurrency(item.wePayPerGram)}/g = ${formatCurrency(item.wePay)}`
    ).join("\n");
    fd.append("gold_items", itemsSummary);
    fd.append("estimated_total", formatCurrency(grandTotal));
    fd.append("items_count", String(cartItems.length));

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8002"}/api/forms/gold-valuation/submit`, {
        method: "POST",
        body: fd,
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        const firstError = errData?.errors
          ? Object.values(errData.errors as Record<string, string[]>)[0]?.[0]
          : null;
        throw new Error(firstError || "Submission failed");
      }
      await showFormSuccess(
        "Thank You!",
        `We've received your valuation request with your gold estimate of ${formatCurrency(grandTotal)}. Our experts will contact you within 24 hours with an exact valuation.`
      );
      formEl.reset();
      setShowValuationForm(false);
    } catch (err) {
      const message = err instanceof Error && err.message !== "Submission failed"
        ? err.message
        : "Something went wrong. Please try again or call us directly.";
      setValuationError(message);
      await showFormError("Submission Failed", message);
    } finally {
      setValuationSubmitting(false);
    }
  }

  return (
    <>
      <section className="bg-black py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Calculator className="w-12 h-12 text-gold mx-auto mb-4" />
          <h1 className="text-3xl md:text-5xl font-serif font-bold text-white mb-4">Gold &amp; Silver Value Calculator</h1>
          <p className="text-white/70 max-w-2xl mx-auto text-lg">Calculate the value of your gold and silver. Add multiple items to get a total estimate.</p>
        </div>
      </section>

      {showValuationForm && (
        <section className="py-12 bg-white border-b border-border" ref={formRef}>
          <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-surface rounded-3xl shadow-xl border border-border p-8 md:p-12">
              <SectionHeading title="Request Exact Valuation" align="left" />
              <p className="text-muted-foreground mb-6">Fill in your details below. Your calculated items and estimated total will be sent to our experts.</p>

              <div className="bg-gold/5 border border-gold/20 rounded-2xl p-5 mb-8">
                <h4 className="text-sm font-bold text-black mb-3">Your Calculated Items</h4>
                <div className="space-y-2">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{item.caratLabel} — {item.weight}g</span>
                      <span className="font-semibold text-gold-dark">{formatCurrency(item.wePay)}</span>
                    </div>
                  ))}
                  <div className="border-t border-gold/20 pt-2 mt-2 flex justify-between">
                    <span className="font-bold text-black">Estimated Total</span>
                    <span className="font-bold text-gold-dark text-lg">{formatCurrency(grandTotal)}</span>
                  </div>
                </div>
              </div>

              <form onSubmit={handleValuationSubmit} className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-secondary mb-2">Full Name <span className="text-destructive">*</span></label>
                    <input type="text" name="name" required placeholder="John Smith" className="w-full px-4 py-3 rounded-xl border border-border bg-white text-secondary placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-secondary mb-2">Email Address <span className="text-destructive">*</span></label>
                    <input type="email" name="email" required placeholder="john@example.com" className="w-full px-4 py-3 rounded-xl border border-border bg-white text-secondary placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-secondary mb-2">Phone Number <span className="text-destructive">*</span></label>
                    <input type="tel" name="phone" required placeholder="07XXX XXXXXX" className="w-full px-4 py-3 rounded-xl border border-border bg-white text-secondary placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-secondary mb-2">Upload Photos <span className="text-destructive">*</span></label>
                    <p className="text-sm text-muted-foreground mb-2">Add at least one clear photo of your gold or silver items.</p>
                    <input
                      type="file"
                      name="photos"
                      required
                      accept="image/*"
                      className="w-full text-sm text-muted-foreground file:mr-4 file:py-3 file:px-6 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer"
                    />
                  </div>

                  <div style={{ position: "absolute", left: "-9999px", opacity: 0, height: 0, overflow: "hidden" }} aria-hidden="true">
                    <input type="text" name="website_url" tabIndex={-1} autoComplete="off" />
                  </div>

                  {valuationError && <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">{valuationError}</div>}

                  <button type="submit" disabled={valuationSubmitting} className="w-full py-4 bg-black text-white font-bold rounded-full hover:bg-black/80 transition-colors shadow-lg disabled:opacity-50 text-base cursor-pointer">
                    {valuationSubmitting ? "Submitting..." : "Request Exact Valuation"}
                  </button>
                </form>
            </div>
          </div>
        </section>
      )}

      <section className="py-10 md:py-16 bg-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-start">

            {/* Left — How to use */}
            <div className="order-1 lg:sticky lg:top-24">
              <div className="bg-white rounded-2xl border border-border p-6 md:p-8 shadow-sm">
                <SectionHeading title="How to Use the Calculator" align="left" />
                <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                  Get an instant estimate of what we pay for your gold or silver based on live market rates. Follow these simple steps:
                </p>

                <ol className="space-y-4 mb-8">
                  {[
                    { icon: Layers, step: "1", title: "Choose your metal", text: "Select Gold or Silver, then pick the carat (9ct–24ct for gold)." },
                    { icon: Scale, step: "2", title: "Enter the weight", text: "Weigh your item in grams — a kitchen scale works for a rough estimate." },
                    { icon: Plus, step: "3", title: "Add each item", text: "Click Add Item for every piece. Mix different carats in one list." },
                    { icon: Banknote, step: "4", title: "See what we pay", text: "Your total updates instantly with our live \"We Pay\" rate per gram." },
                  ].map(({ icon: Icon, step, title, text }) => (
                    <li key={step} className="flex gap-3">
                      <div className="w-9 h-9 bg-gold/10 rounded-lg flex items-center justify-center shrink-0">
                        <Icon className="w-4 h-4 text-gold-dark" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gold-dark mb-0.5">Step {step}</p>
                        <p className="text-sm font-semibold text-black">{title}</p>
                        <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">{text}</p>
                      </div>
                    </li>
                  ))}
                </ol>

                <div className="bg-black rounded-2xl p-5 md:p-6 text-white mb-6">
                  <div className="flex items-start gap-3 mb-3">
                    <Store className="w-5 h-5 text-gold shrink-0 mt-0.5" />
                    <div>
                      <p className="font-serif font-bold text-base mb-1">Visit our shop for a little more</p>
                      <p className="text-white/70 text-sm leading-relaxed">
                        Online estimates are a great guide — but when you visit us in Hatton Garden, our experts inspect your items in person and can often offer a <span className="text-gold font-semibold">slightly better price</span> for jewellery, coins and collectable pieces.
                      </p>
                    </div>
                  </div>
                  <p className="text-white/50 text-xs mb-4 pl-8">{settings.address} · {settings.opening_hours}</p>
                  <Link
                    href="/book-appointment"
                    className="inline-flex items-center justify-center w-full sm:w-auto gap-2 px-5 py-2.5 bg-gold text-black text-sm font-bold rounded-full hover:bg-gold-light transition-colors"
                  >
                    <CalendarDays className="w-4 h-4" />
                    Book a Shop Visit
                  </Link>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Link
                    href="/free-valuation"
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 border border-border text-sm font-semibold text-black rounded-full hover:bg-muted transition-colors"
                  >
                    Get Online Valuation <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link
                    href="/live-rates"
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold text-gold-dark hover:underline"
                  >
                    <Sparkles className="w-4 h-4" />
                    View Live Rates
                  </Link>
                </div>

                <p className="text-[11px] text-muted-foreground mt-5 leading-relaxed">
                  Calculator totals are estimates only. Final price depends on purity testing, condition and current market rates at the time of sale.
                </p>
              </div>
            </div>

            {/* Right — Calculator (compact) */}
            <div className="order-2 space-y-5">
              <div className="bg-white rounded-2xl shadow-lg border border-border p-5 sm:p-6">
                <h2 className="text-lg font-serif font-bold text-black mb-4">Metal Calculator</h2>

                <div className="mb-4">
                  <label className="block text-xs font-semibold text-black mb-2">Metal Type</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setMetalType("gold")}
                      className={`py-2.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${metalType === "gold" ? "bg-black text-white" : "bg-muted text-black hover:bg-border"}`}
                    >
                      Gold
                    </button>
                    <button
                      type="button"
                      onClick={() => setMetalType("silver")}
                      className={`py-2.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${metalType === "silver" ? "bg-black text-white" : "bg-muted text-black hover:bg-border"}`}
                    >
                      Silver
                    </button>
                  </div>
                </div>

                {metalType === "gold" && (
                  <div className="mb-4">
                    <label className="block text-xs font-semibold text-black mb-2">Carat</label>
                    <div className="grid grid-cols-4 gap-1.5">
                      {goldCarats.map((opt) => (
                        <button
                          key={opt.label}
                          type="button"
                          onClick={() => setSelectedCarat(opt)}
                          className={`py-2 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${selectedCarat.label === opt.label ? "bg-black text-white" : "bg-muted text-black hover:bg-border"}`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mb-4">
                  <label className="block text-xs font-semibold text-black mb-2">Weight (grams)</label>
                  <input
                    type="number"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    min="0"
                    step="0.1"
                    className="w-full px-4 py-3 rounded-xl border border-border bg-white text-xl font-bold text-black focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold-dark"
                  />
                </div>

                <div className="bg-surface rounded-xl p-4 space-y-2 border border-border mb-4">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-muted-foreground">
                      We Pay / gram ({metalType === "gold" ? selectedCarat.label : "Silver"})
                    </span>
                    <span className="font-semibold text-gold-dark">{formatCurrency(currentBuyingRate)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-semibold text-black">We Pay ({weightNum}g)</span>
                    <span className="text-xl font-bold text-gold-dark">{formatCurrency(wePayValue)}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={addItem}
                  disabled={weightNum <= 0}
                  className="w-full inline-flex items-center justify-center gap-2 py-3 bg-gold text-black text-sm font-bold rounded-full hover:bg-gold-light transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Plus className="w-4 h-4" /> Add Item
                </button>
              </div>

              {cartItems.length > 0 && (
                <div className="bg-white rounded-2xl border border-border p-5 sm:p-6 shadow-sm">
                  <h3 className="text-base font-serif font-bold text-black mb-3">Your Items ({cartItems.length})</h3>
                  <div className="space-y-2">
                    {cartItems.map((item) => (
                      <div key={item.id} className="flex items-center justify-between rounded-lg border border-border p-3">
                        <div className="flex-1 min-w-0 pr-2">
                          <p className="font-semibold text-black text-xs">{item.caratLabel}</p>
                          <p className="text-[11px] text-muted-foreground">{item.weight}g @ {formatCurrency(item.wePayPerGram)}/g</p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="font-bold text-gold-dark text-sm">{formatCurrency(item.wePay)}</span>
                          <button
                            type="button"
                            onClick={() => removeItem(item.id)}
                            className="p-1 rounded-md hover:bg-red-50 text-muted-foreground hover:text-red-500 cursor-pointer"
                            aria-label="Remove item"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 bg-black rounded-xl p-4 text-center">
                    <p className="text-white/60 text-xs mb-0.5">Total We Pay</p>
                    <p className="text-2xl sm:text-3xl font-bold text-gold">{formatCurrency(grandTotal)}</p>
                  </div>

                  <div className="mt-4 space-y-2">
                    <button
                      type="button"
                      onClick={handleGetValuation}
                      className="w-full inline-flex items-center justify-center gap-2 py-3 bg-black text-white text-sm font-bold rounded-full hover:bg-black/80 transition-colors cursor-pointer"
                    >
                      Get Exact Valuation <ArrowRight className="w-4 h-4" />
                    </button>
                    <Link
                      href="/book-appointment"
                      className="w-full inline-flex items-center justify-center gap-2 py-3 border border-border text-sm font-semibold text-black rounded-full hover:bg-muted transition-colors"
                    >
                      <CalendarDays className="w-4 h-4" /> Visit Shop for Best Price
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
