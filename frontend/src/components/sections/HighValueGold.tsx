import Link from "next/link";
import { ArrowRight, Coins, Landmark, ScrollText } from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";

const lots = [
  {
    title: "Gold bars & bullion",
    text: "PAMP, Perth Mint, Royal Mint and kilo bars — priced as investment gold, not scrap.",
    href: "/sell-gold-bars",
    icon: Landmark,
  },
  {
    title: "Sovereigns & gold coins",
    text: "Sovereigns, Krugerrands and Britannias. Rare dates paid above melt when they deserve it.",
    href: "/sell-gold-coins",
    icon: Coins,
  },
  {
    title: "Inherited gold & estates",
    text: "Whole boxes sorted line by line — jewellery, coins and bars, not one scrap quote.",
    href: "/sell-inherited-gold",
    icon: ScrollText,
  },
];

export function HighValueGold() {
  return (
    <section className="py-16 md:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          label="High-value gold"
          title="Selling more than scrap gold?"
          description="Bars, coins and inherited collections are valued separately. Start here if the lot is worth thousands — not a broken chain."
        />
        <div className="grid md:grid-cols-3 gap-6">
          {lots.map((lot) => {
            const Icon = lot.icon;
            return (
              <Link
                key={lot.href}
                href={lot.href}
                className="group rounded-2xl border border-border bg-surface p-6 md:p-8 hover:border-gold-dark/40 hover:shadow-lg transition-all"
              >
                <div className="w-12 h-12 rounded-xl bg-gold/15 flex items-center justify-center mb-5">
                  <Icon className="w-6 h-6 text-gold-dark" />
                </div>
                <h3 className="font-serif font-bold text-black text-xl mb-2 group-hover:text-gold-dark transition-colors">
                  {lot.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-5">{lot.text}</p>
                <span className="inline-flex items-center text-sm font-semibold text-gold-dark">
                  Sell this gold <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </span>
              </Link>
            );
          })}
        </div>
        <p className="text-center mt-8">
          <Link href="/sell-gold" className="text-sm font-semibold text-gold-dark hover:underline">
            Or sell any gold in the UK — live rates, Hatton Garden or post
          </Link>
        </p>
      </div>
    </section>
  );
}
