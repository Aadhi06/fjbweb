import { GoldSeoPage } from "@/components/sections/GoldSeoPage";
import { GOLD_SEO_PAGES, type GoldSeoPageContent } from "@/lib/gold-seo-pages";
import { getSettings } from "@/lib/settings";
import {
  breadcrumbJsonLd,
  faqJsonLd,
  howToJsonLd,
  PAGE_SEO,
  speakableWebPageJsonLd,
} from "@/lib/seo";

export async function GoldSeoDocument({ slug }: { slug: GoldSeoPageContent["slug"] }) {
  const settings = await getSettings();
  const content = GOLD_SEO_PAGES[slug];
  const seo = PAGE_SEO[slug];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbJsonLd([
              { name: "Home", path: "/" },
              { name: content.h1, path: `/${slug}` },
            ])
          ),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            speakableWebPageJsonLd({
              path: `/${slug}`,
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
      <GoldSeoPage content={content} settings={settings} />
    </>
  );
}
