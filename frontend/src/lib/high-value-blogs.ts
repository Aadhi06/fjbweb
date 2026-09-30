/**
 * Frontend-owned blogs. Add or edit a post in this file, then git push.
 * Vercel publishes /blog/{slug} — no Hostinger upload.
 */
export type HighValueBlog = {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  image: string;
  category: string;
  published_at: string;
  meta_title: string;
  meta_description: string;
  showReviews?: boolean;
  showVisitDirections?: boolean;
};

export function resolveBlogImage(path?: string | null): string | null {
  if (!path) return null;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  if (path.startsWith("/images/")) return path;
  return `${(process.env.NEXT_PUBLIC_API_URL || "http://localhost:8002").replace(/\/$/, "")}${path}`;
}

export const HIGH_VALUE_BLOGS: HighValueBlog[] = [
  {
    slug: "best-place-to-sell-gold-in-london-top-price-paid",
    title: "Best Place to Sell Gold in London — Top Price Paid",
    excerpt:
      "Hatton Garden is where London sells gold. Fine Jewellery Buyers pays live market-linked prices at 88–90 Hatton Garden. Check our Google reviews, then walk in or book.",
    image: "/images/hatton-garden-building.jpg",
    category: "Sell Gold London",
    published_at: "2026-09-30T13:30:00+01:00",
    meta_title: "Best Place to Sell Gold in London | Top Price Paid",
    meta_description:
      "Best place to sell gold in London with top prices paid. Fine Jewellery Buyers, 88–90 Hatton Garden — live rates, same-day payment. Check our Google reviews first.",
    showReviews: true,
    showVisitDirections: true,
    content: `
<p>The <strong>best place to sell gold in London</strong> is Hatton Garden — and the buyer who pays a <strong>top price</strong> is the one who prices against the live gold market, not a pawnbroker’s fixed ticket.</p>
<p>Fine Jewellery Buyers is at <strong>Suite 39, 4th Floor, 88–90 Hatton Garden</strong>. Walk in for a free valuation, or sell by insured post from anywhere in the UK.</p>
<p>Do not take our word for it. <a href="#reviews">Check our Google reviews</a> on this page. Customers rate the valuation, the price and the same-day payment.</p>

<h2>Why Hatton Garden pays more than the high street</h2>
<p>High-street jewellers and pawn shops often quote scrap and hold a wide margin. Hatton Garden is London’s jewellery quarter. Specialist buyers here compete on weight, carat and today’s gold price. We publish <a href="/live-rates">live buying rates</a> so you can see what we pay before you leave the house.</p>
<ul>
  <li>9ct to 24ct jewellery, scrap, bars and coins</li>
  <li>Free in-person valuation — no obligation to sell</li>
  <li>Same-day bank transfer or cash in store if you accept</li>
  <li>Walk-ins welcome Monday–Saturday, 10:00–18:00</li>
</ul>

<h2>Top price paid — how we get there</h2>
<p>Price is live gold × purity × weight, minus a published buying margin. Bars, sovereigns and signed designer gold are valued above scrap when they deserve it. That is how a “top price” is actually made — not a slogan on the window.</p>
<p>Read the full <a href="/sell-gold-london">sell gold in London</a> guide, or go straight to a <a href="/free-valuation">free valuation</a>.</p>

<h2>Check our Google reviews</h2>
<p>Before you travel, scroll to the Google reviews below. They are verified Trustindex / Google ratings from people who have already sold gold here. If the lot is large — bars, an estate, designer pieces — <a href="/book-appointment">book a private appointment</a> so a senior valuer is ready.</p>

<h2>How to sell today</h2>
<ol>
  <li>Check <a href="/live-rates">today’s rates</a> or the <a href="/gold-calculator">gold calculator</a>.</li>
  <li>Visit Suite 39, 4th Floor, 88–90 Hatton Garden or send photos online.</li>
  <li>Accept the offer and get paid the same day. Decline and keep the gold.</li>
</ol>
<p>High-value lots: <a href="/sell-gold-bars">gold bars</a>, <a href="/sell-gold-coins">sovereigns and coins</a>, <a href="/sell-inherited-gold">inherited gold</a>.</p>
`.trim(),
  },
  {
    slug: "sell-gold-bars-uk-keep-the-bullion-premium",
    title: "How to Sell Gold Bars in the UK Without Losing the Bullion Premium",
    excerpt:
      "A kilo bar or a sealed PAMP pack is not scrap. Here is how high-value sellers keep the bullion premium when they sell gold bars in the UK.",
    image: "/images/gold-bars-coins.png",
    category: "Gold Bars",
    published_at: "2026-09-26T09:00:00+01:00",
    meta_title: "Sell Gold Bars UK | Keep the Bullion Premium",
    meta_description:
      "How to sell gold bars in the UK without a scrap quote. PAMP, Perth Mint, Royal Mint and kilo bars — private Hatton Garden valuation and same-day payment.",
    content: `
<p>If you are selling a <strong>gold bar</strong> in the United Kingdom, the worst outcome is a scrap-gold price. Investment bars from PAMP, Perth Mint, the Royal Mint, Valcambi and other LBMA refiners are bought as bullion — weight, fineness, brand and assay packaging all matter.</p>
<p>Fine Jewellery Buyers purchases bars from 1g to kilo at <a href="/sell-gold-bars">live bullion-linked rates</a>. Walk into 88–90 Hatton Garden or send insured photographs first if the holding is large.</p>

<h2>Why a scrap quote costs you money</h2>
<p>Scrap buyers melt first and ask later. A sealed 100g PAMP in original assay card is not the same as a broken 9ct chain. The bar already has recognised purity. You should be paid on <strong>fine gold content</strong> against the live market, with a tighter margin than unmarked melt.</p>
<ul>
  <li>Keep the assay card, serial number and box together</li>
  <li>Do not open a sealed pack unless a valuer asks you to</li>
  <li>Photograph the front, back, weight stamp and hologram</li>
</ul>

<h2>What we buy</h2>
<p>1g, 5g, 10g, 1oz, 50g, 100g, 250g, 500g and 1kg bars. Allocated retail bars and uncarded bars are both accepted — uncarded pieces are tested and weighed on site. Several bars from one family or a vault withdrawal should be booked as a <a href="/book-appointment">private appointment</a>.</p>

<h2>How a high-value bar sale works</h2>
<ol>
  <li>Send photos or book a Hatton Garden slot — tell us if the lot is over £5,000 or £15,000 so a senior valuer is ready.</li>
  <li>We confirm weight and fineness and price the bar at our live buying rate.</li>
  <li>Accept and we pay the same day by bank transfer. Decline and the bar stays yours.</li>
</ol>
<p>Photo ID is required. High-value bars travel by Royal Mail Special Delivery with declared insurance if you cannot visit London.</p>

<h2>Check the market first</h2>
<p>See <a href="/live-rates">today’s gold rates</a> and our <a href="/gold-calculator">gold calculator</a> before you travel. Then start a <a href="/free-valuation?item=Gold%20bars%20%2F%20bullion&amp;value=%C2%A35%2C000%20%E2%80%93%20%C2%A315%2C000">free valuation for gold bars</a> or read the full <a href="/sell-gold-bars">sell gold bars</a> page.</p>
`.trim(),
  },
  {
    slug: "sell-inherited-gold-estate-jewellery-uk",
    title: "Selling Inherited Gold in the UK: Why a Scrap Quote Costs Estates Thousands",
    excerpt:
      "Inherited gold is rarely one melt price. Executors and families who sort jewellery, coins and bars separately keep more of the estate.",
    image: "/images/gold-collection.png",
    category: "Inherited Gold",
    published_at: "2026-09-27T09:00:00+01:00",
    meta_title: "Sell Inherited Gold UK | Estate Jewellery Buyers",
    meta_description:
      "How to sell inherited gold and estate jewellery in the UK. Why scrap quotes cost estates money, and how a Hatton Garden valuation sorts the box line by line.",
    content: `
<p>A drawer of inherited gold is usually a mix: 9ct chains, an 18ct ring, sovereigns in a tin, a broken bracelet and the odd signed piece. A single scrap quote on the whole box leaves money in the melt pot. Fine Jewellery Buyers <a href="/sell-inherited-gold">sorts estate gold line by line</a>.</p>

<h2>What executors should do first</h2>
<p>Photograph jewellery, coins and bars in separate groups. Note any boxes, certificates or probate instructions. Do not clean coins or strip stones “to make it tidier”. Cleaning can cut collector and designer value.</p>
<p>Bring photo ID and estate authority where required. We can pay the estate or a named beneficiary. Ask before you post a high-value holding.</p>

<h2>Why the box is worth more than scrap</h2>
<ul>
  <li><strong>Designer jewellery</strong> — Cartier, Tiffany, Boodles and similar houses are priced on brand when authenticated, not melt weight alone.</li>
  <li><strong>Coins</strong> — sovereigns and Krugerrands may sit above bullion if the date or proof issue supports it.</li>
  <li><strong>Bars</strong> — sealed investment bars should never be melted as scrap jewellery.</li>
  <li><strong>Diamonds and gems</strong> — we assess stones separately from the gold mount.</li>
</ul>

<h2>Private estate appointments</h2>
<p>Families who prefer a quiet room can <a href="/book-appointment">book a private valuation</a> at 88–90 Hatton Garden. We explain each line of the offer. You can sell the coins, keep the wedding ring, and still leave with same-day payment on what you accept.</p>
<p>Posted estates use free insured Royal Mail Special Delivery. Items are opened on camera. Decline any line and those pieces come back at our cost.</p>

<h2>Start with the right form</h2>
<p>Use the <a href="/free-valuation?item=Inherited%20gold%20collection&amp;value=%C2%A35%2C000%20%E2%80%93%20%C2%A315%2C000">£5,000+ or £15,000+</a> expected-value band so a senior valuer handles the file. Or read <a href="/sell-inherited-gold">sell inherited gold</a> and <a href="/sell-gold">sell gold in the UK</a>.</p>
`.trim(),
  },
  {
    slug: "sell-gold-sovereigns-and-krugerrands",
    title: "Sell Gold Sovereigns and Krugerrands: Melt Value vs Collector Premium",
    excerpt:
      "Full sovereigns, halves, Krugerrands and Britannias are priced on gold first — then we check whether any coin is worth more than melt.",
    image: "/images/gold-bars-coins.png",
    category: "Gold Coins",
    published_at: "2026-09-28T09:00:00+01:00",
    meta_title: "Sell Gold Sovereigns & Krugerrands UK | Coin Buyers",
    meta_description:
      "Sell gold sovereigns, Krugerrands and Britannias in the UK. Hatton Garden coin buyers explain melt value versus collector premium and pay the same day.",
    content: `
<p>Gold coins are one of the highest-value items we buy. A full sovereign, half sovereign, Krugerrand, Britannia or maple leaf is priced on <strong>fine gold</strong> first. Rare dates, proof issues and complete sets can sit above that. Fine Jewellery Buyers <a href="/sell-gold-coins">buys sovereigns and bullion coins daily</a> in Hatton Garden.</p>

<h2>Do not clean old coins</h2>
<p>Cleaning scratches the surface and can wipe a collector premium. Bring Victorian, Edwardian, George and Elizabeth sovereigns as they are. We identify the issue, weigh the gold and tell you if any piece should not be melted.</p>

<h2>What we look at</h2>
<ul>
  <li>Weight and gold content (sovereigns and 1oz bullion coins)</li>
  <li>Date, mint mark and whether it is a proof or uncirculated issue</li>
  <li>Complete sets and albums — inherited tins are sorted coin by coin</li>
  <li>Live gold price on the day you accept</li>
</ul>

<h2>Krugerrands, Britannias and other ounces</h2>
<p>1oz and fractional Krugerrands, Royal Mint Britannias, maple leafs and American eagles are bought at live gold plus any justified mint premium. If you have a large tin, send a photographed list first or book a <a href="/book-appointment">private appointment</a>.</p>

<h2>How to sell</h2>
<p>Walk in during opening hours or use insured post from anywhere in the UK. Accept in store and leave with payment. Postal sales settle the day you accept. Check <a href="/live-rates">live rates</a>, then start a <a href="/free-valuation?item=Gold%20coins%20%2F%20sovereigns&amp;value=%C2%A32%2C000%20%E2%80%93%20%C2%A35%2C000">coin valuation</a> or read <a href="/sell-gold-coins">sell gold coins</a>.</p>
`.trim(),
  },
  {
    slug: "private-gold-valuation-hatton-garden-high-value",
    title: "Private Gold Valuation in Hatton Garden for High-Value Lots",
    excerpt:
      "Lots over a few thousand pounds need a quiet room, a senior valuer and same-day settlement — not a high-street counter quote.",
    image: "/images/hatton-garden-building.jpg",
    category: "Private Clients",
    published_at: "2026-09-29T09:00:00+01:00",
    meta_title: "Private Gold Valuation Hatton Garden | High-Value Lots",
    meta_description:
      "Book a private gold valuation in Hatton Garden for bars, estates and designer jewellery. Senior valuer, same-day payment, no obligation to sell.",
    content: `
<p>High-value gold is not a walk-up scrap ticket. If you are selling bars, a coin holding, inherited jewellery or signed designer pieces, you want a <strong>private valuation</strong> in Hatton Garden — time to test, weigh and explain the offer without a queue behind you.</p>
<p>Fine Jewellery Buyers is at <strong>88–90 Hatton Garden, London</strong>. <a href="/book-appointment">Book a time</a> and tell us the expected value on the form so the right valuer is free.</p>

<h2>Who should book privately</h2>
<ul>
  <li>Gold bars and multi-bar sales</li>
  <li>Sovereigns, Krugerrands and coin albums</li>
  <li>Inherited collections and probate boxes</li>
  <li>Cartier, Tiffany, Boodles and other designer gold</li>
  <li>Any lot you believe is over £5,000 — and especially £15,000+</li>
</ul>

<h2>What happens in the room</h2>
<p>We test carat, weigh the gold and, where it matters, authenticate the brand or coin. You see a clear offer. Accept and we pay the same day by bank transfer or cash in store. Decline and you take everything home. There is no obligation to sell.</p>
<p>If you cannot travel, the same specialists assess insured post. Items are opened on camera. Posted pieces you decline come back free.</p>

<h2>Prepare before you arrive</h2>
<p>Bring photo ID. Keep assay cards, boxes and certificates with the items. Check <a href="/live-rates">what we pay today</a>. Start a <a href="/free-valuation">free valuation</a> with photos if you want a range first, or go straight to <a href="/sell-gold">sell gold</a>.</p>
`.trim(),
  },
  {
    slug: "sell-designer-gold-jewellery-not-scrap",
    title: "Should You Melt Cartier and Tiffany Gold — or Sell It as Designer Jewellery?",
    excerpt:
      "Signed gold from Cartier, Tiffany and Boodles is often worth more than scrap. Authenticate first. Melt last.",
    image: "/images/jewellery-designer.png",
    category: "Designer Jewellery",
    published_at: "2026-09-30T09:00:00+01:00",
    meta_title: "Sell Designer Gold Jewellery UK | Not Scrap Value",
    meta_description:
      "Sell Cartier, Tiffany and Boodles gold in Hatton Garden. Why designer jewellery should not be melted as scrap, and how a specialist buyer prices the brand.",
    content: `
<p>A Cartier Love bracelet or a Tiffany gold chain is gold — but it is also a brand. Melting it as scrap throws away the name, the workshop and the secondary-market demand. Fine Jewellery Buyers <a href="/sell-jewellery-hatton-garden">buys designer jewellery in Hatton Garden</a> above scrap when the piece authenticates.</p>

<h2>When brand beats melt</h2>
<p>We regularly see Cartier Love and Juste un Clou, Tiffany engagement settings, Boodles Raindance, Van Cleef &amp; Arpels Alhambra and Bulgari Serpenti. Condition, completeness (box, papers, screwdriver) and stones all move the number. A worn but genuine signed piece can still beat 18ct scrap.</p>

<h2>When scrap is the right number</h2>
<p>Heavily damaged unbranded gold, broken 9ct chains and unmatched earrings are priced on weight and purity. We say so clearly. The mistake is applying that logic to a signed house before anyone has looked.</p>

<h2>How we value designer gold</h2>
<ol>
  <li>Authenticate marks, style and construction.</li>
  <li>Weigh the gold and note the carat.</li>
  <li>Assess diamonds or gems if set.</li>
  <li>Pay the higher of justified brand value or melt — not an average that hides the better number.</li>
</ol>

<h2>Sell in Hatton Garden or by post</h2>
<p>Walk in or <a href="/book-appointment">book a private appointment</a> for larger collections. Nationwide sellers use free insured post. Start a <a href="/free-valuation?item=Branded%20Jewellery&amp;value=%C2%A32%2C000%20%E2%80%93%20%C2%A35%2C000">branded jewellery valuation</a>, or see <a href="/sell-gold">sell gold</a> if the lot is mixed metal and jewellery.</p>
`.trim(),
  },
];

export function getHighValueBlog(slug: string): HighValueBlog | undefined {
  return HIGH_VALUE_BLOGS.find((post) => post.slug === slug);
}

export function highValueBlogSlugs(): string[] {
  return HIGH_VALUE_BLOGS.map((post) => post.slug);
}

export function frontendBlogListItems() {
  return HIGH_VALUE_BLOGS.map((post, i) => ({
    id: -1 - i,
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt,
    image: post.image,
    category: post.category,
    published_at: post.published_at,
    created_at: post.published_at,
  }));
}
