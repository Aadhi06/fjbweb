export type GoldSeoFaq = { question: string; answer: string };

export type GoldSeoPageContent = {
  slug: "sell-gold" | "sell-gold-bars" | "sell-gold-coins" | "sell-inherited-gold";
  label: string;
  h1: string;
  lead: string;
  paragraphs: string[];
  highlights: { title: string; text: string }[];
  steps: { name: string; text: string }[];
  howToName: string;
  howToDescription: string;
  faqs: GoldSeoFaq[];
  heroImage: string;
  valuationItem: string;
  valuationValue: string;
  related: { name: string; href: string }[];
};

export const GOLD_SEO_PAGES: Record<GoldSeoPageContent["slug"], GoldSeoPageContent> = {
  "sell-gold": {
    slug: "sell-gold",
    label: "Gold buyers · United Kingdom",
    h1: "Sell Gold in the UK",
    lead:
      "Sell gold to Fine Jewellery Buyers — a Hatton Garden gold buyer paying live market-linked prices. Jewellery, scrap, bars and coins, 9ct to 24ct. Free valuation, same-day payment, or insured post from anywhere in the UK.",
    paragraphs: [
      "If you want to sell gold in the UK, you need a buyer who prices by live market rates, not a high-street estimate. Fine Jewellery Buyers buys gold from the public at 88–90 Hatton Garden, London, and by fully insured Royal Mail Special Delivery from every postcode in the United Kingdom.",
      "We buy 9ct, 14ct, 18ct, 22ct and 24ct gold in any condition: worn jewellery, broken chains, hallmarked and unhallmarked pieces, dental gold, investment bars and bullion coins. Weight and purity set the price. You can check today’s buying rates on our live rates page before you send a single item.",
      "High-value sellers — gold bars, sovereigns, inherited collections and 18ct or 22ct jewellery — should book a private valuation or upload photos with an expected price. Walk-ins are welcome in Hatton Garden. There is no obligation to sell, and posted items are returned free if you decline.",
    ],
    highlights: [
      { title: "Live UK gold prices", text: "We pay against the live gold market. See 9ct–24ct rates on the site, updated throughout the day." },
      { title: "Same-day payment", text: "Accept the offer and we pay the same day by bank transfer — or cash in store at Hatton Garden." },
      { title: "Bars, coins & jewellery", text: "Investment bars, sovereigns, Krugerrands and jewellery are valued separately from scrap melt when they command a premium." },
      { title: "Sell gold from anywhere in the UK", text: "Free insured postage nationwide. We open items on camera and confirm the offer before you decide." },
    ],
    steps: [
      { name: "Check today’s rate", text: "Use the gold calculator or live rates page so you know the market before you sell gold." },
      { name: "Free valuation", text: "Upload photos or visit 88–90 Hatton Garden. We test carat, weigh the gold and explain the offer." },
      { name: "Get paid", text: "Accept and receive same-day payment. Decline and keep the gold, or have posted items returned at our cost." },
    ],
    howToName: "How to sell gold in the UK",
    howToDescription:
      "Sell gold in the UK to Fine Jewellery Buyers — live rates, free valuation, Hatton Garden showroom or insured post, same-day payment.",
    faqs: [
      {
        question: "Where can I sell gold in the UK?",
        answer:
          "You can sell gold to Fine Jewellery Buyers at 88–90 Hatton Garden, London, or by insured post from anywhere in the UK. We buy 9ct to 24ct jewellery, scrap, bars and coins at live market-linked rates with same-day payment on accepted offers.",
      },
      {
        question: "How much do gold buyers pay in the UK?",
        answer:
          "Reputable gold buyers pay a percentage of the live gold price based on carat and weight. Fine Jewellery Buyers publishes live buying rates for 9ct, 18ct, 22ct and 24ct. Check the calculator before you visit or post.",
      },
      {
        question: "Is it better to sell gold jewellery or melt it as scrap?",
        answer:
          "Scrap and broken gold is priced on melt weight. Signed designer pieces, complete sets and investment bars or coins can be worth more than scrap. We assess both and pay the higher justified price.",
      },
      {
        question: "Can I sell gold without visiting London?",
        answer:
          "Yes. We send a free insured Royal Mail pack. Items are opened on camera, you receive a confirmed offer, and we pay the same day you accept — or return the gold free of charge.",
      },
      {
        question: "What gold items get the highest prices?",
        answer:
          "24ct and 22ct bars, sovereigns, Krugerrands, Britannias and heavy 18ct jewellery typically achieve the highest payouts. Inherited collections and designer gold are valued above scrap when brand and condition support it.",
      },
    ],
    heroImage: "/images/service-hero-sell-gold.png",
    valuationItem: "Gold Jewellery",
    valuationValue: "£2,000 – £5,000",
    related: [
      { name: "Sell Gold in London", href: "/sell-gold-london" },
      { name: "Sell Gold Bars", href: "/sell-gold-bars" },
      { name: "Sell Gold Coins", href: "/sell-gold-coins" },
      { name: "Sell Inherited Gold", href: "/sell-inherited-gold" },
      { name: "Gold Calculator", href: "/gold-calculator" },
      { name: "Live Rates", href: "/live-rates" },
    ],
  },
  "sell-gold-bars": {
    slug: "sell-gold-bars",
    label: "Bullion buyers · UK",
    h1: "Sell Gold Bars in the UK",
    lead:
      "Sell gold bars to a Hatton Garden buyer. We purchase investment bars from 1g to kilo — PAMP, Perth Mint, Royal Mint, Valcambi and others — at live bullion-linked prices with same-day payment.",
    paragraphs: [
      "Selling a gold bar is not the same as selling scrap jewellery. Assay cards, serial numbers, brand and weight all affect the offer. Fine Jewellery Buyers buys allocated and unallocated retail bars from customers across the UK, in person at 88–90 Hatton Garden or by insured post.",
      "Bring or send PAMP Suisse, Perth Mint, Royal Mint, Valcambi, Heraeus, Umicore and other LBMA-recognised bars. We verify weight and purity, check packaging where it still adds value, and price against the live gold market — not a pawnbroker’s fixed rate.",
      "Larger bars and sealed assay packs should be booked as a private valuation. Photo ID is required. If you are selling several bars or a family holding, tell us the expected value on the form so a senior valuer is ready.",
    ],
    highlights: [
      { title: "Investment bars accepted", text: "1g, 5g, 10g, 20g, 1oz, 50g, 100g, 250g, 500g and 1kg bars from recognised refiners." },
      { title: "Assay card premium", text: "Sealed bars in original assay packaging are valued as bullion, not melted scrap." },
      { title: "Private high-value appointments", text: "Book ahead for kilo bars and multi-bar sales so we can settle the same day." },
      { title: "Insured UK postage", text: "High-value bars travel by Royal Mail Special Delivery with declared insurance." },
    ],
    steps: [
      { name: "Photograph the bar", text: "Show the front, back, weight, refiner mark and assay card if you have it." },
      { name: "Private valuation", text: "We confirm weight and fineness and price the bar at our live bullion buying rate." },
      { name: "Same-day settlement", text: "Accept and we pay by bank transfer the same day. Decline and the bar stays yours." },
    ],
    howToName: "How to sell gold bars in the UK",
    howToDescription: "Sell gold bars in the UK — PAMP, Perth Mint, Royal Mint and other investment bars, live prices, same-day payment.",
    faqs: [
      {
        question: "Where can I sell gold bars in the UK?",
        answer:
          "Sell gold bars at Fine Jewellery Buyers, 88–90 Hatton Garden, London, or by insured post. We buy branded investment bars at live bullion-linked rates with same-day payment.",
      },
      {
        question: "Do you buy gold bars without a certificate?",
        answer:
          "Yes. We test and weigh every bar. An assay card and original packaging can improve the offer, but uncarded bars are still purchased at melt or bullion value as appropriate.",
      },
      {
        question: "How are gold bars priced?",
        answer:
          "Price is live gold per gram × fine gold content, minus a published buying margin. Recognised brands in sealed assay packaging often achieve a tighter margin than unmarked melt.",
      },
    ],
    heroImage: "/images/gold-bars-coins.png",
    valuationItem: "Gold bars / bullion",
    valuationValue: "£5,000 – £15,000",
    related: [
      { name: "Sell Gold", href: "/sell-gold" },
      { name: "Sell Gold Coins", href: "/sell-gold-coins" },
      { name: "Live Rates", href: "/live-rates" },
      { name: "Book Appointment", href: "/book-appointment" },
    ],
  },
  "sell-gold-coins": {
    slug: "sell-gold-coins",
    label: "Coin & sovereign buyers · UK",
    h1: "Sell Gold Coins & Sovereigns",
    lead:
      "Sell gold sovereigns, Krugerrands, Britannias and other bullion coins in Hatton Garden or by post. Priced on gold content and collectability — not just scrap weight.",
    paragraphs: [
      "Gold coins are one of the highest-value items we buy. A full sovereign, half sovereign, Krugerrand, Britannia, maple leaf or American eagle is priced on fine gold first. Rare dates, proof issues and complete sets can sit above melt.",
      "Fine Jewellery Buyers is based in Hatton Garden, where UK coin dealing is concentrated. Bring your coins for a same-day offer, or send insured photographs first if you have a large tin or inherited album.",
      "Do not clean coins before you sell. Cleaning can reduce numismatic value. We weigh, identify the issue and explain whether you are selling on bullion or collector value.",
    ],
    highlights: [
      { title: "Sovereigns & halves", text: "Victorian, Edwardian, George and Elizabeth sovereigns bought daily at live gold rates." },
      { title: "Krugerrands & Britannias", text: "1oz and fractional bullion coins from South Africa, the Royal Mint and other mints." },
      { title: "Sets and albums", text: "Inherited coin collections are sorted coin-by-coin so rarer pieces are not melted blindly." },
      { title: "Same-day cash or transfer", text: "Accept in store and leave with payment. Postal sales settle the day you accept." },
    ],
    steps: [
      { name: "List what you have", text: "Note sovereigns, Krugerrands, Britannias and any dates or proof sets." },
      { name: "Valuation", text: "We identify each coin, weigh the gold and check whether any piece is worth more than melt." },
      { name: "Payment", text: "Accept the offer for same-day payment. Keep any coins you do not wish to sell." },
    ],
    howToName: "How to sell gold coins in the UK",
    howToDescription: "Sell gold sovereigns, Krugerrands and Britannias in the UK — Hatton Garden or insured post, live gold prices.",
    faqs: [
      {
        question: "Where can I sell gold sovereigns in the UK?",
        answer:
          "Sell sovereigns at Fine Jewellery Buyers, 88–90 Hatton Garden, or by insured post. We buy full and half sovereigns at live gold rates and check dates for collector premium.",
      },
      {
        question: "Do you buy Krugerrands?",
        answer:
          "Yes. We buy 1oz and fractional Krugerrands, Britannias, maple leafs and similar bullion coins. Price follows live gold plus any justified mint premium.",
      },
      {
        question: "Should I clean old gold coins before selling?",
        answer:
          "No. Cleaning can scratch the surface and reduce collector value. Bring them as they are — we will identify and price them.",
      },
    ],
    heroImage: "/images/gold-bars-coins.png",
    valuationItem: "Gold coins / sovereigns",
    valuationValue: "£2,000 – £5,000",
    related: [
      { name: "Sell Gold", href: "/sell-gold" },
      { name: "Sell Gold Bars", href: "/sell-gold-bars" },
      { name: "Sell Inherited Gold", href: "/sell-inherited-gold" },
      { name: "Gold Calculator", href: "/gold-calculator" },
    ],
  },
  "sell-inherited-gold": {
    slug: "sell-inherited-gold",
    label: "Estate gold · Private clients",
    h1: "Sell Inherited Gold & Estate Jewellery",
    lead:
      "Selling inherited gold needs a careful valuation — jewellery, coins, bars and mixed boxes. Fine Jewellery Buyers offers private Hatton Garden appointments and discreet insured postage for estates.",
    paragraphs: [
      "Inherited gold is often a mix: 9ct chains, 18ct rings, sovereigns in a drawer, a broken bracelet and the odd designer piece. A single scrap quote on the whole box leaves money on the table. We sort metal, stones and coins separately.",
      "Executors and families can book a private valuation at 88–90 Hatton Garden or send a photographed inventory first. We work through probate timescales, explain each line of the offer, and pay by bank transfer in the estate or beneficiary name as instructed.",
      "High-value estates — several ounces of 18ct, bars, or signed jewellery — should use the £5,000+ or £15,000+ expected-price band on the valuation form so a senior valuer handles the file.",
    ],
    highlights: [
      { title: "Whole-box sorting", text: "Jewellery, coins and bars are valued on their own merits, not one melt price for the lot." },
      { title: "Private appointments", text: "Quiet valuations in Hatton Garden for families and executors — book a time that suits." },
      { title: "Clear written offer", text: "You see what we are paying for gold, diamonds and any designer pieces before you decide." },
      { title: "No obligation", text: "Decline any line, keep sentimental pieces, and we still pay for what you choose to sell." },
    ],
    steps: [
      { name: "Photograph the collection", text: "Group jewellery, coins and bars. Note any paperwork, boxes or probate instructions." },
      { name: "Private valuation", text: "We sort the estate, test gold and explain the offer line by line." },
      { name: "Settle what you sell", text: "Accept all or part. Same-day payment. Remaining items go home or back by insured post." },
    ],
    howToName: "How to sell inherited gold in the UK",
    howToDescription:
      "Sell inherited gold and estate jewellery in the UK — private Hatton Garden valuation or insured post, sorted by item, same-day payment.",
    faqs: [
      {
        question: "How do I sell inherited gold in the UK?",
        answer:
          "Photograph the collection or book a private valuation at Fine Jewellery Buyers, 88–90 Hatton Garden. We sort jewellery, coins and bars, give a line-by-line offer, and pay the same day you accept.",
      },
      {
        question: "Can executors sell gold from an estate?",
        answer:
          "Yes. Bring photo ID and estate authority where required. We can pay the estate or a named beneficiary. Ask us before you post high-value items.",
      },
      {
        question: "Should I sell inherited jewellery as scrap?",
        answer:
          "Not until it has been sorted. Designer pieces, diamonds and coins are often worth more than scrap gold. We only melt what has no better market.",
      },
    ],
    heroImage: "/images/service-hero-sell-gold.png",
    valuationItem: "Inherited gold collection",
    valuationValue: "£5,000 – £15,000",
    related: [
      { name: "Sell Gold", href: "/sell-gold" },
      { name: "Sell Jewellery in Hatton Garden", href: "/sell-jewellery-hatton-garden" },
      { name: "Book Appointment", href: "/book-appointment" },
      { name: "Free Valuation", href: "/free-valuation" },
    ],
  },
};
