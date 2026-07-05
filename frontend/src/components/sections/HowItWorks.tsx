import { SectionHeading } from "@/components/ui/SectionHeading";
import Link from "next/link";
import { ArrowRight, FileText, MessageSquare, Package, Search, Banknote } from "lucide-react";

const steps = [
  { icon: FileText, title: "Fill In Our Online Form", description: "Complete our easy valuation form with details and photos. It takes less than 2 minutes." },
  { icon: MessageSquare, title: "Get Your Valuation", description: "Our experts review your submission and contact you within 24 hours with an estimate." },
  { icon: Package, title: "Ship Securely", description: "Accept the estimate and we send you a free, fully insured Royal Mail prepaid package." },
  { icon: Search, title: "Expert Assessment", description: "We inspect your items on camera for full transparency. GIA-trained experts assess your pieces." },
  { icon: Banknote, title: "Get Paid Instantly", description: "Accept our final offer and receive payment within 24 hours. Decline? Free returns." },
];

export function HowItWorks() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading label="Our Process" title="How It Works" description="A simple, secure, and transparent process from start to finish." />
        <div className="grid md:grid-cols-5 gap-4">
          {steps.map((step, i) => (
            <div key={step.title} className="relative text-center p-6 rounded-2xl border border-border hover:border-primary/30 hover:shadow-lg transition-all duration-200 group bg-white cursor-default">
              <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center mx-auto mb-4">
                <step.icon className="w-5 h-5 text-gold" />
              </div>
              <div className="text-xs font-bold text-gold-dark mb-2">Step {i + 1}</div>
              <h3 className="text-sm font-serif font-bold text-black mb-2">{step.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{step.description}</p>
              {i < steps.length - 1 && (
                <div className="hidden md:block absolute top-1/4 -right-3 text-border text-lg">→</div>
              )}
            </div>
          ))}
        </div>
        <div className="text-center mt-12">
          <Link href="/free-valuation" className="inline-flex items-center px-8 py-4 bg-black text-white font-bold rounded-full hover:bg-black/80 transition-colors shadow-lg cursor-pointer">
            Start Selling Now <ArrowRight className="w-5 h-5 ml-2" />
          </Link>
        </div>
      </div>
    </section>
  );
}
