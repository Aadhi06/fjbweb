import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  Shield,
  Zap,
  Truck,
  CheckCircle,
  FileText,
  Package,
  Banknote,
} from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import type { Metadata } from "next";
import { buildMetadata, breadcrumbJsonLd, faqJsonLd, SERVICE_SEO } from "@/lib/seo";
import { servicesData } from "@/lib/services-data";

export async function generateStaticParams() {
  return Object.keys(servicesData).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const seo = SERVICE_SEO[slug];
  const s = servicesData[slug];
  if (!seo || !s) return { title: "Our Services" };
  return buildMetadata({
    title: seo.title,
    description: seo.description,
    path: `/services/${slug}`,
    keywords: seo.keywords,
    ogImage: s.heroImage,
  });
}

const stepIcons = [FileText, Package, Shield, Banknote];

export default async function ServicePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const service = servicesData[slug];
  if (!service) return <div className="py-32 text-center text-muted-foreground">Service not found.</div>;
  const ServiceIcon = service.icon;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbJsonLd([
              { name: "Home", path: "/" },
              { name: service.title, path: `/services/${slug}` },
            ])
          ),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            faqJsonLd(service.faqs.map((f) => ({ question: f.question, answer: f.answer })))
          ),
        }}
      />

      {/* Hero with image */}
      <section className="relative bg-black overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src={service.heroImage}
            alt={service.heading}
            fill
            className="object-cover opacity-40"
            priority
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-black/30" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <div className="max-w-2xl">
            <ServiceIcon className="w-14 h-14 text-gold mb-6" />
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-serif font-bold text-white mb-6 leading-tight">
              {service.heading}
            </h1>
            <p className="text-white/75 text-lg md:text-xl leading-relaxed mb-8">
              {service.description}
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/free-valuation"
                className="inline-flex items-center justify-center px-8 py-4 bg-gold text-black font-bold rounded-full hover:bg-gold-light transition-colors shadow-lg cursor-pointer"
              >
                Get Free Valuation <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
              <Link
                href="/how-it-works"
                className="inline-flex items-center justify-center px-8 py-4 border-2 border-white/30 text-white font-semibold rounded-full hover:bg-white/10 transition-colors cursor-pointer"
              >
                How It Works
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Intro + highlights */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            <div className="space-y-5">
              {service.intro.map((paragraph) => (
                <p key={paragraph.slice(0, 40)} className="text-muted-foreground leading-relaxed text-base md:text-lg">
                  {paragraph}
                </p>
              ))}
            </div>
            <div className="bg-surface rounded-3xl border border-border p-8">
              <h2 className="text-xl font-serif font-bold text-black mb-6">Why customers choose us</h2>
              <ul className="space-y-4">
                {service.highlights.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-gold-dark shrink-0 mt-0.5" />
                    <span className="text-black/80 text-sm md:text-base">{item}</span>
                  </li>
                ))}
              </ul>
              <Link
                href="/live-rates"
                className="inline-flex items-center mt-8 text-sm font-semibold text-gold-dark hover:underline cursor-pointer"
              >
                View live rates <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* What we accept */}
      <section className="py-20 bg-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading
            label="What We Buy"
            title="What We Accept"
            description={`We purchase a wide range of ${service.title.toLowerCase().replace("sell ", "")} items — see the categories below.`}
          />
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {service.details.map((d) => (
              <div
                key={d.label}
                className="group overflow-hidden rounded-2xl bg-white border border-border hover:border-gold-dark/30 hover:shadow-xl transition-all duration-300"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                  <Image
                    src={d.image}
                    alt={d.label}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                </div>
                <div className="p-5">
                  <h3 className="font-serif font-bold text-black mb-2">{d.label}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{d.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works for this service */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading
            label="Simple Process"
            title={`How to ${service.title}`}
            description="Four easy steps from valuation to payment."
          />
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {service.steps.map((step, i) => {
              const Icon = stepIcons[i] || FileText;
              return (
                <div
                  key={step.title}
                  className="relative p-6 rounded-2xl bg-surface border border-border hover:border-gold-dark/20 hover:shadow-lg transition-all duration-200"
                >
                  <div className="text-xs font-bold text-gold-dark mb-3">Step {i + 1}</div>
                  <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center mb-4">
                    <Icon className="w-5 h-5 text-gold" />
                  </div>
                  <h3 className="font-serif font-bold text-black mb-2">{step.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{step.text}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-surface">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading title="Common Questions" align="center" />
          <div className="space-y-4 mt-8">
            {service.faqs.map((faq) => (
              <details
                key={faq.question}
                className="group bg-white rounded-2xl border border-border overflow-hidden"
              >
                <summary className="flex items-center justify-between cursor-pointer px-6 py-5 font-semibold text-black list-none">
                  {faq.question}
                  <span className="text-gold-dark text-xl ml-4 group-open:rotate-45 transition-transform duration-200">+</span>
                </summary>
                <div className="px-6 pb-5 text-muted-foreground leading-relaxed text-sm md:text-base border-t border-border pt-4">
                  {faq.answer}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Why sell with us */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading title="Why Sell With Us?" />
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Shield, title: "Fully Insured", text: "Free insured postal service for total peace of mind." },
              { icon: Zap, title: "Same-Day Payment", text: "Accept our offer and receive instant bank transfer." },
              { icon: Truck, title: "Free Returns", text: "Decline our offer? We return your items at no cost." },
            ].map(({ icon: Icon, title, text }) => (
              <div key={title} className="p-8 rounded-2xl bg-surface border border-border text-center">
                <div className="w-14 h-14 bg-gold/10 rounded-xl flex items-center justify-center mx-auto mb-5">
                  <Icon className="w-7 h-7 text-gold-dark" />
                </div>
                <h3 className="text-lg font-serif font-bold text-black mb-2">{title}</h3>
                <p className="text-sm text-muted-foreground">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 gold-gradient">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-white mb-4">
            Ready to {service.title}?
          </h2>
          <p className="text-white/90 mb-8 text-lg">
            Get a free, no-obligation valuation today. Our experts respond within 24 hours.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/free-valuation"
              className="inline-flex items-center justify-center px-8 py-4 bg-black text-white font-bold rounded-full hover:bg-black/80 transition-colors cursor-pointer"
            >
              Get Free Valuation <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
            <Link
              href="/book-appointment"
              className="inline-flex items-center justify-center px-8 py-4 border-2 border-white text-white font-bold rounded-full hover:bg-white/10 transition-colors cursor-pointer"
            >
              Book Appointment
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
