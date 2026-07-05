"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { cn } from "@/lib/utils";

const faqs = [
  { q: "How do I sell my gold or jewellery online?", a: "Simply complete our online valuation form, upload images of your item, and our experts will contact you with an initial offer within 24 hours. It's free, secure, and no obligation." },
  { q: "Is shipping my jewellery safe and insured?", a: "Yes, every shipment is fully insured, tracked via Royal Mail, and securely handled from start to finish." },
  { q: "How quickly will I receive payment?", a: "Once you accept our final offer, payment is usually made via bank transfer within 24 hours. In-person payments can be instant." },
  { q: "Do you buy diamonds without certificates?", a: "Yes, we buy both certified and non-certified diamonds. Our GIA-trained experts can assess your diamond even without paperwork." },
  { q: "What types of items do you buy?", a: "We buy gold (all carats), diamonds, luxury watches, fine jewellery, silver, platinum, palladium, branded jewellery, and gemstones." },
  { q: "What happens if I decline the offer?", a: "Your item will be securely returned to you at no extra cost via insured Royal Mail." },
  { q: "How is the value of my gold calculated?", a: "We use live market-linked rates. Value depends on weight, carat/purity, and current market price. Use our Gold Calculator for an estimate." },
  { q: "Do I need an appointment to visit?", a: "Walk-ins are welcome during opening hours. For larger collections, we recommend booking a private appointment." },
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="py-20 bg-surface">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading label="FAQ" title="Frequently Asked Questions" description="Quick answers to common questions." />
        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div key={i} className="border border-border rounded-xl overflow-hidden bg-white">
              <button onClick={() => setOpenIndex(openIndex === i ? null : i)} className="w-full flex items-center justify-between px-6 py-5 text-left hover:bg-muted/50 transition-colors cursor-pointer">
                <span className="font-semibold text-black pr-4">{faq.q}</span>
                <ChevronDown className={cn("w-5 h-5 text-muted-foreground shrink-0 transition-transform duration-200", openIndex === i && "rotate-180 text-gold-dark")} />
              </button>
              {openIndex === i && (
                <div className="px-6 pb-5 text-muted-foreground leading-relaxed fade-in">{faq.a}</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
