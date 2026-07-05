"use client";

import Image from "next/image";
import { MessageCircle, Phone } from "lucide-react";
import type { SiteSettings } from "@/lib/settings";

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

export function MaintenancePage({ settings }: { settings: SiteSettings }) {
  const message = encodeURIComponent(
    "Hi, I'd like to sell my gold. I saw your maintenance page and would like a valuation."
  );
  const whatsappUrl = `https://wa.me/${settings.whatsapp}?text=${message}`;
  const phoneHref = `tel:${settings.phone.replace(/\s/g, "")}`;

  return (
    <div className="min-h-screen hero-gradient relative overflow-hidden flex items-center justify-center px-4 py-12">
      <div
        className="absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 20%, #F59E0B 0%, transparent 45%), radial-gradient(circle at 80% 80%, #D97706 0%, transparent 40%)",
        }}
      />
      <div className="absolute top-0 left-0 right-0 h-1 gold-gradient" />

      <div className="relative z-10 w-full max-w-4xl">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-14 items-center">
          <div className="relative order-2 lg:order-1 text-center lg:text-left fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-gold-dark/40 bg-gold-dark/10 text-gold-light text-xs font-semibold tracking-widest uppercase mb-6">
              <span className="w-2 h-2 rounded-full bg-gold-light animate-pulse" />
              We&apos;re Still Buying
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold text-white leading-tight mb-4">
              We Buy <span className="gold-text">Gold</span>
            </h1>

            <p className="text-lg text-white/70 leading-relaxed mb-8 max-w-xl mx-auto lg:mx-0">
              {settings.maintenance_message}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-3 px-8 py-4 rounded-xl bg-[#25D366] text-white font-semibold text-lg shadow-2xl hover:bg-[#20bd5a] hover:scale-[1.02] transition-all duration-200 cursor-pointer"
              >
                <WhatsAppIcon className="w-6 h-6 shrink-0" />
                Chat on WhatsApp
              </a>
              <a
                href={phoneHref}
                className="inline-flex items-center justify-center gap-3 px-8 py-4 rounded-xl border border-white/20 bg-white/5 text-white font-semibold text-lg hover:bg-white/10 hover:border-gold-dark/50 transition-all duration-200 cursor-pointer"
              >
                <Phone className="w-5 h-5 text-gold-light shrink-0" />
                {settings.phone}
              </a>
            </div>

            <p className="mt-8 text-sm text-white/40 flex items-center justify-center lg:justify-start gap-2">
              <MessageCircle className="w-4 h-4 text-gold-dark" />
              Hatton Garden, London · Same-day bank transfer
            </p>
          </div>

          <div className="relative order-1 lg:order-2 flex justify-center fade-in">
            <div className="relative w-full max-w-md aspect-square">
              <div className="absolute inset-4 rounded-full bg-gold-dark/20 blur-3xl" />
              <div className="relative rounded-3xl overflow-hidden border border-gold-dark/30 shadow-2xl shadow-gold-dark/20">
                <Image
                  src="/images/gold-bars-coins.png"
                  alt="Gold bars and coins — we buy gold for cash"
                  width={560}
                  height={560}
                  className="w-full h-auto object-cover"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <p className="text-white font-serif text-2xl font-bold">{settings.business_name}</p>
                  <p className="text-gold-light text-sm mt-1">{settings.tagline}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
