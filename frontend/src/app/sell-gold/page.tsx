import type { Metadata } from "next";
import { GoldSeoDocument } from "@/components/sections/GoldSeoDocument";
import { GOLD_SEO_PAGES } from "@/lib/gold-seo-pages";
import { buildMetadata, PAGE_SEO } from "@/lib/seo";

const SLUG = "sell-gold" as const;

export const metadata: Metadata = buildMetadata({
  ...PAGE_SEO[SLUG],
  ogImage: GOLD_SEO_PAGES[SLUG].heroImage,
});

export default function Page() {
  return <GoldSeoDocument slug={SLUG} />;
}
