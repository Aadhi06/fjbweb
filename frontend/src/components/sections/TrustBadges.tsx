import { Shield, Clock, Award, Banknote, Star, Users } from "lucide-react";

const badges = [
  { icon: Star, value: "4.9★", label: "Google Rating", sub: "1,000+ verified reviews" },
  { icon: Users, value: "10K+", label: "Happy Customers", sub: "Trusted across the UK" },
  { icon: Clock, value: "24hr", label: "Fast Payment", sub: "Same-day bank transfer" },
  { icon: Shield, value: "100%", label: "Fully Insured", sub: "Secure postal service" },
  { icon: Award, value: "15+", label: "Years Experience", sub: "Expert valuations" },
  { icon: Banknote, value: "Best", label: "Prices Paid", sub: "Live market rates" },
];

export function TrustBadges() {
  return (
    <section className="py-12 bg-white border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {badges.map((badge) => (
            <div key={badge.label} className="text-center group">
              <badge.icon className="w-7 h-7 text-gold-dark mx-auto mb-2 group-hover:scale-110 transition-transform duration-200" />
              <p className="text-2xl font-bold text-black">{badge.value}</p>
              <p className="text-sm font-semibold text-black/80">{badge.label}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{badge.sub}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
