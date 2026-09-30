"use client";

import Image from "next/image";
import Link from "next/link";
import { MapPin, CalendarDays, Navigation, Building2 } from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { HATTON_GARDEN_MEDIA, parseAddress, VISIT_SUITE } from "@/lib/location";
import { VisitDirections } from "@/components/sections/VisitDirections";
import { useSettings } from "@/lib/useSettings";

export function HattonGardenLocation() {
  const settings = useSettings();
  const address = parseAddress(settings.address);

  return (
    <section className="py-20 bg-gray-50" id="visit-us">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          label="Hatton Garden, London"
          title="Where to Sell Gold & Jewellery in London"
          description="Fine Jewellery Buyers is a gold and jewellery buyer at Suite 39, 4th Floor, 88–90 Hatton Garden. Walk in for a free valuation, or sell by insured post from anywhere in the UK."
        />

        <div className="grid lg:grid-cols-2 gap-10 items-center">
          <div className="relative rounded-3xl overflow-hidden border border-border shadow-xl aspect-[4/3] lg:aspect-auto lg:min-h-[420px]">
            <Image
              src={HATTON_GARDEN_MEDIA.buildingImage}
              alt={HATTON_GARDEN_MEDIA.buildingImageAlt}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-6 pt-16">
              <p className="text-gold text-sm font-semibold uppercase tracking-wider mb-1">Our Building</p>
                  <p className="text-white font-serif text-xl font-bold">{VISIT_SUITE.building}</p>
                  <p className="text-white/80 text-sm mt-1">{VISIT_SUITE.suite} · {VISIT_SUITE.floor}</p>
              <p className="text-white/40 text-[10px] mt-2">Photo: Roger W. Haworth / Wikimedia Commons</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-border p-8 shadow-sm">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 bg-gold/10 rounded-xl flex items-center justify-center shrink-0">
                  <Building2 className="w-6 h-6 text-gold-dark" />
                </div>
                <div>
                  <h3 className="text-xl font-serif font-bold text-black mb-2">{settings.business_name}</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Based at <strong className="text-black">{VISIT_SUITE.line}</strong>. Visit us for a free valuation and instant cash on the spot.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl border border-border mb-6">
                <MapPin className="w-5 h-5 text-gold-dark mt-0.5 shrink-0" />
                <address className="not-italic text-black leading-relaxed">
                  <span className="block font-semibold">{VISIT_SUITE.suite}, {VISIT_SUITE.floor}</span>
                  {address.publicLines.map((line, i) => (
                    <span
                      key={`${line}-${i}`}
                      className={`block ${i === address.publicLines.length - 1 ? "text-muted-foreground" : ""}`}
                    >
                      {line}
                    </span>
                  ))}
                </address>
              </div>

              <VisitDirections className="mb-6" />

              <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                Walk-ins welcome during opening hours. Sell gold, Cartier, Tiffany, Boodles and designer jewellery — expert valuation while you wait, instant cash paid on acceptance.
              </p>

              <div className="flex flex-col sm:flex-row gap-3">
                <a
                  href={address.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-black text-white font-semibold rounded-full hover:bg-black/90 transition-colors text-sm min-h-12"
                >
                  <Navigation className="w-4 h-4" />
                  Get Directions
                </a>
                <Link
                  href="/book-appointment"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 border-2 border-gold/40 text-gold-dark font-semibold rounded-full hover:bg-gold/10 transition-colors text-sm min-h-12"
                >
                  <CalendarDays className="w-4 h-4" />
                  Book Appointment
                </Link>
              </div>
              <p className="text-sm text-muted-foreground mt-5">
                <Link href="/sell-gold-london" className="text-gold-dark font-semibold hover:underline">
                  Sell gold in London
                </Link>
                {" · "}
                <Link href="/sell-jewellery-hatton-garden" className="text-gold-dark font-semibold hover:underline">
                  Sell jewellery in Hatton Garden
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
