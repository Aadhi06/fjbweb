import Link from "next/link";
import Image from "next/image";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ArrowRight, Zap, Banknote, Shield } from "lucide-react";

const brands: {
  name: string;
  logo: string;
  seoLabel: string;
  pieces: string;
  accent?: string;
  href?: string;
}[] = [
  {
    name: "Cartier",
    logo: "/images/brands/cartier.svg",
    seoLabel: "We Buy Cartier",
    pieces: "Love, Juste un Clou, Panthère, Trinity",
  },
  {
    name: "Tiffany & Co.",
    logo: "/images/brands/tiffany.svg",
    seoLabel: "We Buy Tiffany",
    pieces: "Engagement rings, T collections, Elsa Peretti",
    accent: "border-sky-200 bg-sky-50/50",
  },
  {
    name: "Boodles",
    logo: "/images/brands/boodles.svg",
    seoLabel: "We Buy Boodles",
    pieces: "Raindance, Classic Collection, high jewellery",
  },
  {
    name: "Van Cleef & Arpels",
    logo: "/images/brands/van-cleef.svg",
    seoLabel: "We Buy Van Cleef & Arpels",
    pieces: "Alhambra, Vintage, Perlée, Frivole",
  },
  {
    name: "Bulgari",
    logo: "/images/brands/bulgari.svg",
    seoLabel: "We Buy Bulgari",
    pieces: "Serpenti, B.zero1, Divas' Dream",
  },
  {
    name: "Harry Winston",
    logo: "/images/brands/harry-winston.svg",
    seoLabel: "We Buy Harry Winston",
    pieces: "Diamond rings, clusters, high jewellery",
  },
  {
    name: "Chopard",
    logo: "/images/brands/chopard.svg",
    seoLabel: "We Buy Chopard",
    pieces: "Happy Diamonds, Ice Cube, Imperiale",
  },
  {
    name: "Graff",
    logo: "/images/brands/graff.svg",
    seoLabel: "We Buy Graff",
    pieces: "Diamond jewellery, solitaires, suites",
  },
  {
    name: "Chaumet",
    logo: "/images/brands/chaumet.svg",
    seoLabel: "We Buy Chaumet",
    pieces: "Liens, Joséphine, Bee My Love",
  },
  {
    name: "David Yurman",
    logo: "/images/brands/david-yurman.svg",
    seoLabel: "We Buy David Yurman",
    pieces: "Cable bracelets, rings, pendants",
  },
  {
    name: "Piaget",
    logo: "/images/brands/piaget.svg",
    seoLabel: "We Buy Piaget",
    pieces: "Possession, Rose, diamond jewellery",
  },
  {
    name: "Rolex",
    logo: "/images/brands/rolex.svg",
    seoLabel: "We Buy Rolex",
    pieces: "Datejust, Submariner, Day-Date, GMT",
    href: "/services/sell-watches",
  },
];

const brandJsonLd = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: "Designer jewellery brands we buy",
  description:
    "Fine Jewellery Buyers purchases Cartier, Tiffany, Boodles, Van Cleef & Arpels and other luxury brand jewellery for instant cash at best UK prices.",
  itemListElement: brands.map((b, i) => ({
    "@type": "ListItem",
    position: i + 1,
    name: b.seoLabel,
    url: `https://finejewellerybuyers.co.uk${b.href || "/services/sell-jewellery"}`,
  })),
};

export function DesignerBrands() {
  return (
    <section className="py-20 bg-white" id="designer-brands">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(brandJsonLd) }}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center mb-14">
          <div>
            <SectionHeading
              label="Designer & Luxury Brands"
              title="We Buy Cartier, Tiffany, Boodles & Top Jewellery Brands"
              description="Looking to sell designer jewellery? We pay instant cash at the best prices — above scrap gold value for signed Cartier, Tiffany, Boodles, Van Cleef & Arpels and other luxury pieces."
              align="left"
            />
            <div className="grid sm:grid-cols-3 gap-4 mt-8">
              {[
                { icon: Banknote, label: "Instant Cash", sub: "Same-day bank transfer" },
                { icon: Zap, label: "Best Prices", sub: "Brand premium paid" },
                { icon: Shield, label: "Expert Auth", sub: "GIA-trained valuers" },
              ].map(({ icon: Icon, label, sub }) => (
                <div key={label} className="text-center sm:text-left p-4 rounded-xl bg-surface border border-border">
                  <Icon className="w-5 h-5 text-gold-dark mx-auto sm:mx-0 mb-2" />
                  <p className="text-sm font-bold text-black">{label}</p>
                  <p className="text-xs text-muted-foreground">{sub}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-border shadow-xl">
            <Image
              src="/images/designer-brands-hero.png"
              alt="We buy Cartier, Tiffany, Boodles and luxury designer jewellery"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 sm:gap-4">
          {brands.map((brand) => (
            <Link
              key={brand.name}
              href={brand.href || "/services/sell-jewellery"}
              className={`group flex flex-col items-center justify-center text-center p-4 sm:p-5 rounded-xl border border-border bg-white hover:border-gold-dark/40 hover:shadow-lg transition-all duration-200 min-h-[140px] ${brand.accent || "hover:bg-gold/5"}`}
            >
              <div className="h-10 sm:h-11 w-full flex items-center justify-center mb-3 px-1">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={brand.logo}
                  alt={`${brand.name} logo`}
                  className="max-h-full max-w-[90%] w-auto object-contain opacity-90 group-hover:opacity-100 transition-opacity"
                  loading="lazy"
                />
              </div>
              <span className="text-[10px] sm:text-xs font-bold text-gold-dark uppercase tracking-wide mb-1">
                {brand.seoLabel}
              </span>
              <span className="text-[10px] text-muted-foreground leading-tight line-clamp-2 hidden sm:block">
                {brand.pieces}
              </span>
            </Link>
          ))}
        </div>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/services/sell-jewellery"
            className="inline-flex items-center px-8 py-4 bg-black text-white font-bold rounded-full hover:bg-black/90 transition-colors shadow-lg"
          >
            Sell Designer Jewellery <ArrowRight className="w-5 h-5 ml-2" />
          </Link>
          <Link
            href="/free-valuation"
            className="inline-flex items-center px-8 py-4 bg-gold text-black font-bold rounded-full hover:bg-gold-light transition-colors shadow-lg"
          >
            Get Free Brand Valuation <ArrowRight className="w-5 h-5 ml-2" />
          </Link>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6 max-w-3xl mx-auto leading-relaxed">
          We buy authentic Cartier, Tiffany &amp; Co., Boodles, Bulgari, Van Cleef &amp; Arpels, Harry Winston, Chopard, Graff, Chaumet, David Yurman, Piaget and other luxury jewellery brands.
          Instant cash paid on acceptance — visit our Hatton Garden showroom or sell by post nationwide.
        </p>
      </div>
    </section>
  );
}
