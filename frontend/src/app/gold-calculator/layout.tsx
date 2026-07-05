import type { Metadata } from "next";
import { buildMetadata, PAGE_SEO } from "@/lib/seo";

export const metadata: Metadata = buildMetadata(PAGE_SEO["gold-calculator"]);

export default function GoldCalculatorLayout({ children }: { children: React.ReactNode }) {
  return children;
}
