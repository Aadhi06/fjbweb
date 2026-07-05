import type { Metadata } from "next";
import { buildMetadata, PAGE_SEO } from "@/lib/seo";

export const metadata: Metadata = buildMetadata(PAGE_SEO.about);

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return children;
}
