import type { Metadata } from "next";
import { buildMetadata, PAGE_SEO } from "@/lib/seo";

export const metadata: Metadata = buildMetadata(PAGE_SEO["live-rates"]);

export default function LiveRatesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
