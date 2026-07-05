import type { Metadata } from "next";
import { buildMetadata, PAGE_SEO } from "@/lib/seo";

export const metadata: Metadata = buildMetadata(PAGE_SEO["free-valuation"]);

export default function FreeValuationLayout({ children }: { children: React.ReactNode }) {
  return children;
}
