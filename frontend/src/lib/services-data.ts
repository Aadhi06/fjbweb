import {
  CircleDollarSign,
  Diamond,
  Watch,
  Gem,
  Coins,
  Sparkles,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type ServiceDetail = {
  label: string;
  description: string;
  image: string;
};

export type ServiceStep = {
  title: string;
  text: string;
};

export type ServiceFaq = {
  question: string;
  answer: string;
};

export type ServiceData = {
  title: string;
  heading: string;
  description: string;
  heroImage: string;
  intro: string[];
  highlights: string[];
  details: ServiceDetail[];
  steps: ServiceStep[];
  faqs: ServiceFaq[];
  icon: LucideIcon;
};

export const servicesData: Record<string, ServiceData> = {
  "sell-gold": {
    title: "Sell Gold",
    heading: "Sell Your Gold for the Best Price in Hatton Garden, London",
    description:
      "We buy all types of gold — 9ct, 14ct, 18ct, 22ct, 24ct. Scrap gold, jewellery, bars, coins and dental gold at live market rates with same-day payment.",
    heroImage: "/images/service-hero-sell-gold.png",
    icon: CircleDollarSign,
    intro: [
      "Whether you have broken chains, inherited rings, old coins or a full collection of gold bars, Fine Jewellery Buyers offers some of the most competitive gold prices in the UK. Our prices are linked to live market rates, updated every 30 seconds, so you always know exactly what your gold is worth before you sell.",
      "We accept all carats from 9ct to 24ct, hallmarked or unhallmarked, in any condition. Many customers sell scrap gold they no longer wear — tangled chains, single earrings, dental gold and even gold dust. Nothing is too small or too unusual for our expert team.",
      "Based in Hatton Garden, London's famous jewellery quarter, we have over 15 years of experience buying gold from customers across the UK. Send your items via our free, fully insured Royal Mail service or visit us in person for an instant valuation.",
    ],
    highlights: [
      "Live gold prices updated every 30 seconds",
      "All carats: 9ct, 14ct, 18ct, 22ct and 24ct",
      "Same-day bank transfer once offer accepted",
      "Free insured postage from anywhere in the UK",
      "No hidden fees — price agreed is price paid",
    ],
    details: [
      { label: "All Gold Carats Accepted", description: "9ct, 14ct, 18ct, 22ct and 24ct — we price each piece by purity and weight at live rates.", image: "/images/gold-carats.png" },
      { label: "Scrap & Broken Gold", description: "Broken chains, snapped rings, single earrings, dental gold and mismatched sets all welcome.", image: "/images/gold-scrap.png" },
      { label: "Gold Bars & Bullion Coins", description: "Investment-grade bars and sovereigns, krugerrands, Britannias and other bullion coins.", image: "/images/gold-bars-coins.png" },
      { label: "Hallmarked & Unhallmarked", description: "We test and assay all gold on-site. Hallmarks help, but unhallmarked items are fully accepted.", image: "/images/gold-hallmarks.png" },
      { label: "Live Market Pricing", description: "Our 'We Pay' rates track the live gold market — see today's price on our calculator before you sell.", image: "/images/gold-live-rates.png" },
      { label: "Gold Dust & Dental Gold", description: "Dental crowns, bridges and gold filings — specialist items priced fairly by fine gold content.", image: "/images/gold-dust-dental.png" },
    ],
    steps: [
      { title: "Get a free estimate", text: "Use our gold calculator or fill in our online valuation form with photos." },
      { title: "Send securely", text: "We post you a free, fully insured Special Delivery pack to your door." },
      { title: "Expert testing", text: "We weigh, test and inspect every item on camera for full transparency." },
      { title: "Get paid today", text: "Accept our offer and receive an instant bank transfer the same day." },
    ],
    faqs: [
      { question: "Where can I sell gold in London?", answer: "Visit Fine Jewellery Buyers at 88–90 Hatton Garden, London for a free in-person valuation, or sell by insured post from anywhere in the UK. Walk-ins welcome; same-day payment on accepted offers." },
      { question: "How is my gold price calculated?", answer: "We multiply the weight of your gold by its purity (carat) and our live buying rate per gram. You can see today's rates on our Live Rates page." },
      { question: "Do you buy unhallmarked gold?", answer: "Yes. We use professional testing equipment to verify gold content regardless of hallmarks." },
      { question: "Is there a minimum amount of gold I can sell?", answer: "No minimum. Whether it's a single broken chain or a large collection, we offer the same professional service." },
    ],
  },
  "sell-diamonds": {
    title: "Sell Diamonds",
    heading: "Sell Your Diamonds with Confidence",
    description: "Certified or uncertified, loose or set — we buy all diamonds. GIA-trained experts ensure fair, transparent valuations at competitive UK prices.",
    heroImage: "/images/service-hero-sell-diamonds.png",
    icon: Diamond,
    intro: [
      "Selling a diamond can feel daunting — especially without a GIA certificate or when the piece holds sentimental value. Our GIA-trained gemologists assess every stone individually, considering cut, colour, clarity, carat weight and current market demand.",
      "We buy loose diamonds of all shapes — round brilliant, princess, oval, emerald, cushion and more — as well as diamond rings, earrings, pendants and tennis bracelets. Certified stones from GIA, IGI and HRD are valued at a premium, but uncertified diamonds are equally welcome.",
      "Unlike pawnbrokers or high-street jewellers who offer low trade-in prices, we specialise in diamonds and pay fair market rates. Every assessment is recorded on camera so you can see exactly how we grade your stone.",
    ],
    highlights: ["GIA-trained diamond experts", "Certified and uncertified stones accepted", "All shapes, sizes and settings", "Transparent on-camera grading", "Competitive UK market prices"],
    details: [
      { label: "Certified Diamonds", description: "GIA, IGI and HRD certified stones valued with full report details for maximum accuracy.", image: "/images/diamond-certified.png" },
      { label: "Loose Diamonds", description: "Any shape or size — from melee stones to multi-carat solitaires and fancy cuts.", image: "/images/diamond-loose.png" },
      { label: "Diamond Jewellery", description: "Engagement rings, eternity bands, earrings, necklaces and tennis bracelets.", image: "/images/diamond-jewellery.png" },
      { label: "Expert Assessment", description: "Our gemologists use loupes, microscopes and industry-standard grading criteria.", image: "/images/diamond-expert.png" },
      { label: "Transparent Grading", description: "Watch your diamond being inspected on video — no hidden assessments.", image: "/images/diamond-grading.png" },
    ],
    steps: [
      { title: "Submit details", text: "Send photos and any certificate numbers through our free valuation form." },
      { title: "Receive an estimate", text: "Our experts reply within 24 hours with a preliminary valuation range." },
      { title: "Secure shipping", text: "Post your diamond in our insured pack — fully tracked and covered." },
      { title: "Final offer & payment", text: "After in-person grading, receive your final offer and same-day payment." },
    ],
    faqs: [
      { question: "Do I need a GIA certificate to sell my diamond?", answer: "No. We grade uncertified diamonds in-house. A certificate helps us confirm details faster, but it is not required." },
      { question: "Can I sell a diamond still set in a ring?", answer: "Yes. We buy set and unset diamonds. We assess the stone separately from the setting." },
      { question: "How do you determine diamond value?", answer: "We evaluate the 4Cs — cut, colour, clarity and carat — alongside current wholesale market prices." },
    ],
  },
  "sell-gemstones": {
    title: "Sell Gemstones",
    heading: "Sell Your Precious Gemstones",
    description: "Rubies, sapphires, emeralds and semi-precious stones — loose or set in jewellery. Expert gemological assessment and competitive UK prices.",
    heroImage: "/images/service-hero-sell-gemstones.png",
    icon: Gem,
    intro: [
      "Coloured gemstones require specialist knowledge to value correctly. A ruby's origin, a sapphire's treatment history and an emerald's clarity all significantly affect price. Our gemologists have the expertise to assess precious and semi-precious stones accurately.",
      "We buy rubies, sapphires, emeralds, tanzanite, aquamarine, tourmaline and many other gemstones — whether loose in a gem jar or set in a ring, pendant or pair of earrings. Certified stones from Gübelin, SSEF and GIA Coloured Stone reports are valued accordingly.",
      "From a single inherited ring to an entire estate collection, we provide the same transparent, professional service. Send photos through our free valuation form and receive an expert estimate within 24 hours.",
    ],
    highlights: ["Precious and semi-precious stones", "Loose gems and set jewellery", "Certified and uncertified accepted", "Origin and treatment considered", "Estate and collection purchases"],
    details: [
      { label: "Rubies, Sapphires & Emeralds", description: "The 'big three' precious gemstones — assessed for colour, clarity, cut and carat weight.", image: "/images/gemstones-precious.png" },
      { label: "Semi-Precious Stones", description: "Tanzanite, aquamarine, tourmaline, amethyst, citrine and more.", image: "/images/gemstones-semi-precious.png" },
      { label: "Loose Gemstones", description: "Individual stones of any size — from small melee to significant centre stones.", image: "/images/gemstones-loose.png" },
      { label: "Gemstone Jewellery", description: "Rings, earrings, pendants and brooches set with coloured stones.", image: "/images/gemstone-jewellery.png" },
      { label: "Certified Stones", description: "Laboratory reports from GIA, Gübelin, SSEF and AGL add value and certainty.", image: "/images/gemstones-certified.png" },
      { label: "Expert Gemological Assessment", description: "Our team identifies treatments, synthetics and simulants with professional equipment.", image: "/images/gemstone-expert.png" },
    ],
    steps: [
      { title: "Share photos", text: "Upload clear images of your gemstone and any certificates via our form." },
      { title: "Expert review", text: "Our gemologists assess colour, clarity, size and market demand." },
      { title: "Send for inspection", text: "Use our free insured postal service for a definitive in-person assessment." },
      { title: "Receive your offer", text: "Get a fair market offer with same-day payment if you accept." },
    ],
    faqs: [
      { question: "Which gemstones do you buy?", answer: "We buy all precious and semi-precious gemstones including rubies, sapphires, emeralds, tanzanite, opals and more." },
      { question: "Does treatment affect the price?", answer: "Yes. Heat-treated stones are common and accepted, but untreated natural stones typically command higher prices." },
      { question: "Can you value an entire jewellery collection?", answer: "Absolutely. We regularly purchase estate collections and can provide itemised valuations for multiple pieces." },
    ],
  },
  "sell-watches": {
    title: "Sell Watches",
    heading: "Sell Your Luxury Watch",
    description: "Rolex, Omega, Cartier, Patek Philippe and more. Expert authentication, fair valuations and fast payment for luxury timepieces.",
    heroImage: "/images/service-hero-sell-watches.png",
    icon: Watch,
    intro: [
      "Luxury watches hold their value better than almost any other personal asset — but getting a fair price requires specialist knowledge. Our team authenticates and values timepieces from the world's leading brands daily, from vintage Rolex Submariners to modern Patek Philippe complications.",
      "We buy with or without original box and papers. While full sets command a premium, a watch on its own is still highly valuable if the condition and authenticity check out. We assess the movement, case, dial, bracelet and service history.",
      "Whether you're upgrading your collection, selling an inheritance or simply no longer wearing a piece, we make the process straightforward. Free valuation, insured postage and same-day payment once you accept our offer.",
    ],
    highlights: ["Rolex, Omega, Cartier, Patek Philippe & more", "With or without box and papers", "Vintage and modern timepieces", "Expert authentication", "Fast valuation and payment"],
    details: [
      { label: "Iconic Luxury Brands", description: "Rolex, Omega, Cartier, Patek Philippe — the most sought-after names in horology.", image: "/images/watches-luxury.png" },
      { label: "Premium Manufactures", description: "Audemars Piguet, Breitling, IWC, Jaeger-LeCoultre, Panerai and TAG Heuer.", image: "/images/watches-premium.png" },
      { label: "Box & Papers", description: "Full sets with original box, warranty card and receipts achieve the best prices.", image: "/images/watch-box-papers.png" },
      { label: "Vintage & Modern", description: "From 1960s vintage pieces to current-production models — all eras welcome.", image: "/images/watches-vintage-modern.png" },
      { label: "Quick Valuation", description: "Send model number and photos for a preliminary estimate within 24 hours.", image: "/images/watch-valuation.png" },
    ],
    steps: [
      { title: "Tell us about your watch", text: "Share the brand, model, reference number and condition via our form." },
      { title: "Get a preliminary quote", text: "Our watch specialists respond within 24 hours with an estimated range." },
      { title: "Insured delivery", text: "Ship your watch in our tamper-proof, fully insured Special Delivery pack." },
      { title: "Authentication & payment", text: "We authenticate, confirm the final price and pay you the same day." },
    ],
    faqs: [
      { question: "Do I need the original box and papers?", answer: "No, but they add value. We buy watches without box and papers at fair market rates." },
      { question: "Which watch brands do you buy?", answer: "All major luxury brands including Rolex, Omega, Cartier, Breitling, TAG Heuer, Patek Philippe and more." },
      { question: "How do you authenticate a watch?", answer: "Our specialists inspect the movement, serial numbers, dial, case, bracelet and overall craftsmanship." },
    ],
  },
  "sell-jewellery": {
    title: "Sell Jewellery",
    heading: "Sell Jewellery in Hatton Garden — Cartier, Tiffany & Boodles",
    description: "Sell Cartier, Tiffany & Co., Boodles, Van Cleef & Arpels, Bulgari and luxury brands. Instant cash, best UK prices — we pay above scrap gold for authenticated designer pieces.",
    heroImage: "/images/service-hero-sell-jewellery.png",
    icon: Gem,
    intro: [
      "Want to sell your Cartier Love bracelet, Tiffany engagement ring or Boodles Raindance necklace? You deserve far more than scrap gold prices. Fine Jewellery Buyers specialises in luxury brand jewellery — we authenticate, value and pay instant cash at the best prices in the UK.",
      "We purchase signed pieces from Cartier, Tiffany & Co., Boodles, Van Cleef & Arpels, Bulgari, Harry Winston, Chopard, Graff, Chaumet, David Yurman, Piaget and other major houses. Brand value, craftsmanship, condition and market demand all factor into your offer — not just the weight of gold.",
      "Whether you inherited a collection, are upgrading your jewellery or simply want the best price for a single piece, our Hatton Garden experts provide a free, no-obligation valuation. Accept our offer and receive same-day bank transfer — or visit us in person for an instant cash payment.",
    ],
    highlights: [
      "We buy Cartier, Tiffany, Boodles & all major brands",
      "Instant cash — same-day bank transfer",
      "Best prices — above scrap gold for designer pieces",
      "Expert brand authentication",
      "Free valuation — visit or post nationwide",
    ],
    details: [
      { label: "Cartier", description: "Love bracelets, Juste un Clou, Panthère, Trinity rings, Tank watches — we buy all Cartier jewellery.", image: "/images/jewellery-designer.png" },
      { label: "Tiffany & Co.", description: "Engagement rings, T collections, Elsa Peretti, Return to Tiffany — instant cash for Tiffany pieces.", image: "/images/jewellery-luxury-brands.png" },
      { label: "Boodles", description: "Raindance, Classic Collection and high jewellery — London's own luxury house, expertly valued.", image: "/images/jewellery-gemstone-set.png" },
      { label: "Van Cleef & Arpels", description: "Alhambra, Vintage Alhambra, Perlée, Frivole — premium prices for VCA jewellery.", image: "/images/jewellery-antique.png" },
      { label: "Bulgari, Chopard & More", description: "Bulgari Serpenti, Chopard Happy Diamonds, Harry Winston, Graff and other luxury brands.", image: "/images/jewellery-assessment.png" },
    ],
    steps: [
      { title: "Describe your piece", text: "Tell us the brand, materials and condition. Photos of hallmarks help." },
      { title: "Receive an estimate", text: "Our specialists provide a preliminary valuation within 24 hours." },
      { title: "Secure postage", text: "Send your jewellery in our tamper-evident, fully insured pack." },
      { title: "Final offer", text: "After inspection, receive a detailed offer and same-day payment." },
    ],
    faqs: [
      { question: "Where can I sell jewellery in Hatton Garden?", answer: "At Fine Jewellery Buyers, 88–90 Hatton Garden, London. We buy designer jewellery including Cartier, Tiffany and Boodles, plus gold and diamonds. Walk-ins welcome; instant cash on acceptance." },
      { question: "Do you buy Cartier jewellery in the UK?", answer: "Yes. We buy all Cartier pieces including Love bracelets, Juste un Clou, Panthère and Trinity collections. Instant cash paid on acceptance." },
      { question: "How much will you pay for Tiffany & Co. jewellery?", answer: "We pay above scrap gold value for Tiffany pieces. Send photos for a free valuation — price depends on collection, condition and stones." },
      { question: "Do you buy Boodles jewellery?", answer: "Yes. We buy Boodles Raindance, Classic Collection and all Boodles fine jewellery at competitive UK market prices." },
      { question: "Do you pay more than scrap value for designer jewellery?", answer: "Yes. Signed pieces from Cartier, Tiffany, Boodles and other major brands are valued above melt price when the brand and condition warrant it." },
      { question: "How quickly do I get paid?", answer: "Same-day instant bank transfer once you accept our offer — whether you sell in person or by post." },
    ],
  },
  "sell-silver": {
    title: "Sell Silver",
    heading: "Sell Your Silver for Top UK Prices",
    description: "Sterling silver jewellery, silverware, cutlery, coins and bars — we buy all silver at competitive live-market rates across the UK.",
    heroImage: "/images/service-hero-sell-silver.png",
    icon: Coins,
    intro: [
      "Silver may not carry the same headline prices as gold, but accumulated sterling silver can be worth a surprising amount. Tea sets, cutlery collections, chains, bracelets and silver coins all have real value — especially at today's live market rates.",
      "We buy sterling silver (925), Britannia silver (958) and silver bullion. Hallmarked English, Scottish and Irish silver is our specialty, but we also accept unhallmarked items after testing. Heavy antique silverware from names like Mappin & Webb, Elkington and Walker & Hall is particularly sought after.",
      "Our silver prices track the live market and update regularly. Use our calculator to estimate your silver's value, then send items via our free insured postal service from anywhere in the UK.",
    ],
    highlights: ["Sterling silver (925) and Britannia silver", "Jewellery, cutlery, tea sets and coins", "Antique and modern silverware", "Live market-linked pricing", "Free insured UK-wide postage"],
    details: [
      { label: "Sterling Silver (925)", description: "The standard UK purity — chains, rings, bracelets, pendants and charms.", image: "/images/silver-sterling-925.png" },
      { label: "Silver Jewellery & Chains", description: "Fashion jewellery, Cuban links, signet rings and silver watches.", image: "/images/silver-jewellery-chains.png" },
      { label: "Silverware & Cutlery", description: "Tea sets, canteens of cutlery, serving dishes, candlesticks and trophies.", image: "/images/silver-cutlery.png" },
      { label: "Silver Bars & Coins", description: "Investment silver, Britannia coins, pre-decimal coinage and bullion bars.", image: "/images/silver-bars-coins.png" },
      { label: "Hallmarked & Unhallmarked", description: "English, Scottish, Irish and foreign hallmarks — or professional on-site testing.", image: "/images/silver-hallmarks.png" },
    ],
    steps: [
      { title: "Weigh and estimate", text: "Use our silver calculator or send photos for a quick estimate." },
      { title: "Post your silver", text: "Pack items in our free, fully insured Special Delivery envelope." },
      { title: "Testing & weighing", text: "We verify purity, weigh accurately and inspect on camera." },
      { title: "Instant payment", text: "Accept our offer and receive a same-day bank transfer." },
    ],
    faqs: [
      { question: "Is my silver plate worth anything?", answer: "Silver plate (EPNS) has minimal scrap value. We buy solid sterling silver and bullion only." },
      { question: "Do you buy silver cutlery sets?", answer: "Yes. Full canteens and individual pieces are welcome. Heavier sets typically yield the best returns." },
      { question: "How do you test silver purity?", answer: "We use acid testing, XRF analysis and hallmark verification to confirm silver content." },
    ],
  },
  "sell-platinum": {
    title: "Sell Platinum",
    heading: "Sell Platinum & Palladium",
    description: "Platinum rings, jewellery, bars and palladium items assessed and priced at live market-linked rates with expert UK buyers.",
    heroImage: "/images/service-hero-sell-platinum.png",
    icon: Sparkles,
    intro: [
      "Platinum is rarer than gold and used extensively in fine jewellery — particularly engagement rings and wedding bands. Its dense, white-metal purity makes it highly valuable on the scrap and second-hand market. We buy platinum jewellery, bars and industrial items at live market rates.",
      "We also purchase palladium — increasingly found in jewellery and industrial applications. Palladium prices have risen significantly in recent years, making old pieces more valuable than many owners realise.",
      "Whether you have a single platinum wedding band or a collection of items, our Hatton Garden experts test, weigh and price everything transparently. Same-day payment and free insured postage nationwide.",
    ],
    highlights: ["Platinum rings, chains and jewellery", "Platinum and palladium bars", "Live market-linked rates", "Professional XRF testing", "Same-day bank transfer"],
    details: [
      { label: "Platinum Rings & Bands", description: "Engagement rings, wedding bands and dress rings — the most common platinum items we buy.", image: "/images/platinum-rings.png" },
      { label: "Platinum Jewellery", description: "Chains, bracelets, earrings and pendants in 950 platinum.", image: "/images/platinum-jewellery.png" },
      { label: "Palladium Items", description: "Palladium jewellery, bars and industrial scrap — a growing market.", image: "/images/palladium-items.png" },
      { label: "Industrial Platinum", description: "Trade-only catalytic converter and industrial platinum purchases by arrangement.", image: "/images/platinum-catalytic.png" },
      { label: "Live Market Pricing", description: "Platinum and palladium prices tracked live — transparent rates every time.", image: "/images/platinum-pricing.png" },
    ],
    steps: [
      { title: "Submit your items", text: "Describe your platinum or palladium pieces via our free valuation form." },
      { title: "Receive an estimate", text: "We reply within 24 hours based on weight, purity and live prices." },
      { title: "Insured shipping", text: "Send items in our tamper-proof, fully insured postal pack." },
      { title: "Test, offer & pay", text: "On-site XRF testing confirms purity — payment same day if you accept." },
    ],
    faqs: [
      { question: "How can I tell if my ring is platinum?", answer: "Look for '950 Plat', 'PLAT' or 'PT' hallmarks. We also test with professional XRF equipment." },
      { question: "Is platinum worth more than gold?", answer: "It depends on current market prices. Check our Live Rates page for today's platinum price per gram." },
      { question: "Do you buy palladium jewellery?", answer: "Yes. Palladium rings and jewellery are increasingly common and we buy all palladium items." },
    ],
  },
};

export const SERVICE_SLUGS = Object.keys(servicesData);
