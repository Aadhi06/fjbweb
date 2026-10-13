import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Mail,
  MessageCircle,
  Package,
  Printer,
  QrCode,
  Receipt,
  Shield,
  Smartphone,
} from "lucide-react";
import { RoyalMailTracker } from "@/components/sections/RoyalMailTracker";
import { getSettings } from "@/lib/settings";
import { buildMetadata, breadcrumbJsonLd, faqJsonLd, PAGE_SEO, SITE_URL } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  ...PAGE_SEO["prepaid-delivery"],
  ogImage: `${SITE_URL}/images/why-secure-collection.png`,
});

const STEPS = [
  {
    title: "Tell us what you are sending",
    text: "First, let us know what you are sending and its value, so we can confirm the appropriate postage cover.",
  },
  {
    title: "We send a prepaid label and QR code",
    text: "We’ll send you a prepaid postage label and QR code by WhatsApp or email. The label already has our delivery address on it.",
  },
  {
    title: "Pack your jewellery carefully",
    text: "Wrap your jewellery carefully, place it inside a sturdy box with suitable padding, and seal the package securely. Include your name and reference number inside.",
  },
  {
    title: "Attach the label",
    text: "Have a printer? Print the label and attach it to your parcel. No printer? Take your parcel and the QR code on your phone to a Post Office — they will print and attach the label for you.",
  },
  {
    title: "Hand it in at the counter",
    text: "Hand the parcel to the counter staff and ask for proof of postage. There is no postage to pay when you use the prepaid label we provide. Please do not put it in a postbox.",
  },
  {
    title: "Send us a photo of the receipt",
    text: "Keep your receipt and send us a photo of it so we can track your parcel.",
  },
  {
    title: "We confirm when it arrives",
    text: "Once your parcel arrives, we will contact you to confirm we have received it.",
  },
];

const FAQS = [
  {
    question: "Do I pay for postage?",
    answer:
      "No. Fine Jewellery Buyers arranges and pays for Royal Mail Special Delivery. We send a prepaid label or QR code by WhatsApp or email.",
  },
  {
    question: "What if I do not have a printer?",
    answer:
      "Take your parcel and the QR code on your phone to a Post Office. They will print and attach the prepaid label for you.",
  },
  {
    question: "Can I put the parcel in a postbox?",
    answer:
      "No. Hand it over at the Post Office counter and ask for proof of postage. Do not put jewellery in a postbox.",
  },
  {
    question: "How do I track my parcel?",
    answer:
      "Enter the Royal Mail reference from your proof of postage or prepaid label in Track your item on this page. It opens Royal Mail Track and Trace.",
  },
];

export default async function PrepaidDeliveryPage() {
  const settings = await getSettings();
  const waDigits = (settings.whatsapp || "").replace(/\D/g, "");
  const howTo = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: "How to send jewellery with our prepaid Royal Mail Special Delivery",
    description: PAGE_SEO["prepaid-delivery"].description,
    totalTime: "PT20M",
    step: STEPS.map((step, i) => ({
      "@type": "HowToStep",
      position: i + 1,
      name: step.title,
      text: step.text,
    })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howTo) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd(FAQS)) }} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbJsonLd([
              { name: "Home", path: "/" },
              { name: "How It Works", path: "/how-it-works" },
              { name: "Prepaid Delivery", path: "/prepaid-delivery" },
            ])
          ),
        }}
      />

      <section className="bg-black py-14 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-10 items-center">
          <div>
            <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#E01A22] bg-white px-3 py-1.5 rounded-full mb-5">
              Royal Mail Special Delivery
            </p>
            <h1 className="text-3xl md:text-5xl font-serif font-bold text-white mb-4 leading-tight">
              Prepaid Delivery
            </h1>
            <p className="text-white/75 text-lg leading-relaxed max-w-xl">
              Sending your jewellery to us is simple. We arrange and pay for your Royal Mail Special Delivery
              postage — fully insured and tracked.
            </p>
            <div className="flex flex-wrap gap-3 mt-8">
              <Link
                href="/free-valuation"
                className="inline-flex items-center justify-center min-h-12 px-6 bg-[#D97706] text-white font-semibold rounded-full hover:bg-[#b45309]"
              >
                Start a free valuation <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
              <a
                href="#track-your-item"
                className="inline-flex items-center justify-center min-h-12 px-6 border-2 border-white text-white font-semibold rounded-full hover:bg-white/10"
              >
                Track your item
              </a>
            </div>
          </div>
          <div className="rounded-2xl overflow-hidden bg-white border border-white/10">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/why-secure-collection.png"
              alt="Royal Mail Special Delivery prepaid jewellery parcel"
              className="w-full h-auto object-cover"
            />
          </div>
        </div>
      </section>

      <RoyalMailTracker />

      <section className="py-16 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl md:text-3xl font-serif font-bold text-black mb-4">How prepaid postage works</h2>
          <p className="text-muted-foreground text-lg leading-relaxed mb-10">
            You tell us what you are sending. We send the label. You pack the jewellery, take it to the Post Office
            counter, and keep the receipt. We confirm when it arrives.
          </p>
          <ol className="space-y-5">
            {STEPS.map((step, i) => (
              <li key={step.title} className="flex gap-4">
                <span className="shrink-0 w-10 h-10 rounded-full bg-black text-gold font-bold flex items-center justify-center">
                  {i + 1}
                </span>
                <div>
                  <h3 className="font-serif font-bold text-black text-lg">{step.title}</h3>
                  <p className="text-muted-foreground leading-relaxed mt-1">{step.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="py-16 bg-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl md:text-3xl font-serif font-bold text-black mb-3 text-center">
            Printer or no printer — both work
          </h2>
          <p className="text-muted-foreground text-center max-w-2xl mx-auto mb-10">
            We send the prepaid label and QR code by WhatsApp or email. Use whichever is easier.
          </p>
          <div className="grid md:grid-cols-2 gap-6">
            <article className="bg-white rounded-2xl border border-border overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/prepaid-print-label.jpg"
                alt="Printed prepaid postage label on a sealed jewellery box"
                className="w-full h-56 object-cover"
              />
              <div className="p-6">
                <div className="flex items-center gap-2 text-black font-semibold mb-2">
                  <Printer className="w-5 h-5 text-[#D97706]" />
                  Have a printer?
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  Print the label and attach it to your parcel. The delivery address is already filled in.
                </p>
              </div>
            </article>
            <article className="bg-white rounded-2xl border border-border overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/prepaid-qr-post-office.jpg"
                alt="QR code on a phone at a Post Office counter for a prepaid label"
                className="w-full h-56 object-cover"
              />
              <div className="p-6">
                <div className="flex items-center gap-2 text-black font-semibold mb-2">
                  <Smartphone className="w-5 h-5 text-[#D97706]" />
                  No printer?
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  Take your parcel and the QR code on your phone to a Post Office. They will print and attach the
                  label for you.
                </p>
              </div>
            </article>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: Shield, title: "We pay the postage", text: "Royal Mail Special Delivery is arranged and paid by us." },
              { icon: QrCode, title: "Label or QR code", text: "Sent by WhatsApp or email, with our address already on it." },
              { icon: Receipt, title: "Keep the receipt", text: "Ask for proof of postage and send us a photo so we can track it." },
              { icon: Package, title: "Pack it well", text: "Sturdy box, padding, sealed shut, name and reference inside." },
            ].map((item) => (
              <div key={item.title} className="p-5 rounded-2xl border border-border bg-surface">
                <item.icon className="w-6 h-6 text-[#D97706] mb-3" />
                <h3 className="font-serif font-bold text-black mb-1">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.text}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 rounded-2xl border-2 border-[#E01A22] bg-[#E01A22]/5 px-5 py-5">
            <p className="font-semibold text-black">Please hand it to the Post Office counter.</p>
            <p className="text-muted-foreground mt-1 leading-relaxed">
              Do not put jewellery in a postbox. Counter staff will take the prepaid parcel and give you proof of
              postage. There is nothing to pay at the counter when you use our label.
            </p>
          </div>

          <div className="mt-10 max-w-3xl">
            <h2 className="text-2xl font-serif font-bold text-black mb-4">Common questions</h2>
            <dl className="space-y-4">
              {FAQS.map((faq) => (
                <div key={faq.question}>
                  <dt className="font-semibold text-black">{faq.question}</dt>
                  <dd className="text-muted-foreground leading-relaxed mt-1">{faq.answer}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      <section className="py-16 gold-gradient">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-serif font-bold text-white mb-4">Ready to send your jewellery?</h2>
          <p className="text-white/90 mb-8 text-lg">
            Start with a free valuation. We then send the prepaid Royal Mail label by WhatsApp or email.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/free-valuation"
              className="inline-flex items-center min-h-12 px-8 bg-black text-white font-bold rounded-full hover:bg-black/80"
            >
              Get a free valuation <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
            {waDigits ? (
              <a
                href={`https://wa.me/${waDigits}`}
                className="inline-flex items-center min-h-12 px-6 bg-white text-black font-semibold rounded-full"
              >
                <MessageCircle className="w-4 h-4 mr-2" /> WhatsApp us
              </a>
            ) : null}
            <Link
              href="/contact"
              className="inline-flex items-center min-h-12 px-6 bg-white/15 text-white font-semibold rounded-full"
            >
              <Mail className="w-4 h-4 mr-2" /> Email
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
