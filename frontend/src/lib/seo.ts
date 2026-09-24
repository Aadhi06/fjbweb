import type { Metadata } from "next";

export const SITE_NAME = "Fine Jewellery Buyers";
/** Canonical host must match the live redirect target (www). */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
  "https://www.finejewellerybuyers.co.uk";

export const DEFAULT_OG_IMAGE = `${SITE_URL}/images/logo.png`;
export const DEFAULT_FAVICON = `${SITE_URL}/images/logo.png`;

/** 88–90 Hatton Garden, London — used in LocalBusiness schema for ChatGPT / maps. */
export const HATTON_GARDEN_GEO = {
  latitude: 51.5204,
  longitude: -0.1084,
} as const;

/** Primary pages Google may surface as brand sitelinks. */
export const PRIMARY_NAV_LINKS: { name: string; path: string }[] = [
  { name: "Sell Gold in London", path: "/sell-gold-london" },
  { name: "Sell Jewellery in Hatton Garden", path: "/sell-jewellery-hatton-garden" },
  { name: "Free Valuation", path: "/free-valuation" },
  { name: "Live Rates", path: "/live-rates" },
  { name: "Sell Gold", path: "/sell-gold" },
  { name: "Sell Gold Bars", path: "/sell-gold-bars" },
  { name: "Sell Gold Coins", path: "/sell-gold-coins" },
  { name: "Sell Diamonds", path: "/services/sell-diamonds" },
  { name: "Gold Calculator", path: "/gold-calculator" },
  { name: "How It Works", path: "/how-it-works" },
  { name: "Book Appointment", path: "/book-appointment" },
  { name: "About Us", path: "/about" },
  { name: "Contact", path: "/contact" },
  { name: "FAQ", path: "/faq" },
];

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
      "where can I sell gold in London",
      "gold buyer London",
      "sell jewellery in Hatton Garden",
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
  "sell-gold-london": {
    title: "Where to Sell Gold in London | Hatton Garden Gold Buyers",
    description:
      "Sell gold in London at Fine Jewellery Buyers, 88–90 Hatton Garden. Free in-person valuation, live market rates, same-day payment. Walk-ins welcome or sell by post UK-wide.",
    path: "/sell-gold-london",
    keywords: [
      "where can I sell gold in London",
      "sell gold London",
      "gold buyer London",
      "Hatton Garden gold buyer",
      "sell scrap gold London",
      "best gold buyers London",
    ],
  },
  "sell-jewellery-hatton-garden": {
    title: "Sell Jewellery in Hatton Garden | Instant Cash London",
    description:
      "Sell jewellery in Hatton Garden at Fine Jewellery Buyers, 88–90 Hatton Garden, London. Cartier, Tiffany, Boodles, gold and diamonds. Free valuation and instant cash.",
    path: "/sell-jewellery-hatton-garden",
    keywords: [
      "sell jewellery in Hatton Garden",
      "sell jewellery Hatton Garden",
      "Hatton Garden jewellery buyers",
      "where to sell jewellery in Hatton Garden",
      "sell designer jewellery London",
      "Hatton Garden gold and jewellery buyer",
    ],
  },
  "sell-gold": {
    title: "Sell Gold UK | Live Prices, Same-Day Payment",
    description:
      "Sell gold in the UK to Fine Jewellery Buyers. Jewellery, scrap, bars and coins — 9ct to 24ct at live market rates. Free valuation, Hatton Garden or insured post, same-day payment.",
    path: "/sell-gold",
    keywords: [
      "sell gold",
      "sell gold UK",
      "gold buyer UK",
      "sell gold near me",
      "where to sell gold",
      "gold buyers",
      "sell scrap gold",
      "sell gold jewellery",
    ],
  },
  "sell-gold-bars": {
    title: "Sell Gold Bars UK | PAMP, Perth Mint & Kilo Bars",
    description:
      "Sell gold bars in the UK — PAMP, Perth Mint, Royal Mint and other investment bars. Live bullion-linked prices, private Hatton Garden valuation or insured post, same-day payment.",
    path: "/sell-gold-bars",
    keywords: [
      "sell gold bars",
      "sell gold bars UK",
      "sell gold bar",
      "gold bar buyers UK",
      "sell PAMP gold bar",
      "sell kilo gold bar",
    ],
  },
  "sell-gold-coins": {
    title: "Sell Gold Coins & Sovereigns UK | Krugerrands Bought",
    description:
      "Sell gold sovereigns, Krugerrands and Britannias in the UK. Hatton Garden coin buyers — live gold prices, collector premium when due, same-day payment.",
    path: "/sell-gold-coins",
    keywords: [
      "sell gold coins",
      "sell gold sovereigns",
      "sell Krugerrands",
      "gold coin buyers UK",
      "sell Britannia coins",
      "sell half sovereigns",
    ],
  },
  "sell-inherited-gold": {
    title: "Sell Inherited Gold UK | Estate Jewellery Buyers",
    description:
      "Sell inherited gold and estate jewellery in the UK. Private Hatton Garden valuation or insured post. Jewellery, coins and bars sorted line by line — not one scrap quote.",
    path: "/sell-inherited-gold",
    keywords: [
      "sell inherited gold",
      "sell inherited jewellery",
      "estate gold buyers UK",
      "sell gold from probate",
      "inherited gold valuation",
    ],
  },
};

export const SERVICE_SEO: Record<
  string,
  { title: string; description: string; keywords: string[] }
> = {
  "sell-gold": {
    title: "Sell Gold in London | Hatton Garden Gold Buyers",
    description:
      "Sell gold in London at Fine Jewellery Buyers, Hatton Garden. Scrap gold, jewellery, bars and coins — 9ct to 24ct at live rates. Free valuation and same-day payment.",
    keywords: [
      "sell gold London",
      "where to sell gold in London",
      "Hatton Garden gold buyer",
      "gold buyer London",
      "sell scrap gold London",
      "sell gold",
      "gold buyer UK",
    ],
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
    title: "Sell Jewellery in Hatton Garden | Designer Jewellery Buyers",
    description:
      "Sell jewellery in Hatton Garden, London. Cartier, Tiffany, Boodles and designer pieces — free valuation, instant cash, above scrap gold value when authenticated.",
    keywords: [
      "sell jewellery Hatton Garden",
      "sell jewellery in Hatton Garden",
      "Hatton Garden jewellery buyers",
      "sell designer jewellery London",
      "sell Cartier UK",
      "sell Tiffany jewellery",
      "sell Boodles",
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

export type OrganizationJsonLdInput = {
  address?: string;
  phone?: string;
  email?: string;
  openingHours?: string;
  googleReviewUrl?: string;
  trustpilotUrl?: string;
};

function parsePostalAddress(address?: string) {
  const full = (address || "88–90 Hatton Garden, London EC1N 8AA").trim();
  const parts = full.split(",").map((p) => p.trim()).filter(Boolean);
  const last = parts[parts.length - 1] || "";
  const postcodeMatch = last.match(/\b([A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2})\b/i);
  const postalCode = postcodeMatch?.[1]?.toUpperCase() || "";
  const locality = last.replace(postcodeMatch?.[0] || "", "").trim() || "London";
  const streetAddress = parts.length > 1 ? parts.slice(0, -1).join(", ") : full;
  return { full, streetAddress, locality, postalCode };
}

export function organizationJsonLd(input?: OrganizationJsonLdInput | string) {
  const opts: OrganizationJsonLdInput = typeof input === "string" ? { address: input } : input || {};
  const { full, streetAddress, locality, postalCode } = parsePostalAddress(opts.address);
  const mapsQuery = encodeURIComponent(full);

  return {
    "@context": "https://schema.org",
    "@type": ["JewelryStore", "LocalBusiness"],
    "@id": `${SITE_URL}/#business`,
    name: SITE_NAME,
    alternateName: ["FJB", "Fine Jewellery Buyers Hatton Garden", "Fine Jewellery Buyers London"],
    url: SITE_URL,
    logo: `${SITE_URL}/images/logo.png`,
    image: [`${SITE_URL}/images/hatton-garden-building.jpg`, `${SITE_URL}/images/logo.png`],
    description:
      "Gold and jewellery buyer in Hatton Garden, London. Sell gold, scrap gold, diamonds, gemstones, luxury watches and designer jewellery including Cartier, Tiffany and Boodles. Free valuations, live market-linked prices, same-day payment.",
    slogan: "Sell gold and jewellery in Hatton Garden, London",
    telephone: opts.phone || undefined,
    email: opts.email || undefined,
    address: {
      "@type": "PostalAddress",
      streetAddress,
      addressLocality: locality || "London",
      ...(postalCode ? { postalCode } : {}),
      addressRegion: "England",
      addressCountry: "GB",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: HATTON_GARDEN_GEO.latitude,
      longitude: HATTON_GARDEN_GEO.longitude,
    },
    hasMap: `https://www.google.com/maps/search/?api=1&query=${mapsQuery}`,
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
        opens: "10:00",
        closes: "18:00",
      },
    ],
    openingHours: opts.openingHours || "Mo-Sa 10:00-18:00",
    areaServed: [
      { "@type": "City", name: "London" },
      { "@type": "AdministrativeArea", name: "Hatton Garden" },
      { "@type": "Country", name: "United Kingdom" },
    ],
    knowsAbout: [
      "selling gold in London",
      "sell gold UK",
      "Hatton Garden gold buyers",
      "selling jewellery in Hatton Garden",
      "sell gold bars",
      "sell gold sovereigns",
      "inherited gold valuation",
      "scrap gold valuation",
      "designer jewellery buying",
    ],
    currenciesAccepted: "GBP",
    paymentAccepted: "Cash, Bank Transfer",
    priceRange: "£££",
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Jewellery buying services",
      itemListElement: [
        { "@type": "Offer", itemOffered: { "@type": "Service", name: "Sell gold in London", url: `${SITE_URL}/sell-gold-london` } },
        { "@type": "Offer", itemOffered: { "@type": "Service", name: "Sell jewellery in Hatton Garden", url: `${SITE_URL}/sell-jewellery-hatton-garden` } },
        { "@type": "Offer", itemOffered: { "@type": "Service", name: "Sell gold", url: `${SITE_URL}/sell-gold` } },
        { "@type": "Offer", itemOffered: { "@type": "Service", name: "Sell gold bars", url: `${SITE_URL}/sell-gold-bars` } },
        { "@type": "Offer", itemOffered: { "@type": "Service", name: "Sell gold coins", url: `${SITE_URL}/sell-gold-coins` } },
        { "@type": "Offer", itemOffered: { "@type": "Service", name: "Sell inherited gold", url: `${SITE_URL}/sell-inherited-gold` } },
        { "@type": "Offer", itemOffered: { "@type": "Service", name: "Sell jewellery", url: `${SITE_URL}/services/sell-jewellery` } },
        { "@type": "Offer", itemOffered: { "@type": "Service", name: "Sell diamonds", url: `${SITE_URL}/services/sell-diamonds` } },
        { "@type": "Offer", itemOffered: { "@type": "Service", name: "Sell watches", url: `${SITE_URL}/services/sell-watches` } },
      ],
    },
    contactPoint: opts.phone
      ? {
          "@type": "ContactPoint",
          telephone: opts.phone,
          contactType: "customer service",
          areaServed: "GB",
          availableLanguage: ["English"],
        }
      : undefined,
    sameAs: [opts.googleReviewUrl, opts.trustpilotUrl].filter(
      (url): url is string => Boolean(url && url.startsWith("http"))
    ),
  };
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    alternateName: ["FJB", "Fine Jewellery Buyers UK"],
    url: SITE_URL,
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
      logo: `${SITE_URL}/images/logo.png`,
    },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/blog?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

/** Helps Google understand primary navigation for brand sitelinks. */
export function siteNavigationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `${SITE_NAME} main navigation`,
    itemListElement: PRIMARY_NAV_LINKS.map((link, i) => ({
      "@type": "SiteNavigationElement",
      position: i + 1,
      name: link.name,
      url: `${SITE_URL}${link.path}`,
    })),
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

export function speakableWebPageJsonLd(opts: {
  path: string;
  name: string;
  description: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${SITE_URL}${opts.path}#webpage`,
    url: `${SITE_URL}${opts.path}`,
    name: opts.name,
    description: opts.description,
    inLanguage: "en-GB",
    isPartOf: { "@id": `${SITE_URL}/#business` },
    about: { "@id": `${SITE_URL}/#business` },
    mainEntity: { "@id": `${SITE_URL}/#business` },
    speakable: {
      "@type": "SpeakableSpecification",
      cssSelector: [".ai-direct-answer", "h1"],
    },
  };
}

export function howToJsonLd(opts: {
  name: string;
  description: string;
  steps: { name: string; text: string }[];
}) {
  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: opts.name,
    description: opts.description,
    step: opts.steps.map((step, i) => ({
      "@type": "HowToStep",
      position: i + 1,
      name: step.name,
      text: step.text,
    })),
  };
}
