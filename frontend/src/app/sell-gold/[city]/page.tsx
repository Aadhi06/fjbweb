import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LocationIntentPage } from "@/components/sections/LocationIntentPage";
import { getSellGoldCity, sellGoldCitySlugs, SELL_GOLD_CITIES } from "@/lib/sell-gold-cities";
import { getSettings } from "@/lib/settings";
import {
  breadcrumbJsonLd,
  buildMetadata,
  faqJsonLd,
  howToJsonLd,
  speakableWebPageJsonLd,
} from "@/lib/seo";

type Props = { params: Promise<{ city: string }> };

export function generateStaticParams() {
  return sellGoldCitySlugs().map((city) => ({ city }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { city } = await params;
  const content = getSellGoldCity(city);
  if (!content) return {};
  const cityMeta = SELL_GOLD_CITIES.find((c) => c.slug === city)!;
  return buildMetadata({
    title: `Sell Gold in ${cityMeta.city} | Free Valuation | Hatton Garden Buyers`,
    description: `Sell gold in ${cityMeta.city} via Fine Jewellery Buyers. Free valuation online, visit Hatton Garden London, or insured UK post. Live rates and same-day payment.`,
    path: `/sell-gold/${city}`,
    keywords: [
      `sell gold ${cityMeta.city}`,
      `gold buyers ${cityMeta.city}`,
      `sell scrap gold ${cityMeta.city}`,
      `cash for gold ${cityMeta.city}`,
      `free gold valuation ${cityMeta.city}`,
    ],
    ogImage: content.heroImage,
  });
}

export default async function SellGoldCityPage({ params }: Props) {
  const { city } = await params;
  const content = getSellGoldCity(city);
  if (!content) notFound();

  const settings = await getSettings();
  const path = `/sell-gold/${city}`;
  const title = `Sell Gold in ${SELL_GOLD_CITIES.find((c) => c.slug === city)!.city}`;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbJsonLd([
              { name: "Home", path: "/" },
              { name: "Sell Gold", path: "/sell-gold" },
              { name: content.h1, path },
            ])
          ),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            speakableWebPageJsonLd({
              path,
              name: title,
              description: content.lead,
            })
          ),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqJsonLd(content.faqs)),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            howToJsonLd({
              name: content.howToName,
              description: content.howToDescription,
              steps: content.steps,
            })
          ),
        }}
      />
      <LocationIntentPage content={content} settings={settings} />
    </>
  );
}
