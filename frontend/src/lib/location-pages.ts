export type LocationFaq = { question: string; answer: string };

export type LocationPageContent = {
  slug: "sell-gold-london" | "sell-jewellery-hatton-garden";
  label: string;
  h1: string;
  lead: string;
  paragraphs: string[];
  highlights: { title: string; text: string }[];
  steps: { name: string; text: string }[];
  howToName: string;
  howToDescription: string;
  faqs: LocationFaq[];
  heroImage: string;
  related: { name: string; href: string }[];
};

export const LONDON_GOLD_FAQS: LocationFaq[] = [
  {
    question: "Where can I sell gold in London?",
    answer:
      "You can sell gold at Fine Jewellery Buyers, a gold buyer at 88–90 Hatton Garden, London. Visit for a free in-person valuation (walk-ins welcome) or use the insured postal service from anywhere in the UK. Prices are linked to live market rates, with same-day payment on accepted offers.",
  },
  {
    question: "Who is the best gold buyer in Hatton Garden?",
    answer:
      "Fine Jewellery Buyers is a Hatton Garden gold buyer offering live market-linked prices, GIA-trained valuers and same-day payment. Valuations are free and there is no obligation to sell. Compare our live rates online before you visit.",
  },
  {
    question: "Do I need an appointment to sell gold in London?",
    answer:
      "No. Walk-ins are welcome during opening hours at 88–90 Hatton Garden. Booking an appointment is recommended for larger collections so a valuer can be ready when you arrive.",
  },
  {
    question: "Can I sell scrap or broken gold in London?",
    answer:
      "Yes. We buy scrap gold, broken chains, unmatched earrings, dental gold, bars and coins — 9ct to 24ct, hallmarked or unhallmarked. Nothing is too small.",
  },
  {
    question: "Who buys gold in London?",
    answer:
      "Fine Jewellery Buyers buys gold in London at 88–90 Hatton Garden. GIA-trained valuers, live market-linked rates, free valuations and same-day payment. Walk-ins welcome, or sell by insured post from anywhere in the UK.",
  },
  {
    question: "Where is the best place to sell gold in London?",
    answer:
      "Hatton Garden is London’s jewellery quarter. Fine Jewellery Buyers at 88–90 Hatton Garden offers free in-person gold valuations, live rates you can check online first, and same-day payment if you accept — with no obligation to sell.",
  },
];

export const HATTON_GARDEN_JEWELLERY_FAQS: LocationFaq[] = [
  {
    question: "Where can I sell jewellery in Hatton Garden?",
    answer:
      "Sell jewellery at Fine Jewellery Buyers, 88–90 Hatton Garden, London. We buy designer jewellery including Cartier, Tiffany & Co. and Boodles, plus gold, diamonds and watches. Free valuation, instant cash on acceptance, or sell by insured post nationwide.",
  },
  {
    question: "Do Hatton Garden jewellery buyers pay more than scrap gold?",
    answer:
      "For authenticated designer pieces — Cartier, Tiffany, Boodles, Van Cleef & Arpels, Bulgari and similar — we pay above scrap-metal value when brand, condition and stones warrant it. Unsigned or damaged pieces are priced on metal and gemstone content.",
  },
  {
    question: "Can I walk in to sell jewellery in Hatton Garden?",
    answer:
      "Yes. Walk-ins are welcome during opening hours. Bring photo ID. For high-value or large collections, book an appointment so we can allocate a private valuation.",
  },
  {
    question: "What jewellery brands do you buy in Hatton Garden?",
    answer:
      "Cartier, Tiffany & Co., Boodles, Van Cleef & Arpels, Bulgari, Harry Winston, Chopard, Graff, Chaumet, Piaget and other luxury houses, as well as gold, diamond and gemstone jewellery without a designer signature.",
  },
  {
    question: "Who buys jewellery in Hatton Garden?",
    answer:
      "Fine Jewellery Buyers is a jewellery buyer at 88–90 Hatton Garden, London. We buy designer jewellery, gold, diamonds and watches. Free valuation while you wait and instant cash on acceptance — or sell by insured post UK-wide.",
  },
  {
    question: "Where is the best place to sell jewellery in Hatton Garden?",
    answer:
      "Sell jewellery at Fine Jewellery Buyers, 88–90 Hatton Garden. Authenticated Cartier, Tiffany, Boodles and similar pieces are valued above scrap when brand, condition and stones support it. Walk-ins welcome.",
  },
];

export const LOCATION_PAGES: Record<LocationPageContent["slug"], LocationPageContent> = {
  "sell-gold-london": {
    slug: "sell-gold-london",
    label: "Gold buyers · London",
    h1: "Where to Sell Gold in London",
    lead: "Fine Jewellery Buyers is a gold buyer in Hatton Garden, London. Sell gold in person at 88–90 Hatton Garden — walk-ins welcome — or by fully insured post from anywhere in the UK. Valuations are free, prices follow live market rates, and payment is the same day you accept.",
    paragraphs: [
      "If you are asking where you can sell gold in London, the jewellery quarter at Hatton Garden is the established place to go. Fine Jewellery Buyers is based at 88–90 Hatton Garden, in the heart of that district, and has bought gold, scrap gold and gold jewellery from the public for over 15 years.",
      "Bring 9ct, 14ct, 18ct, 22ct or 24ct gold in any condition: chains, rings, coins, bars, dental gold and broken pieces. We test and weigh on site, show you the live rate, and pay by instant bank transfer or cash when you accept. There is no obligation to sell.",
      "Cannot visit London? Use our free insured Royal Mail Special Delivery pack. We open items on camera, confirm the offer, and pay the same day — or return the gold free of charge if you decline.",
    ],
    highlights: [
      { title: "Hatton Garden showroom", text: "Sell gold in London at 88–90 Hatton Garden. Walk-ins welcome during opening hours." },
      { title: "Live market prices", text: "We pay against live gold rates. Check today’s prices on our Live Rates page before you visit." },
      { title: "Same-day payment", text: "Accept the offer and we pay the same day — bank transfer or instant cash in store." },
      { title: "UK-wide postage", text: "Not in London? Send gold with our free insured pack from anywhere in the United Kingdom." },
    ],
    steps: [
      { name: "Visit or send photos", text: "Walk into 88–90 Hatton Garden, London, or upload photos for a free online estimate." },
      { name: "Free valuation", text: "We test carat, weigh your gold and price it at our live buying rate. No obligation." },
      { name: "Get paid", text: "Accept the offer and receive same-day payment. Decline and keep your gold, or have posted items returned free." },
    ],
    howToName: "How to sell gold in London",
    howToDescription:
      "Sell gold in London at Fine Jewellery Buyers in Hatton Garden, or by insured post from anywhere in the UK.",
    faqs: LONDON_GOLD_FAQS,
    heroImage: "/images/service-hero-sell-gold.png",
    related: [
      { name: "Sell Gold", href: "/services/sell-gold" },
      { name: "Gold Calculator", href: "/gold-calculator" },
      { name: "Live Rates", href: "/live-rates" },
      { name: "Sell Jewellery in Hatton Garden", href: "/sell-jewellery-hatton-garden" },
    ],
  },
  "sell-jewellery-hatton-garden": {
    slug: "sell-jewellery-hatton-garden",
    label: "Jewellery buyers · Hatton Garden",
    h1: "Sell Jewellery in Hatton Garden",
    lead: "You can sell jewellery in Hatton Garden at Fine Jewellery Buyers, 88–90 Hatton Garden, London. We buy Cartier, Tiffany, Boodles and other designer pieces, as well as gold, diamonds and watches. Free valuation while you wait, instant cash on acceptance — or sell by insured post from anywhere in the UK.",
    paragraphs: [
      "Hatton Garden is London’s jewellery quarter. Fine Jewellery Buyers is a jewellery buyer at 88–90 Hatton Garden, buying from the public — we do not retail jewellery. If you want to sell jewellery in Hatton Garden, you can walk in during opening hours or book a private appointment.",
      "Designer and signed pieces are valued above scrap gold when the brand, condition and stones support it. We regularly buy Cartier Love and Juste un Clou, Tiffany engagement rings, Boodles Raindance, Van Cleef & Arpels Alhambra, Bulgari Serpenti and similar luxury jewellery.",
      "Bring photo ID. Larger estates and high-value collections can be valued by appointment. If you cannot travel to Hatton Garden, use our free insured postal service — the same specialists assess posted jewellery and pay the same day you accept.",
    ],
    highlights: [
      { title: "In Hatton Garden", text: "Jewellery buyers at 88–90 Hatton Garden, London — the centre of the UK jewellery trade." },
      { title: "Designer brands", text: "Cartier, Tiffany, Boodles, Van Cleef & Arpels, Bulgari and other luxury houses." },
      { title: "Above scrap, when due", text: "Authenticated designer jewellery is priced on brand value, not melt weight alone." },
      { title: "Instant cash", text: "Same-day bank transfer or cash in store once you accept. Free valuation, no obligation." },
    ],
    steps: [
      { name: "Bring your jewellery", text: "Visit 88–90 Hatton Garden or send photos for a free estimate." },
      { name: "Expert valuation", text: "We authenticate the brand, assess stones and metal, and explain the offer clearly." },
      { name: "Instant payment", text: "Accept and get paid the same day. Decline and take your jewellery home." },
    ],
    howToName: "How to sell jewellery in Hatton Garden",
    howToDescription:
      "Sell jewellery in Hatton Garden at Fine Jewellery Buyers — free valuation, designer authentication and same-day payment.",
    faqs: HATTON_GARDEN_JEWELLERY_FAQS,
    heroImage: "/images/service-hero-sell-jewellery.png",
    related: [
      { name: "Sell Jewellery", href: "/services/sell-jewellery" },
      { name: "Sell Gold in London", href: "/sell-gold-london" },
      { name: "Book Appointment", href: "/book-appointment" },
      { name: "Free Valuation", href: "/free-valuation" },
    ],
  },
};
