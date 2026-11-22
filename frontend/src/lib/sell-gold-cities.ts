import type { LocationFaq, LocationPageContent } from "@/lib/location-pages";

/**
 * Highest-demand UK areas for selling gold / jewellery interest
 * (population + gold search intensity + online sell-gold audience).
 * London stays on /sell-gold-london; these use /sell-gold/{city}.
 */
export type SellGoldCity = {
  city: string;
  slug: string;
  region: string;
  label: string;
  travelNote: string;
  localHook: string;
  faqExtra: LocationFaq;
};

export const SELL_GOLD_CITIES: SellGoldCity[] = [
  {
    city: "Manchester",
    slug: "manchester",
    region: "Greater Manchester",
    label: "Gold buyers · Manchester",
    travelNote: "Direct trains from Manchester Piccadilly to London Euston take about two hours",
    localHook:
      "Manchester consistently ranks among the UK’s strongest cities for gold interest. Many sellers here want Hatton Garden rates without using a high-street cash-for-gold shop.",
    faqExtra: {
      question: "Can I sell gold from Manchester without travelling?",
      answer:
        "Yes. Use our free insured Royal Mail Special Delivery pack from anywhere in Greater Manchester. We open items on camera, confirm the offer, and pay the same day you accept — or return the gold free if you decline. You can also start a free online valuation first.",
    },
  },
  {
    city: "Birmingham",
    slug: "birmingham",
    region: "West Midlands",
    label: "Gold buyers · Birmingham",
    travelNote: "Birmingham New Street to London Euston is typically around 80–90 minutes",
    localHook:
      "Birmingham’s Jewellery Quarter is well known, but many sellers still want a specialist Hatton Garden buyer for scrap gold, bars, coins and designer pieces — with live market-linked rates.",
    faqExtra: {
      question: "Should I sell gold in Birmingham’s Jewellery Quarter or Hatton Garden?",
      answer:
        "Both districts have buyers. Fine Jewellery Buyers is based in Hatton Garden, London, and serves Birmingham by free insured post or an in-person visit. We pay against live market rates with same-day payment on accepted offers — start with a free valuation online if you want a figure before you travel or post.",
    },
  },
  {
    city: "Leeds",
    slug: "leeds",
    region: "West Yorkshire",
    label: "Gold buyers · Leeds",
    travelNote: "Leeds to London King’s Cross takes roughly two to two-and-a-half hours by train",
    localHook:
      "Leeds ranks highly for precious-metals search interest in the UK. Sellers here often compare local shops with Hatton Garden specialists who price against live rates.",
    faqExtra: {
      question: "How do I sell gold from Leeds?",
      answer:
        "Start a free online valuation, post with our free insured pack from Leeds or West Yorkshire, or visit our Hatton Garden showroom in London. Walk-ins are welcome; booking is best for larger collections.",
    },
  },
  {
    city: "Glasgow",
    slug: "glasgow",
    region: "Scotland",
    label: "Gold buyers · Glasgow",
    travelNote: "Most Glasgow customers use our free insured postal service rather than travelling",
    localHook:
      "Glasgow is one of the UK’s strongest cities for gold activity. Scottish sellers routinely use our insured postal valuation to reach Hatton Garden pricing without a high-street intermediary.",
    faqExtra: {
      question: "Do you buy gold from Glasgow and the rest of Scotland?",
      answer:
        "Yes. We buy gold from Glasgow and across Scotland via free insured Royal Mail Special Delivery. Valuations follow live market rates, with same-day payment if you accept. Start with a free online estimate anytime.",
    },
  },
  {
    city: "Liverpool",
    slug: "liverpool",
    region: "Merseyside",
    label: "Gold buyers · Liverpool",
    travelNote: "Liverpool Lime Street to London Euston is typically around two hours 10 minutes",
    localHook:
      "A large share of UK online gold sellers are in major northern cities including Liverpool. We serve Merseyside with Hatton Garden valuations by post or appointment in London.",
    faqExtra: {
      question: "Can I sell scrap gold from Liverpool?",
      answer:
        "Yes. We buy scrap gold, broken chains, coins, bars and jewellery from Liverpool and Merseyside — 9ct to 24ct. Use a free online valuation, our insured postal pack, or visit Hatton Garden.",
    },
  },
  {
    city: "Bristol",
    slug: "bristol",
    region: "South West England",
    label: "Gold buyers · Bristol",
    travelNote: "Bristol Temple Meads to London Paddington is usually under two hours",
    localHook:
      "Bristol and the South West generate steady demand for selling unwanted gold and jewellery. Hatton Garden rates via post or a same-day London visit are popular alternatives to pawnbrokers.",
    faqExtra: {
      question: "Is it worth posting gold from Bristol to Hatton Garden?",
      answer:
        "Many Bristol sellers do. Our pack is free and fully insured; we open on camera and pay the same day you accept. Compare with a free online valuation before you send anything.",
    },
  },
  {
    city: "Newcastle",
    slug: "newcastle",
    region: "North East England",
    label: "Gold buyers · Newcastle",
    travelNote: "Newcastle customers usually sell by free insured post to Hatton Garden",
    localHook:
      "Newcastle ranks among the UK’s most gold-focused cities by search interest. We buy from the North East at live market-linked rates through our insured postal service or a London appointment.",
    faqExtra: {
      question: "Who buys gold in Newcastle?",
      answer:
        "Local shops buy gold in Newcastle, and Fine Jewellery Buyers serves Newcastle remotely from Hatton Garden, London. Free valuation online, free insured post, same-day payment on acceptance.",
    },
  },
  {
    city: "Slough",
    slug: "slough",
    region: "Berkshire",
    label: "Gold buyers · Slough",
    travelNote: "Slough to London Paddington is about 15–20 minutes by train — an easy visit to Hatton Garden",
    localHook:
      "Slough and the Heathrow corridor sit close enough to London that many sellers prefer a short trip to Hatton Garden over a local cash-for-gold counter.",
    faqExtra: {
      question: "Can I visit Hatton Garden from Slough the same day?",
      answer:
        "Yes. Trains from Slough to Paddington are frequent; Hatton Garden is a short Tube or taxi ride from central London. Book a free valuation appointment so a valuer is ready, or walk in during opening hours.",
    },
  },
  {
    city: "Reading",
    slug: "reading",
    region: "Berkshire",
    label: "Gold buyers · Reading",
    travelNote: "Reading to London Paddington is typically around 30 minutes",
    localHook:
      "Reading sellers often want specialist gold buyers rather than high-street pawn. Hatton Garden is a short train journey — or use free insured post from Berkshire.",
    faqExtra: {
      question: "How do I sell gold from Reading?",
      answer:
        "Book a free valuation and visit our Hatton Garden showroom (about half an hour from Reading by train), walk in during opening hours, or send gold with our free insured pack. Start online if you want an estimate first.",
    },
  },
  {
    city: "Romford",
    slug: "romford",
    region: "Essex",
    label: "Gold buyers · Romford & Essex",
    travelNote: "Romford to central London is around 30–40 minutes by Elizabeth line or Greater Anglia",
    localHook:
      "Romford and Essex are strong catchments for selling scrap gold and jewellery into London. Hatton Garden is a straightforward same-day trip from east London and Essex.",
    faqExtra: {
      question: "Do you buy gold from Romford and Essex?",
      answer:
        "Yes. Visit Fine Jewellery Buyers in Hatton Garden from Romford the same day, or sell by free insured post from anywhere in Essex. Free valuations online or in person — no obligation.",
    },
  },
  {
    city: "Croydon",
    slug: "croydon",
    region: "South London",
    label: "Gold buyers · Croydon",
    travelNote: "Croydon to Farringdon / City Thameslink is typically 20–30 minutes to reach Hatton Garden",
    localHook:
      "Croydon and south London generate high demand for selling gold close to the capital. Many customers prefer Hatton Garden specialists over local pawn shops.",
    faqExtra: {
      question: "Where can I sell gold near Croydon?",
      answer:
        "You can sell gold at Fine Jewellery Buyers in Hatton Garden — a short train into central London from Croydon — or use free insured post. Start with a free online valuation or book an appointment.",
    },
  },
];

const FIND_US_FAQ: LocationFaq = {
  question: "How do I find Fine Jewellery Buyers inside 88–90 Hatton Garden?",
  answer:
    "We are Suite 39 on the 4th floor. Security is in the lobby — tell them you are here for Fine Jewellery Buyers. They will call us and open the gate. Take the lift to the 4th floor, turn left, and we are the last office. Press the bell.",
};

function cityFaqs(city: SellGoldCity): LocationFaq[] {
  return [
    FIND_US_FAQ,
    {
      question: `Where can I sell gold in ${city.city}?`,
      answer: `Fine Jewellery Buyers buys gold from ${city.city} and ${city.region}. Visit our Hatton Garden showroom in London for a free in-person valuation, or use free insured post from ${city.city}. Prices follow live market rates, with same-day payment when you accept.`,
    },
    city.faqExtra,
    {
      question: `Do I need an appointment to sell gold from ${city.city}?`,
      answer:
        "Walk-ins are welcome in Hatton Garden during opening hours. Booking a free valuation appointment is recommended for larger lots. For postal sales from anywhere in the UK, start online — no appointment needed.",
    },
    {
      question: `Can I sell scrap gold, bars and coins from ${city.city}?`,
      answer: `Yes. From ${city.city} we buy scrap gold, broken jewellery, dental gold, bars and coins — 9ct to 24ct, hallmarked or unhallmarked. Nothing is too small.`,
    },
    {
      question: "How do I get a free gold valuation?",
      answer:
        "Use our free valuation page to upload photos for an online estimate, book an in-person appointment in Hatton Garden, or walk in during opening hours. There is never an obligation to sell.",
    },
  ];
}

export function buildSellGoldCityPage(city: SellGoldCity): LocationPageContent {
  const path = `/sell-gold/${city.slug}`;
  return {
    slug: `sell-gold-${city.slug}`,
    label: city.label,
    h1: `Sell Gold in ${city.city}`,
    lead: `Sell gold from ${city.city} to Fine Jewellery Buyers — Hatton Garden specialists serving ${city.region}. Get a free valuation online, visit 88–90 Hatton Garden in London, or use free insured post. Live market rates and same-day payment when you accept.`,
    paragraphs: [
      city.localHook,
      `If you want to sell gold in ${city.city}, you do not need a local high-street buyer. Fine Jewellery Buyers is based at 88–90 Hatton Garden, London — the UK jewellery quarter — and buys scrap gold, jewellery, bars and coins from ${city.region} every week. ${city.travelNote}.`,
      `Bring or send 9ct to 24ct gold in any condition. We test and weigh, show the live buying rate, and pay by bank transfer or cash when you accept. Prefer to check first? Start with a free online valuation — no obligation.`,
    ],
    highlights: [
      {
        title: `Serving ${city.city}`,
        text: `Hatton Garden rates for sellers in ${city.city} and ${city.region} — visit London or post free and insured.`,
      },
      {
        title: "Free valuation first",
        text: "Upload photos for a free online estimate, or book an in-person valuation in Hatton Garden.",
      },
      {
        title: "Live market prices",
        text: "We pay against live gold rates. Check today’s prices on Live Rates before you send or travel.",
      },
      {
        title: "Same-day payment",
        text: "Accept the offer and we pay the same day — bank transfer or cash in store.",
      },
    ],
    steps: [
      {
        name: "Get a free valuation",
        text: `Start on our free valuation page from ${city.city}, or book a Hatton Garden appointment.`,
      },
      {
        name: "Visit or post",
        text: "Come to Suite 39, 88–90 Hatton Garden, or send gold with our free insured Royal Mail pack.",
      },
      {
        name: "Get paid",
        text: "Accept the live-rate offer and receive same-day payment. Decline and keep your gold.",
      },
    ],
    howToName: `How to sell gold in ${city.city}`,
    howToDescription: `Sell gold from ${city.city} via free valuation, Hatton Garden visit, or insured UK post with Fine Jewellery Buyers.`,
    faqs: cityFaqs(city),
    heroImage: "/images/service-hero-sell-gold.png",
    related: [
      { name: "Free Valuation", href: "/free-valuation" },
      { name: "Book Appointment", href: "/book-appointment" },
      { name: "Sell Gold in London", href: "/sell-gold-london" },
      { name: "Gold Calculator", href: "/gold-calculator" },
      { name: "Live Rates", href: "/live-rates" },
      { name: "Sell Gold", href: "/sell-gold" },
    ],
    primaryCta: { href: "/free-valuation", label: "Get a free valuation" },
    secondaryCta: { href: "/book-appointment", label: "Book Hatton Garden visit" },
    path,
  };
}

export const SELL_GOLD_CITY_PAGES: Record<string, LocationPageContent> = Object.fromEntries(
  SELL_GOLD_CITIES.map((c) => [c.slug, buildSellGoldCityPage(c)])
);

export function getSellGoldCity(slug: string): LocationPageContent | null {
  return SELL_GOLD_CITY_PAGES[slug] ?? null;
}

export function sellGoldCitySlugs(): string[] {
  return SELL_GOLD_CITIES.map((c) => c.slug);
}
