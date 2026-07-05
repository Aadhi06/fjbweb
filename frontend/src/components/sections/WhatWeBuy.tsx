import Link from "next/link";
import Image from "next/image";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ArrowRight } from "lucide-react";

const categories = [
  { title: "Gold (All Carats)", description: "We buy all gold — 9ct, 14ct, 18ct, 22ct, 24ct. Jewellery, bars, coins, and bullion at live rates.", image: "/images/gold-carats.png", href: "/services/sell-gold" },
  { title: "Scrap Gold", description: "Broken chains, old rings, dental gold, gold dust — any condition accepted at top prices.", image: "/images/gold-scrap.png", href: "/services/sell-gold" },
  { title: "Diamonds", description: "Loose diamonds, diamond jewellery, certified and non-certified. All shapes and sizes.", image: "/images/diamond-loose.png", href: "/services/sell-diamonds" },
  { title: "Gemstones", description: "Rubies, sapphires, emeralds, and other precious gemstones — loose or set in jewellery.", image: "/images/gemstones-precious.png", href: "/services/sell-gemstones" },
  { title: "Luxury Watches", description: "Rolex, Omega, Cartier, Patek Philippe, Audemars Piguet, and other luxury brands.", image: "/images/watches-luxury.png", href: "/services/sell-watches" },
  { title: "Designer Jewellery", description: "Cartier, Tiffany & Co., Boodles, Van Cleef & Arpels, Bulgari — instant cash, best prices for signed pieces.", image: "/images/jewellery-designer.png", href: "/services/sell-jewellery" },
  { title: "Silver & Platinum", description: "Silver, platinum, and palladium jewellery, bars, coins, and items at live market rates.", image: "/images/silver-platinum-combined.png", href: "/services/sell-silver" },
];

export function WhatWeBuy() {
  return (
    <section className="py-20 bg-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading label="What We Buy" title="UK's Leading Gold & Precious Metal Buyers" description="We specialise in buying gold at the best prices. From scrap gold and diamonds to gemstones and luxury watches — get expert valuations at live market rates." />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((cat) => (
            <Link key={cat.title} href={cat.href} className="group overflow-hidden rounded-2xl border border-border hover:border-gold-dark/30 hover:shadow-xl transition-all duration-300 bg-white cursor-pointer">
              <div className="relative aspect-[16/10] overflow-hidden bg-muted">
                <Image
                  src={cat.image}
                  alt={cat.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-serif font-bold text-black mb-2 group-hover:text-gold-dark transition-colors duration-200">{cat.title}</h3>
                <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{cat.description}</p>
                <span className="inline-flex items-center text-sm font-semibold text-gold-dark">
                  Sell Now <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform duration-200" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
