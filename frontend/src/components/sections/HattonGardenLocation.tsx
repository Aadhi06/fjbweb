import Image from "next/image";
import Link from "next/link";
import { MapPin, CalendarDays, Navigation, Building2 } from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { HATTON_GARDEN } from "@/lib/location";

export function HattonGardenLocation() {
  return (
    <section className="py-20 bg-gray-50" id="visit-us">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          label="Visit Us"
          title="Our Hatton Garden Office"
          description="We're based in the heart of London's famous jewellery quarter — visit us for a free, no-obligation valuation and instant cash on the spot."
        />

        <div className="grid lg:grid-cols-2 gap-10 items-center">
          <div className="relative rounded-3xl overflow-hidden border border-border shadow-xl aspect-[4/3] lg:aspect-auto lg:min-h-[420px]">
            <Image
              src={HATTON_GARDEN.buildingImage}
              alt={HATTON_GARDEN.buildingImageAlt}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-6 pt-16">
              <p className="text-gold text-sm font-semibold uppercase tracking-wider mb-1">Our Building</p>
              <p className="text-white font-serif text-xl font-bold">{HATTON_GARDEN.building}</p>
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
                  <h3 className="text-xl font-serif font-bold text-black mb-2">Fine Jewellery Buyers</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Based at <strong className="text-black">{HATTON_GARDEN.building}</strong>, in the centre of Hatton Garden — London&apos;s historic jewellery district. Our office is on the <strong className="text-black">{HATTON_GARDEN.floor}</strong>.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl border border-border mb-6">
                <MapPin className="w-5 h-5 text-gold-dark mt-0.5 shrink-0" />
                <address className="not-italic text-black leading-relaxed">
                  <span className="block font-semibold">{HATTON_GARDEN.building}</span>
                  <span className="block">{HATTON_GARDEN.floor}</span>
                  <span className="block text-muted-foreground">{HATTON_GARDEN.city}</span>
                </address>
              </div>

              <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                Walk-ins welcome during opening hours. Sell gold, Cartier, Tiffany, Boodles and designer jewellery — expert valuation while you wait, instant cash paid on acceptance.
              </p>

              <div className="flex flex-col sm:flex-row gap-3">
                <a
                  href={HATTON_GARDEN.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-black text-white font-semibold rounded-full hover:bg-black/90 transition-colors text-sm"
                >
                  <Navigation className="w-4 h-4" />
                  Get Directions
                </a>
                <Link
                  href="/book-appointment"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 border-2 border-gold/40 text-gold-dark font-semibold rounded-full hover:bg-gold/10 transition-colors text-sm"
                >
                  <CalendarDays className="w-4 h-4" />
                  Book Appointment
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
