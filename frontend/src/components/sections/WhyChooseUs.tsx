import Image from "next/image";
import { SectionHeading } from "@/components/ui/SectionHeading";

const features = [
  {
    title: "Price Guarantee",
    description: "We honour our estimated price range. No bait-and-switch.",
    image: "/images/why-price-guarantee.png",
  },
  {
    title: "Same-Day Payments",
    description: "Instant bank transfer the same day your valuation is finalised.",
    image: "/images/why-same-day-payment.png",
  },
  {
    title: "Secure Collection",
    description: "Fully insured Royal Mail service, right from your doorstep.",
    image: "/images/why-secure-collection.png",
  },
  {
    title: "Proven Trust",
    description: "1,000+ verified Google reviews and a 4.9★ rating.",
    image: "/images/why-proven-trust.png",
  },
  {
    title: "Video Unboxing",
    description: "Every item opened and inspected on camera for your security.",
    image: "/images/why-video-unboxing.png",
  },
  {
    title: "Expert Valuers",
    description: "GIA-trained experts with 15+ years combined experience.",
    image: "/images/why-expert-valuers.png",
  },
];

export function WhyChooseUs() {
  return (
    <section className="py-20 bg-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          label="Why Choose Us"
          title="The UK's Most Trusted Jewellery Buyer"
          description="Simple, transparent, and rewarding."
        />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group overflow-hidden rounded-2xl border border-border hover:border-gold-dark/30 hover:shadow-xl transition-all duration-300 bg-white"
            >
              <div className="relative aspect-[16/10] overflow-hidden bg-muted">
                <Image
                  src={feature.image}
                  alt={feature.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-serif font-bold text-black mb-2 group-hover:text-gold-dark transition-colors duration-200">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
