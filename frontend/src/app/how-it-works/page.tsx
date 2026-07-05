import { HowItWorks } from "@/components/sections/HowItWorks";
import { WhyChooseUs } from "@/components/sections/WhyChooseUs";
import { FAQ } from "@/components/sections/FAQ";
import Link from "next/link";
import { ArrowRight, Shield, Eye, Truck } from "lucide-react";
import type { Metadata } from "next";
import { buildMetadata, breadcrumbJsonLd, PAGE_SEO } from "@/lib/seo";

export const metadata: Metadata = buildMetadata(PAGE_SEO["how-it-works"]);

export default function HowItWorksPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbJsonLd([
              { name: "Home", path: "/" },
              { name: "How It Works", path: "/how-it-works" },
            ])
          ),
        }}
      />
      <section className="bg-black py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl md:text-5xl font-serif font-bold text-white mb-4">How to Sell Your Gold in the UK</h1>
          <p className="text-white/70 max-w-2xl mx-auto text-lg">A simple, secure, and transparent process from anywhere in the UK.</p>
        </div>
      </section>
      <HowItWorks />
      <section className="py-20 bg-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Shield, title: "Fully Insured Shipping", description: "Every shipment is fully insured and tracked via Royal Mail." },
              { icon: Eye, title: "Video Unboxing", description: "We open and inspect every item on camera for transparency." },
              { icon: Truck, title: "Free Returns", description: "Decline our offer? We return your items free of charge." },
            ].map(({ icon: Icon, title, description }) => (
              <div key={title} className="text-center p-8 bg-white rounded-2xl border border-border">
              <div className="w-16 h-16 bg-gold/10 rounded-2xl flex items-center justify-center mx-auto mb-5"><Icon className="w-8 h-8 text-gold-dark" /></div>
              <h3 className="text-xl font-serif font-bold text-black mb-3">{title}</h3>
                <p className="text-muted-foreground leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <WhyChooseUs />
      <section className="py-16 gold-gradient">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-serif font-bold text-white mb-4">Ready to Get Started?</h2>
          <p className="text-white/90 mb-8 text-lg">Get your free, no-obligation valuation today.</p>
          <Link href="/free-valuation" className="inline-flex items-center px-8 py-4 bg-black text-white font-bold rounded-full hover:bg-black/80 transition-colors cursor-pointer">
            Get Free Valuation <ArrowRight className="w-5 h-5 ml-2" />
          </Link>
        </div>
      </section>
      <FAQ />
    </>
  );
}
