import { Hero } from "@/components/sections/Hero";
import { TrustBadges } from "@/components/sections/TrustBadges";
import { WhatWeBuy } from "@/components/sections/WhatWeBuy";
import { HighValueGold } from "@/components/sections/HighValueGold";
import { DesignerBrands } from "@/components/sections/DesignerBrands";
import { HowItWorks } from "@/components/sections/HowItWorks";
import { LiveRatesPreview } from "@/components/sections/LiveRatesPreview";
import { LivePriceChart } from "@/components/sections/LivePriceChart";
import { WhyChooseUs } from "@/components/sections/WhyChooseUs";
import { GoogleReviews } from "@/components/sections/GoogleReviews";
import { FAQ } from "@/components/sections/FAQ";
import { HattonGardenLocation } from "@/components/sections/HattonGardenLocation";
import { faqJsonLd } from "@/lib/seo";
import { HATTON_GARDEN_JEWELLERY_FAQS, LONDON_GOLD_FAQS } from "@/lib/location-pages";

const HOME_FAQS = [...LONDON_GOLD_FAQS, ...HATTON_GARDEN_JEWELLERY_FAQS];

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd(HOME_FAQS)) }}
      />
      <Hero />
      <TrustBadges />
      <LivePriceChart />
      <WhatWeBuy />
      <HighValueGold />
      <DesignerBrands />
      <LiveRatesPreview />
      <HowItWorks />
      <WhyChooseUs />
      <HattonGardenLocation />
      <GoogleReviews />
      <FAQ />
    </>
  );
}
