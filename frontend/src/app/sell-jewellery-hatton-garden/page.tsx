import type { Metadata } from "next";
import { LocationIntentPage } from "@/components/sections/LocationIntentPage";
import { LOCATION_PAGES } from "@/lib/location-pages";
import { getSettings } from "@/lib/settings";
import {
  breadcrumbJsonLd,
  buildMetadata,
  faqJsonLd,
  howToJsonLd,
  PAGE_SEO,
  speakableWebPageJsonLd,
} from "@/lib/seo";

const SLUG = "sell-jewellery-hatton-garden" as const;
const content = LOCATION_PAGES[SLUG];

export const metadata: Metadata = buildMetadata({
  ...PAGE_SEO[SLUG],
  ogImage: content.heroImage,
});

export default async function Page() {
  const settings = await getSettings();
  const seo = PAGE_SEO[SLUG];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbJsonLd([
              { name: "Home", path: "/" },
              { name: content.h1, path: `/${SLUG}` },
            ])
          ),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            speakableWebPageJsonLd({
              path: `/${SLUG}`,
              name: seo.title,
              description: seo.description,
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
