import type { Metadata } from "next";
import { breadcrumbJsonLd, buildMetadata, faqJsonLd, PAGE_SEO } from "@/lib/seo";

export const metadata: Metadata = buildMetadata(PAGE_SEO["live-rates"]);

const LIVE_RATE_FAQS = [
  {
    question: "What do you pay for gold today?",
    answer:
      "We pay a live buying rate per gram for 9ct, 14ct, 18ct, 22ct and 24ct gold. The figures on this page are what we pay today — they update automatically every 30 seconds with the market.",
  },
  {
    question: "How often does today’s gold rate update?",
    answer:
      "Our buying prices refresh every 30 seconds. The rate we apply is the live rate at the time we test, weigh and you accept the offer.",
  },
  {
    question: "Do you buy all gold carats?",
    answer:
      "Yes. We buy 9ct, 14ct, 18ct, 22ct and 24ct gold — jewellery, scrap, broken pieces, coins and bars. Price is set by weight and purity, not condition.",
  },
  {
    question: "How do I sell at today’s gold rate?",
    answer:
      "Walk into our Hatton Garden showroom, or start a free valuation and send items by prepaid insured post from anywhere in the UK. Payment is the same day if you accept.",
  },
];

export default function LiveRatesLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbJsonLd([
              { name: "Home", path: "/" },
              { name: "What We Pay for Gold Today", path: "/live-rates" },
            ])
          ),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqJsonLd(LIVE_RATE_FAQS)),
        }}
      />
      {children}
    </>
  );
}
