"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Shield, Star, Zap, CalendarDays, Banknote, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { formatCurrency } from "@/lib/utils";

export function Hero() {
  const [goldRate, setGoldRate] = useState<number>(0);
  const [silverRate, setSilverRate] = useState<number>(0);

  useEffect(() => {
    async function fetchRate() {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8002"}/api/rates?_=${Date.now()}`,
          { cache: "no-store" }
        );
        if (res.ok) {
          const data = await res.json();
          const gold18 = data.data?.find((m: { metal: string }) => m.metal === "Gold 18ct");
          const silver = data.data?.find((m: { metal: string }) => m.metal === "Silver");
          if (gold18) setGoldRate(gold18.buying_price_per_gram);
          if (silver) setSilverRate(silver.buying_price_per_gram);
        }
      } catch {}
    }
    fetchRate();
    const interval = setInterval(fetchRate, 30 * 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative overflow-hidden bg-black">
      <div className="absolute inset-0 opacity-[0.07]">
        <div className="absolute top-20 right-10 w-72 h-72 bg-gold rounded-full blur-[120px]" />
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-gold-light rounded-full blur-[140px]" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* No opacity:0 on first paint — that delayed LCP on mobile (Lighthouse ~8s). */}
          <motion.div initial={false} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: "easeOut" }}>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gold/10 rounded-full text-sm text-gold mb-6 border border-gold/20">
              <Star className="w-4 h-4 fill-gold text-gold" />
              <span className="font-medium">Hatton Garden · London&apos;s Jewellery Quarter</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-white leading-tight mb-6">
              Sell Your{" "}
              <span className="text-gold">Gold</span>{" "}
              for the Best Price in{" "}
              <span className="text-gold">Hatton Garden</span>, London
            </h1>

            <p className="text-lg text-white/70 mb-6 max-w-xl leading-relaxed">
              Instant cash for gold, Cartier, Tiffany, Boodles &amp; designer jewellery at live market rates. Visit our Hatton Garden showroom or sell by post anywhere in the UK — free insured shipping, no hidden fees.
            </p>

            {/* Mobile + tablet: live We Pay preview (desktop shows on hero image) */}
            <Link
              href="/live-rates#we-pay"
              className="lg:hidden block mb-6 group cursor-pointer"
            >
              <div className="rounded-2xl border border-gold/40 bg-gradient-to-r from-gold/15 to-gold/5 p-4 shadow-lg shadow-gold/10">
                <div className="flex items-center justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2">
                    <Banknote className="w-5 h-5 text-gold" />
                    <span className="text-xs font-bold uppercase tracking-wider text-gold">We Pay Today</span>
                  </div>
                  <span className="text-[10px] text-green-400 font-medium">Live · updates every 30s</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-black/40 rounded-xl px-3 py-2.5 border border-white/10">
                    <p className="text-[10px] text-white/50 mb-0.5">Gold 18ct</p>
                    <p className="text-lg font-bold text-gold tabular-nums">
                      {goldRate ? `${formatCurrency(goldRate)}/g` : "…"}
                    </p>
                  </div>
                  <div className="bg-black/40 rounded-xl px-3 py-2.5 border border-white/10">
                    <p className="text-[10px] text-white/50 mb-0.5">Silver</p>
                    <p className="text-lg font-bold text-white tabular-nums">
                      {silverRate ? `${formatCurrency(silverRate)}/g` : "…"}
                    </p>
                  </div>
                </div>
                <p className="flex items-center justify-center gap-1 mt-3 text-sm font-semibold text-white group-hover:text-gold transition-colors">
                  View all buying prices
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </p>
              </div>
            </Link>

            <div className="flex flex-col sm:flex-row flex-wrap gap-4 mb-12">
              <Link href="/live-rates#we-pay" className="lg:hidden inline-flex items-center justify-center px-8 py-4 bg-gold text-black font-bold rounded-full hover:bg-gold-light transition-colors shadow-lg text-base cursor-pointer">
                <Banknote className="w-5 h-5 mr-2" />
                See What We Pay
              </Link>
              <Link href="/free-valuation" className="inline-flex items-center justify-center px-8 py-4 bg-gold text-black font-bold rounded-full hover:bg-gold-light transition-colors shadow-lg text-base cursor-pointer">
                Get Free Valuation <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
              <Link href="/book-appointment" className="inline-flex items-center justify-center px-8 py-4 bg-white text-black font-bold rounded-full hover:bg-white/90 transition-colors shadow-lg text-base cursor-pointer">
                <CalendarDays className="w-5 h-5 mr-2" />
                Book Appointment
              </Link>
              <Link href="/gold-calculator" className="inline-flex items-center justify-center px-8 py-4 border-2 border-gold/40 text-gold font-semibold rounded-full hover:bg-gold/10 transition-colors text-base cursor-pointer">
                Gold Calculator
              </Link>
            </div>

            <div className="grid grid-cols-3 gap-6">
              {[
                { icon: Shield, label: "Fully Insured", sub: "Shipping" },
                { icon: Zap, label: "Instant", sub: "Payment" },
                { icon: Star, label: "4.9★ Rated", sub: "Google Reviews" },
              ].map(({ icon: Icon, label, sub }) => (
                <div key={label} className="text-center sm:text-left">
                  <Icon className="w-5 h-5 text-gold mb-2 mx-auto sm:mx-0" />
                  <p className="text-white font-semibold text-sm">{label}</p>
                  <p className="text-white/50 text-xs">{sub}</p>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div initial={false} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4, ease: "easeOut" }} className="hidden lg:block">
            <div className="relative">
              <div className="rounded-3xl overflow-hidden border border-gold/20 shadow-2xl shadow-gold/10">
                <Image
                  src="/images/scrap-gold-hero.webp"
                  alt="Scrap gold, coins, chains and jewellery we buy"
                  width={1200}
                  height={800}
                  sizes="(max-width: 1024px) 0px, 600px"
                  quality={75}
                  className="w-full h-auto object-cover"
                  priority
                  fetchPriority="high"
                />
              </div>
              <div className="absolute -bottom-4 -left-4 bg-black border border-gold/30 rounded-2xl p-4 shadow-xl">
                <p className="text-xs text-white/60 mb-1">We Pay — Gold 18ct</p>
                <p className="text-2xl font-bold text-gold">{goldRate ? `${formatCurrency(goldRate)} /gram` : "Loading..."}</p>
                <p className="text-xs text-green-400 mt-0.5">Live market-linked rate</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
