import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Banknote, Calculator, CheckCircle2, Phone } from "lucide-react";
import type { GoldSeoPageContent } from "@/lib/gold-seo-pages";
import type { SiteSettings } from "@/lib/settings";

type Props = {
  content: GoldSeoPageContent;
  settings: SiteSettings;
};

export function GoldSeoPage({ content, settings }: Props) {
  const phoneHref = `tel:${settings.phone.replace(/\s/g, "")}`;
  const valuationParams = new URLSearchParams({
    item: content.valuationItem,
    value: content.valuationValue,
  });
  const valuationHref = `/free-valuation?${valuationParams.toString()}`;

  return (
    <>
      <section className="relative bg-black overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src={content.heroImage}
            alt={content.h1}
            fill
            className="object-cover opacity-40"
            priority
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/85 to-black/40" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <p className="text-gold text-sm font-semibold uppercase tracking-wider mb-4">{content.label}</p>
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-serif font-bold text-white mb-6 leading-tight max-w-3xl">
            {content.h1}
          </h1>
          <p className="ai-direct-answer text-white/85 text-lg md:text-xl leading-relaxed max-w-3xl mb-8">
            {content.lead}
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href={valuationHref}
              className="inline-flex items-center justify-center px-8 py-4 bg-gold text-black font-bold rounded-full hover:bg-gold-light transition-colors shadow-lg cursor-pointer min-h-12"
            >
              Get a free valuation <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
            <Link
              href="/book-appointment"
              className="inline-flex items-center justify-center px-8 py-4 border-2 border-white/30 text-white font-semibold rounded-full hover:bg-white/10 transition-colors cursor-pointer min-h-12"
            >
              Book Hatton Garden appointment
            </Link>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2 space-y-5">
              {content.paragraphs.map((paragraph) => (
                <p key={paragraph.slice(0, 48)} className="text-muted-foreground text-base md:text-lg leading-relaxed">
                  {paragraph}
                </p>
              ))}
              <ol className="mt-8 space-y-4">
                {content.steps.map((step, i) => (
                  <li key={step.name} className="flex gap-4">
                    <span className="w-10 h-10 rounded-full bg-gold/15 text-gold-dark font-bold flex items-center justify-center shrink-0">
                      {i + 1}
                    </span>
                    <div>
                      <h2 className="font-serif font-bold text-black text-lg">{step.name}</h2>
                      <p className="text-muted-foreground leading-relaxed">{step.text}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
            <aside className="space-y-6">
              <div className="bg-surface rounded-3xl border border-border p-6 md:p-8">
                <p className="text-gold-dark text-xs font-semibold uppercase tracking-wider mb-2">Check the market</p>
                <h2 className="text-xl font-serif font-bold text-black mb-3">See what we pay today</h2>
                <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                  Live 9ct–24ct buying rates and an instant weight calculator — then send photos or visit Hatton Garden.
                </p>
                <div className="flex flex-col gap-3">
                  <Link
                    href="/live-rates"
                    className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-black text-white font-semibold rounded-full hover:bg-black/90 transition-colors text-sm min-h-12"
                  >
                    Live gold rates
                  </Link>
                  <Link
                    href="/gold-calculator"
                    className="inline-flex items-center justify-center gap-2 px-5 py-3 border-2 border-gold/40 text-gold-dark font-semibold rounded-full hover:bg-gold/10 transition-colors text-sm min-h-12"
                  >
                    <Calculator className="w-4 h-4" />
                    Gold calculator
                  </Link>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>

      <section className="py-16 bg-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-2 gap-6">
            {content.highlights.map((item) => (
              <div key={item.title} className="bg-white rounded-2xl border border-border p-6">
                <div className="w-11 h-11 rounded-xl bg-gold/10 flex items-center justify-center mb-4">
                  <CheckCircle2 className="w-5 h-5 text-gold-dark" />
                </div>
                <h3 className="font-serif font-bold text-black text-lg mb-2">{item.title}</h3>
                <p className="text-muted-foreground leading-relaxed text-sm">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-20 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-serif font-bold text-black mb-8 text-center">Questions people ask</h2>
          <div className="space-y-3">
            {content.faqs.map((faq) => (
              <details key={faq.question} className="group border border-border rounded-xl bg-surface overflow-hidden">
                <summary className="cursor-pointer list-none px-6 py-5 font-semibold text-black flex items-center justify-between gap-4 min-h-12">
                  {faq.question}
                  <span className="text-gold-dark group-open:rotate-45 transition-transform text-2xl leading-none">+</span>
                </summary>
                <p className="px-6 pb-5 text-muted-foreground leading-relaxed">{faq.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 bg-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap gap-3 justify-center">
          {content.related.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="px-5 py-3 rounded-full border border-border bg-white text-sm font-semibold text-black hover:border-gold-dark/40 hover:text-gold-dark transition-colors min-h-12 inline-flex items-center"
            >
              {link.name}
            </Link>
          ))}
        </div>
      </section>

      <section className="py-16 gold-gradient">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Banknote className="w-10 h-10 text-white mx-auto mb-4" />
          <h2 className="text-3xl font-serif font-bold text-white mb-4">Ready to sell gold?</h2>
          <p className="text-white/90 mb-8 text-lg">
            Free valuation — tell us if the lot is over £2,000 so a senior valuer handles it the same day.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href={valuationHref}
              className="inline-flex items-center justify-center px-8 py-4 bg-black text-white font-bold rounded-full hover:bg-black/80 transition-colors cursor-pointer min-h-12"
            >
              Start free valuation <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
            <a
              href={phoneHref}
              className="inline-flex items-center justify-center px-8 py-4 border-2 border-white text-white font-bold rounded-full hover:bg-white/10 transition-colors cursor-pointer min-h-12"
            >
              <Phone className="w-4 h-4 mr-2" />
              Call {settings.phone}
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
