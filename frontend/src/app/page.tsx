import { Hero } from "@/components/sections/Hero";
import { TrustBadges } from "@/components/sections/TrustBadges";
import { WhatWeBuy } from "@/components/sections/WhatWeBuy";
import { DesignerBrands } from "@/components/sections/DesignerBrands";
import { HowItWorks } from "@/components/sections/HowItWorks";
import { LiveRatesPreview } from "@/components/sections/LiveRatesPreview";
import { LivePriceChart } from "@/components/sections/LivePriceChart";
import { WhyChooseUs } from "@/components/sections/WhyChooseUs";
import { GoogleReviews } from "@/components/sections/GoogleReviews";
import { FAQ } from "@/components/sections/FAQ";
import { HattonGardenLocation } from "@/components/sections/HattonGardenLocation";

export default function Home() {
  return (
    <>
      <Hero />
      <TrustBadges />
      <LivePriceChart />
      <WhatWeBuy />
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
