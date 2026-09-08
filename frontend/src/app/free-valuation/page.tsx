"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { DynamicFormRenderer } from "@/components/forms/DynamicFormRenderer";
import { Shield, Clock, Banknote, ArrowDown, Sparkles } from "lucide-react";
import type { DynamicForm } from "@/lib/types";
import { useSettings } from "@/lib/useSettings";

const fallbackForm: DynamicForm = {
  id: 1, title: "Free Valuation", slug: "free-valuation",
  description: "Fill in the form below and our experts will provide a free valuation within 24 hours.",
  success_message: "Thank you! We will contact you within 24 hours with a valuation.",
  fields: [
    { id: 1, name: "name", label: "Full Name", type: "text", placeholder: "John Smith", required: true, order: 1 },
    { id: 2, name: "email", label: "Email Address", type: "email", placeholder: "john@example.com", required: true, order: 2 },
    { id: 3, name: "phone", label: "Phone Number", type: "phone", placeholder: "07XXX XXXXXX", required: true, order: 3 },
    { id: 4, name: "item_type", label: "What are you selling?", type: "select", required: true, options: ["Gold Jewellery", "Diamonds", "Luxury Watch", "Silver", "Platinum", "Branded Jewellery", "Gemstones", "Other"], order: 4 },
    { id: 5, name: "description", label: "Item Description", type: "textarea", placeholder: "Describe your item(s) - carat, weight, brand, condition...", required: true, order: 5 },
    { id: 9, name: "expected_price", label: "Expected Price", type: "text", placeholder: "e.g. £500 or best offer", required: false, order: 6 },
    { id: 6, name: "photos", label: "Upload Photos", type: "file", required: false, order: 7 },
    { id: 7, name: "preferred_contact", label: "Preferred Contact Method", type: "radio", required: true, options: ["Phone", "Email", "WhatsApp"], order: 8 },
    { id: 8, name: "consent", label: "I agree to the privacy policy", type: "checkbox", required: true, order: 9 },
  ],
};

function FreeValuationContent() {
  const [form, setForm] = useState<DynamicForm>(fallbackForm);
  const [highlightForm, setHighlightForm] = useState(false);
  const settings = useSettings();
  const searchParams = useSearchParams();
  const fromGuide = searchParams.get("from") === "guide";
  const itemType = searchParams.get("item") || "";

  useEffect(() => {
    async function fetchForm() {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8002"}/api/forms/free-valuation`);
        if (res.ok) {
          const json = await res.json();
          setForm(json.data || json);
        }
      } catch {}
    }
    fetchForm();
  }, []);

  useEffect(() => {
    if (!fromGuide) return;
    setHighlightForm(true);
    const scrollTimer = setTimeout(() => {
      document.getElementById("valuation-form")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 400);
    const highlightTimer = setTimeout(() => setHighlightForm(false), 6000);
    return () => {
      clearTimeout(scrollTimer);
      clearTimeout(highlightTimer);
    };
  }, [fromGuide]);

  const defaultValues = itemType ? { item_type: itemType } : undefined;

  return (
    <>
      {fromGuide && (
        <div className="bg-gold/10 border-b border-gold/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-start sm:items-center gap-3">
            <div className="w-10 h-10 bg-gold/20 rounded-full flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5 text-gold-dark" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-black text-sm sm:text-base">You&apos;re almost there!</p>
              <p className="text-muted-foreground text-xs sm:text-sm">
                Fill in the form below — add your details, describe your item{itemType ? ` (${itemType})` : ""}, and upload up to 5 photos so we can reply more easily.
              </p>
            </div>
            <ArrowDown className="w-5 h-5 text-gold-dark shrink-0 hidden sm:block animate-bounce" />
          </div>
        </div>
      )}
      <section className="bg-black py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl md:text-5xl font-serif font-bold text-white mb-4">Free Gold &amp; Jewellery Valuation</h1>
          <p className="text-white/70 max-w-2xl mx-auto text-lg">Submit your item details for a free, no-obligation estimate within 24 hours.</p>
        </div>
      </section>
      <section className="py-16 bg-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-3xl shadow-xl border border-border p-8 md:p-12">
                <SectionHeading title={form.title} align="left" />
                <DynamicFormRenderer form={form} defaultValues={defaultValues} highlighted={highlightForm} />
              </div>
            </div>
            <div className="space-y-6">
              {[
                { icon: Shield, title: "100% Secure", text: "Your details are encrypted and never shared." },
                { icon: Clock, title: "24hr Response", text: "Our experts reply within 24 hours." },
                { icon: Banknote, title: "Best Prices", text: "Live market rates for the best price." },
              ].map(({ icon: Icon, title, text }) => (
                <div key={title} className="bg-white p-6 rounded-2xl border border-border">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gold/10 rounded-xl flex items-center justify-center shrink-0"><Icon className="w-6 h-6 text-gold-dark" /></div>
                    <div><h3 className="font-semibold text-black mb-1">{title}</h3><p className="text-sm text-muted-foreground">{text}</p></div>
                  </div>
                </div>
              ))}
              <div className="bg-white rounded-2xl p-6 border border-primary/30">
                <h3 className="font-serif font-bold text-lg text-secondary mb-3">Prefer to Call?</h3>
                <p className="text-muted-foreground text-sm mb-4">Speak directly with our experts.</p>
                <a href={`tel:${settings.phone.replace(/\s/g, "")}`} className="text-2xl font-bold text-primary hover:underline cursor-pointer">{settings.phone}</a>
                <p className="text-xs text-muted-foreground mt-2">{settings.opening_hours}</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export default function FreeValuationPage() {
  return (
    <Suspense fallback={null}>
      <FreeValuationContent />
    </Suspense>
  );
}
