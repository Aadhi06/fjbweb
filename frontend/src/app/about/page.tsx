"use client";

import { useEffect, useState } from "react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { GoogleReviews } from "@/components/sections/GoogleReviews";
import { HattonGardenLocation } from "@/components/sections/HattonGardenLocation";
import Link from "next/link";
import { ArrowRight, Shield, Award, Users, Gem, Target, Eye, Loader2 } from "lucide-react";
import { useSettings } from "@/lib/useSettings";

const API_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8002") + "/api";

type TeamMember = {
  id: number;
  name: string;
  role: string;
  bio: string;
  photo: string | null;
};

type ValueItem = { title: string; description: string };

const defaultValues: ValueItem[] = [
  { title: "Trust & Integrity", description: "Transparent valuations. No hidden fees." },
  { title: "Expert Knowledge", description: "GIA-certified gemologists and watchmakers." },
  { title: "Customer First", description: "10,000+ happy customers across the UK." },
  { title: "Fair Pricing", description: "Live market-linked rates for the best price." },
];

const valueIcons = [Shield, Award, Users, Gem, Target, Eye];

export default function AboutPage() {
  const settings = useSettings();
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [loadingTeam, setLoadingTeam] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/team`)
      .then((r) => r.json())
      .then((d) => setTeam(d.data || []))
      .catch(() => {})
      .finally(() => setLoadingTeam(false));
  }, []);

  let values: ValueItem[] = defaultValues;
  try {
    const parsed = typeof settings.about_values === "string"
      ? JSON.parse(settings.about_values || "[]")
      : settings.about_values;
    if (Array.isArray(parsed) && parsed.length > 0) values = parsed;
  } catch {}

  const title = settings.about_title || "About Fine Jewellery Buyers";
  const description = settings.about_description || "";
  const mission = settings.about_mission || "";
  const vision = settings.about_vision || "";

  const fallbackDescription = `Based at 88–90 Hatton Garden, 4th Floor, Office No. 39, in the heart of London\u2019s famous jewellery quarter, Fine Jewellery Buyers has been at the forefront of the precious metals and gemstones industry for over 15 years. We specialise in purchasing gold, diamonds, luxury watches, and fine jewellery, offering the most competitive prices in the UK.\n\nOur team of GIA-certified experts combines deep industry knowledge with a passion for precious items. We use live market-linked pricing to ensure you receive the fairest possible price, backed by a transparent and secure valuation process.\n\nWhether you visit us in person or use our fully insured postal service, we guarantee a professional, respectful, and rewarding experience every time.`;

  return (
    <>
      <section className="bg-black py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl md:text-5xl font-serif font-bold text-white mb-4">{title}</h1>
          <p className="text-white/70 max-w-2xl mx-auto text-lg">
            {settings.tagline || "UK\u2019s trusted buyer of gold, diamonds, watches & fine jewellery."}
          </p>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-6 text-secondary-light leading-relaxed text-lg">
            {(description || fallbackDescription).split("\n").filter(Boolean).map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        </div>
      </section>

      {(mission || vision) && (
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 gap-8">
              {mission && (
                <div className="bg-white rounded-2xl border border-gray-200 p-8">
                  <div className="w-14 h-14 bg-[#D97706]/10 rounded-xl flex items-center justify-center mb-5">
                    <Target className="w-7 h-7 text-[#D97706]" />
                  </div>
                  <h3 className="text-xl font-serif font-bold text-black mb-3">Our Mission</h3>
                  <p className="text-gray-600 leading-relaxed">{mission}</p>
                </div>
              )}
              {vision && (
                <div className="bg-white rounded-2xl border border-gray-200 p-8">
                  <div className="w-14 h-14 bg-[#D97706]/10 rounded-xl flex items-center justify-center mb-5">
                    <Eye className="w-7 h-7 text-[#D97706]" />
                  </div>
                  <h3 className="text-xl font-serif font-bold text-black mb-3">Our Vision</h3>
                  <p className="text-gray-600 leading-relaxed">{vision}</p>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      <section className="py-20 bg-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading title="Our Values" />
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map(({ title: vTitle, description: vDesc }, idx) => {
              const Icon = valueIcons[idx % valueIcons.length];
              return (
                <div key={idx} className="p-8 rounded-2xl border border-border bg-white text-center">
                  <div className="w-14 h-14 bg-gold/10 rounded-xl flex items-center justify-center mx-auto mb-5">
                    <Icon className="w-7 h-7 text-gold-dark" />
                  </div>
                  <h3 className="text-lg font-serif font-bold text-black mb-2">{vTitle}</h3>
                  <p className="text-sm text-muted-foreground">{vDesc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {!loadingTeam && team.length > 0 && (
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <SectionHeading title="Meet Our Team" />
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {team.map((member) => {
                const photoSrc = member.photo
                  ? member.photo.startsWith("http")
                    ? member.photo
                    : `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8002"}${member.photo}`
                  : "";
                return (
                  <div key={member.id} className="text-center group">
                    <div className="w-40 h-40 mx-auto mb-5 rounded-full overflow-hidden bg-gray-100 border-4 border-gray-200 group-hover:border-[#D97706] transition-colors">
                      {photoSrc ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={photoSrc} alt={member.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Users className="w-16 h-16 text-gray-300" />
                        </div>
                      )}
                    </div>
                    <h3 className="text-lg font-serif font-bold text-black">{member.name}</h3>
                    <p className="text-sm text-[#D97706] font-medium mt-1">{member.role}</p>
                    {member.bio && (
                      <p className="text-sm text-gray-500 mt-3 leading-relaxed">{member.bio}</p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {loadingTeam && (
        <section className="py-20 bg-white">
          <div className="flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-gray-300" />
          </div>
        </section>
      )}

      <HattonGardenLocation />

      <GoogleReviews />

      <section className="py-16 gold-gradient">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-serif font-bold text-white mb-4">Ready to Sell Your Gold?</h2>
          <p className="text-white/90 mb-8 text-lg">Get a free, no-obligation valuation today.</p>
          <Link href="/free-valuation" className="inline-flex items-center px-8 py-4 bg-black text-white font-bold rounded-full hover:bg-black/80 transition-colors cursor-pointer">
            Get Free Valuation <ArrowRight className="w-5 h-5 ml-2" />
          </Link>
        </div>
      </section>
    </>
  );
}
