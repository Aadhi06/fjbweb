import { FAQ } from "@/components/sections/FAQ";
import Link from "next/link";
import { ArrowRight, Phone } from "lucide-react";
import type { Metadata } from "next";
import { getSettings } from "@/lib/settings";
import { buildMetadata, faqJsonLd, PAGE_SEO } from "@/lib/seo";

export const metadata: Metadata = buildMetadata(PAGE_SEO.faq);

const FAQ_ITEMS = [
  { question: "How do I sell my gold to you?", answer: "Fill in our free online valuation form with photos and details. We reply within 24 hours with an estimate. If you accept, we send a free insured Royal Mail pack." },
  { question: "What types of gold do you buy?", answer: "We buy all gold carats — 9ct, 14ct, 18ct, 22ct and 24ct — including scrap gold, broken jewellery, bars, coins and dental gold." },
  { question: "How quickly will I get paid?", answer: "Once your items are assessed and you accept our offer, we pay by same-day bank transfer." },
  { question: "Is postage insured?", answer: "Yes. Every shipment is fully insured and tracked via Royal Mail Special Delivery." },
  { question: "Do I have to accept your offer?", answer: "No. Our valuation is free and no-obligation. If you decline, we return your items free of charge." },
];

export default async function FAQPage() {
  const settings = await getSettings();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd(FAQ_ITEMS)) }}
      />
      <section className="bg-black py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl md:text-5xl font-serif font-bold text-white mb-4">Gold &amp; Jewellery Selling FAQs</h1>
          <p className="text-white/70 max-w-2xl mx-auto text-lg">Everything you need to know about selling your precious items.</p>
        </div>
      </section>
      <FAQ />
      <section className="py-16 gold-gradient">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-serif font-bold text-white mb-4">Still Have Questions?</h2>
          <p className="text-white/90 mb-8 text-lg">Our expert team is ready to help.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/contact" className="inline-flex items-center px-8 py-4 bg-black text-white font-bold rounded-full hover:bg-black/80 transition-colors cursor-pointer">Contact Us <ArrowRight className="w-5 h-5 ml-2" /></Link>
            <a href={`tel:${settings.phone.replace(/\s/g, "")}`} className="inline-flex items-center px-8 py-4 border-2 border-white text-white font-bold rounded-full hover:bg-white/10 transition-colors cursor-pointer"><Phone className="w-4 h-4 mr-2" />Call {settings.phone}</a>
          </div>
        </div>
      </section>
    </>
  );
}
