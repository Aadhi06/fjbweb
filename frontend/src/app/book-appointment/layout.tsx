import type { Metadata } from "next";
import { buildMetadata, PAGE_SEO } from "@/lib/seo";

export const metadata: Metadata = buildMetadata(PAGE_SEO["book-appointment"]);

export default function BookAppointmentLayout({ children }: { children: React.ReactNode }) {
  return children;
}
