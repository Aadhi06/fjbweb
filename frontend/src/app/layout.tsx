import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { ClientLayout } from "@/components/layout/ClientLayout";
import {
  buildMetadata,
  organizationJsonLd,
  PAGE_SEO,
  resolveSiteImageUrl,
  SITE_NAME,
  SITE_URL,
  websiteJsonLd,
} from "@/lib/seo";
import { getSettings } from "@/lib/settings";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"], display: "swap" });
const playfair = Playfair_Display({ variable: "--font-playfair", subsets: ["latin"], display: "swap" });

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  const favicon = settings.favicon_url || settings.logo_url || `${SITE_URL}/images/gold-bar-icon.png`;
  const ogImage = resolveSiteImageUrl(settings.social_share_image);

  return {
    metadataBase: new URL(SITE_URL),
    ...buildMetadata({ ...PAGE_SEO.home, ogImage }),
    title: {
      default: PAGE_SEO.home.title,
      template: `%s | ${SITE_NAME}`,
    },
    authors: [{ name: SITE_NAME, url: SITE_URL }],
    creator: SITE_NAME,
    publisher: SITE_NAME,
    formatDetection: { telephone: true, email: true },
    icons: {
      icon: [{ url: favicon }],
      apple: [{ url: favicon }],
    },
  };
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {