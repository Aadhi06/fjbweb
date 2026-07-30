import type { Metadata } from "next";

export const SITE_NAME = "Fine Jewellery Buyers";
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
  "https://finejewellerybuyers.co.uk";

export const DEFAULT_OG_IMAGE = `${SITE_URL}/images/logo.png`;
export const DEFAULT_FAVICON = `${SITE_URL}/images/logo.png`;

export function resolveSiteImageUrl(pathOrUrl: string): string {
  if (!pathOrUrl) return DEFAULT_OG_IMAGE;
  if (pathOrUrl.startsWith("http://") || pathOrUrl.startsWith("https://")) return pathOrUrl;
  return `${SITE_URL}${pathOrUrl.startsWith("/") ? pathOrUrl : `/${pathOrUrl}`}`;
}

export const SERVICE_SLUGS = [
  "sell-gold",
  "sell-diamonds",
  "sell-gemstones",
  "sell-watches",
  "sell-jewellery",
  "sell-silver",
  "sell-platinum",
] as const;

type PageSeo = {
  title: string;
  description: string;
  path: string;
  keywords?: string[];
  noIndex?: boolean;
};

export function buildMetadata({
  title,
  description,
  path,
  keywords,
  noIndex,
  ogImage,
}: PageSeo & { ogImage?: string }): Metadata {
  const url = `${SITE_URL}${path}`;
  const fullTitle = path === "/" ? title : `${title} | ${SITE_NAME}`;

  return {
    title: path === "/" ? { absolute: title } : title,
    description,
    keywords,
    alternates: { canonical: url },
    openGraph: {
      title: fullTitle,
      description,
      url,
      siteName: SITE_NAME,
      locale: "en_GB",
      type: "website",
      images: [{ url: ogImage || DEFAULT_OG_IMAGE, width: 1200, height: 630, alt: SITE_NAME }],
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [ogImage || DEFAULT_OG_IMAGE],
    },
    robots: noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true, googleBot: { index: true, follow: true } },
  };
}

export const PAGE_SEO: Record<string, PageSeo> = {
  home: {
    title: "Sell Gold Hatton Garden London | Best Prices & Instant Cash",
    description:
      "Sell gold, Cartier, Tiffany, Boodles and designer jewellery in Hatton Garden, London. Best prices, instant cash, free valuation. Visit our showroom or post insured from anywhere in the UK.",
    path: "/",
    keywords: [
      "Hatton Garden gold buyer",
      "sell gold Hatton Garden",
      "sell gold London",
      "gold buyer London",
      "sell Cartier London",
      "sell Tiffany jewellery London",
      "sell Boodles jewellery",
      "sell designer jewellery",
      "sell gold UK",
      "scrap gold buyers",
      "instant cash jewellery",
    ],
  },
  about: {
    title: "About Us | Hatton Garden Gold & Jewellery Buyers",
    description:
      "Meet the GIA-certified team at Fine Jewellery Buyers. 15+ years buying gold, diamonds, watches and fine jewellery across the UK with transparent, live-market pricing.",
    path: "/about",
  },
  contact: {
    title: "Contact Us | Gold & Jewellery Buyers London",
    description:
      "Contact Fine Jewellery Buyers for a free gold or jewellery valuation. Call, email or visit our Hatton Garden team — we respond within 24 hours.",
    path: "/contact",
  },
  "free-valuation": {
    title: "Free Gold & Jewellery Valuation | No Obligation",
    description:
      "Get a free, no-obligation valuation for your gold, diamonds, watches or jewellery. Upload photos online and receive an expert estimate within 24 hours.",
    path: "/free-valuation",
  },
  "how-it-works": {
    title: "How to Sell Gold in the UK | Simple 5-Step Process",
    description:
      "Learn how to sell gold and jewellery online in the UK. Fill our form, get a free valuation, ship securely with Royal Mail, and receive same-day payment.",
    path: "/how-it-works",
  },
  faq: {
    title: "Gold Buyer FAQs | Selling Gold, Diamonds & Watches",
    description:
      "Answers to common questions about selling gold, scrap gold, diamonds, watches and gemstones in the UK. Pricing, postage, payment and valuation explained.",
    path: "/faq",
  },
  "live-rates": {
    title: "Live Gold & Silver Prices UK | Updated Every 30 Seconds",
    description:
      "View live gold and silver prices in GBP per gram. See what we pay for 9ct, 18ct, 22ct and 24ct gold plus silver — updated every 30 seconds.",
    path: "/live-rates",
  },
  "gold-calculator": {
    title: "Gold Calculator UK | Instant Scrap Gold Value",
    description:
      "Calculate how much your gold or silver is worth with our free UK calculator. Enter weight and carat to see live market value and what we pay today.",
    path: "/gold-calculator",
  },
  "book-appointment": {
    title: "Book a Gold Valuation Appointment | London & Online",
    description:
      "Book an appointment with our expert gold and jewellery valuers. Choose a date and time online for an in-person or consultation booking.",
    path: "/book-appointment",
  },
  blog: {
    title: "Blog | Gold Prices, Selling Tips & Market News",
    description:
      "Expert guides on selling gold, reading live gold prices, diamond valuations and jewellery market news from Fine Jewellery Buyers.",
    path: "/blog",
  },
  privacy: {
    title: "Privacy Policy | Fine Jewellery Buyers",
    description:
      "Privacy Policy for Fine Jewellery Buyers. How we collect, use and protect your personal data when you sell gold or jewellery or use our website.",
    path: "/privacy",
  },
  terms: {
    title: "Terms of Service | Fine Jewellery Buyers",
    description:
      "Terms and conditions for selling gold and jewellery to Fine Jewellery Buyers, using our website, valuations and insured postal service.",
    path: "/terms",
  },
};

export const SERVICE_SEO: Record<
  string,
  { title: string; description: string; keywords: string[] }
> = {
  "sell-gold": {
    title: "Sell Gold UK | Best Scrap & Jewellery Gold Prices",
    description:
      "Sell gold jewellery, scrap gold, bars and coins at live UK market rates. All carats accepted — 9ct to 24ct. Free valuation and same-day payment.",
    keywords: ["sell gold", "sell scrap gold", "gold buyer UK", "sell gold jewellery"],
  },
  "sell-diamonds": {
    title: "Sell Diamonds UK | Certified & Loose Diamond Buyers",
    description:
      "Sell certified or uncertified diamonds, loose stones and diamond jewellery. GIA-trained experts offer fair, transparent valuations across the UK.",
    keywords: ["sell diamonds UK", "diamond buyer", "sell diamond ring"],
  },
  "sell-gemstones": {
    title: "Sell Gemstones UK | Rubies, Sapphires & Emeralds",
    description:
      "Sell rubies, sapphires, emeralds and precious gemstones. Loose or set in jewellery — expert gemological assessment and competitive UK prices.",
    keywords: ["sell gemstones UK", "sell ruby", "sell sapphire"],
  },
  "sell-watches": {
    title: "Sell Luxury Watches UK | Rolex, Omega & Cartier",
    description:
      "Sell Rolex, Omega, Cartier, Patek Philippe and other luxury watches. With or without box and papers — fast valuation and instant payment.",
    keywords: ["sell Rolex UK", "sell luxury watch", "watch buyer London"],
  },
  "sell-jewellery": {
    title: "Sell Cartier, Tiffany & Boodles | Designer Jewellery UK",
    description:
      "We buy Cartier, Tiffany & Co., Boodles, Van Cleef & Arpels, Bulgari and luxury brands. Instant cash, best prices — above scrap gold value for authenticated designer pieces.",
    keywords: [
      "sell Cartier UK",
      "sell Tiffany jewellery",
      "sell Boodles",
      "sell designer jewellery",
      "sell Van Cleef Arpels",
      "sell Bulgari",
      "instant cash jewellery",
      "designer jewellery buyer London",
    ],
  },
  "sell-silver": {
    title: "Sell Silver UK | Sterling Silver & Silverware Buyers",
    description:
      "Sell sterling silver jewellery, silverware, cutlery, bars and coins at live market rates. Hallmarked and unhallmarked silver accepted.",
    keywords: ["sell silver UK", "sterling silver buyer", "sell silverware"],
  },
  "sell-platinum": {
    title: "Sell Platinum UK | Rings, Jewellery & Palladium",
    description:
      "Sell platinum rings, jewellery, bars and palladium items at live market-linked rates. Expert assessment and fast payment across the UK.",
    keywords: ["sell platinum UK", "platinum buyer", "sell palladium"],
  },
};

export function organizationJsonLd(address?: string) {
  const full = (address || "88–90 Hatton Garden, London EC1N 8AA").trim();
  const parts = full.split(",").map((p) => p.trim()).filter(Boolean);
  const last = parts[parts.length - 1] || "";
  const postcodeMatch = last.match(/\b([A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2})\b/i);
  const postalCode = postcodeMatch?.[1]?.toUpperCase() || "";
  const locality = last.replace(postcodeMatch?.[0] || "", "").trim() || "London";
  const streetAddress = parts.length > 1 ? parts.slice(0, -1).join(", ") : full;

  return {
    "@context": "https://schema.org",
    "@type": "JewelryStore",
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/images/logo.png`,
    description:
      "Hatton Garden, London gold and jewellery buyer — gold, scrap gold, diamonds, gemstones, luxury watches and designer brands including Cartier and Tiffany.",
    address: {
      "@type": "PostalAddress",
      streetAddress,
      addressLocality: locality || "London",
      ...(postalCode ? { postalCode } : {}),
      addressRegion: "England",
      addressCountry: "GB",
    },
    areaServed: [
      { "@type": "City", name: "London" },
      { "@type": "Country", name: "United Kingdom" },
    ],
    priceRange: "£££",
    sameAs: [],
  };
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
    potentialAction: {
      "@type": "SearchAction",
      target: `${SITE_URL}/blog?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: `${SITE_URL}${item.path}`,
    })),
  };
}

export function faqJsonLd(faqs: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
    })),
  };
}
