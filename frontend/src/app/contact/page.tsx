"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { DynamicFormRenderer } from "@/components/forms/DynamicFormRenderer";
import { Phone, Mail, MapPin, Clock, Navigation, CalendarDays } from "lucide-react";
import type { DynamicForm } from "@/lib/types";
import { useSettings } from "@/lib/useSettings";
import { HATTON_GARDEN } from "@/lib/location";

const fallbackForm: DynamicForm = {
  id: 2, title: "Contact Us", slug: "contact",
  description: "Get in touch with our team. We'll respond within 24 hours.",
  success_message: "Thank you for contacting us. We'll be in touch shortly!",
  fields: [
    { id: 1, name: "name", label: "Full Name", type: "text", placeholder: "Your name", required: true, order: 1 },
    { id: 2, name: "email", label: "Email Address", type: "email", placeholder: "you@example.com", required: true, order: 2 },
    { id: 3, name: "phone", label: "Phone Number", type: "phone", placeholder: "07XXX XXXXXX", required: false, order: 3 },
    { id: 4, name: "subject", label: "Subject", type: "select", required: true, options: ["Selling Gold", "Selling Diamonds", "Selling Watches", "General Enquiry", "Complaint", "Other"], order: 4 },
    { id: 5, name: "message", label: "Your Message", type: "textarea", placeholder: "Tell us how we can help...", required: true, order: 5 },
  ],
};

export default function ContactPage() {
  const [form, setForm] = useState<DynamicForm>(fallbackForm);
  const settings = useSettings();

  useEffect(() => {
    async function fetchForm() {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8002"}/api/forms/contact`);
        if (res.ok) {
          const json = await res.json();
          setForm(json.data || json);
        }
      } catch {}
    }
    fetchForm();
  }, []);

  const phone = settings.phone;
  const email = settings.email;
  const phoneHref = `tel:${phone.replace(/\s/g, "")}`;

  const contactItems = [
    { icon: Phone, title: "Phone", text: phone, href: phoneHref },
    { icon: Mail, title: "Email", text: email, href: `mailto:${email}` },
    { icon: MapPin, title: "Address", text: settings.address },
    { icon: Clock, title: "Opening Hours", text: settings.opening_hours },
  ];

  return (
    <>
      <section className="bg-black py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl md:text-5xl font-serif font-bold text-white mb-4">Contact Our Gold Buying Experts</h1>
          <p className="text-white/70 max-w-2xl mx-auto text-lg">
            Visit us at {HATTON_GARDEN.building}, Hatton Garden — or send us a message below.
          </p>
        </div>
      </section>
      <section className="py-16 bg-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-3xl shadow-xl border border-border p-8 md:p-12">
                <SectionHeading title={form.title} align="left" />
                <DynamicFormRenderer form={form} />
              </div>
            </div>
            <div className="space-y-6">
              <div className="bg-white rounded-2xl border border-border overflow-hidden shadow-sm">
                <div className="relative aspect-[16/10]">
                  <Image
                    src={HATTON_GARDEN.buildingImage}
                    alt={HATTON_GARDEN.buildingImageAlt}
                    fill
                    className="object-cover"
                    sizes="400px"
                  />
                </div>
                <div className="p-6">
                  <p className="text-xs text-gold-dark font-semibold uppercase tracking-wider mb-2">Our Hatton Garden Office</p>
                  <address className="not-italic text-sm text-muted-foreground leading-relaxed mb-4">
                    <span className="block font-semibold text-black">{HATTON_GARDEN.building}</span>
                    <span className="block">{HATTON_GARDEN.floor}</span>
                    <span className="block">{HATTON_GARDEN.city}</span>
                  </address>
                  <div className="flex flex-col gap-2">
                    <a
                      href={HATTON_GARDEN.mapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-black text-white text-sm font-semibold rounded-full hover:bg-black/90 transition-colors"
                    >
                      <Navigation className="w-4 h-4" />
                      Get Directions
                    </a>
                    <Link
                      href="/book-appointment"
                      className="inline-flex items-center justify-center gap-2 px-4 py-2.5 border border-gold/40 text-gold-dark text-sm font-semibold rounded-full hover:bg-gold/10 transition-colors"
                    >
                      <CalendarDays className="w-4 h-4" />
                      Book Appointment
                    </Link>
                  </div>
                </div>
              </div>

              {contactItems.map(({ icon: Icon, title, text, href }) => (
                <div key={title} className="bg-white p-6 rounded-2xl border border-border">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gold/10 rounded-xl flex items-center justify-center shrink-0"><Icon className="w-6 h-6 text-gold-dark" /></div>
                    <div>
                    <h3 className="font-semibold text-black mb-1">{title}</h3>
                    {href ? <a href={href} className="text-sm text-gold-dark hover:underline cursor-pointer">{text}</a> : <p className="text-sm text-muted-foreground">{text}</p>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
