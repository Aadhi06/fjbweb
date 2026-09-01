import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { ClientLayout } from "@/components/layout/ClientLayout";
import {
  buildMetadata,
  DEFAULT_OG_IMAGE,
  organizationJsonLd,
  PAGE_SEO,
  resolveSiteImageUrl,
  SITE_NAME,
  SITE_URL,
  siteNavigationJsonLd,
  websiteJsonLd,
} from "@/lib/seo";
import { getSettings } from "@/lib/settings";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"], display: "swap" });
const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
  preload: true,
});

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  const ogImage = settings.social_share_image
    ? resolveSiteImageUrl(settings.social_share_image)
    : settings.logo_url || DEFAULT_OG_IMAGE;

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
      icon: [
        { url: "/favicon.ico?v=fjb2", sizes: "any" },
        { url: "/favicon-32.png?v=fjb2", type: "image/png", sizes: "32x32" },
        { url: "/favicon-16.png?v=fjb2", type: "image/png", sizes: "16x16" },
        { url: "/images/logo.png", type: "image/png", sizes: "512x512" },
      ],
      shortcut: "/favicon.ico?v=fjb2",
      apple: [{ url: "/apple-icon.png?v=fjb2", sizes: "180x180", type: "image/png" }],
    },
  };
}

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const settings = await getSettings();
  const gtmId = (settings.gtm_id || process.env.NEXT_PUBLIC_GTM_ID || "GTM-TW2L228T").trim();
  const gaId = (settings.ga_id || process.env.NEXT_PUBLIC_GA_ID || "").trim();
  const clarityId = (settings.clarity_id || process.env.NEXT_PUBLIC_CLARITY_ID || "").trim();

  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`} suppressHydrationWarning>
      <head>
        {/* Google Tag Manager */}
        {gtmId ? (
          <Script id="gtm-head" strategy="beforeInteractive">{`
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','${gtmId}');
          `}</Script>
        ) : null}
        <link rel="icon" href="/favicon.ico?v=fjb2" sizes="any" />
        <link rel="icon" href="/favicon-32.png?v=fjb2" type="image/png" sizes="32x32" />
        <link rel="icon" href="/favicon-16.png?v=fjb2" type="image/png" sizes="16x16" />
        <link rel="apple-touch-icon" href="/apple-icon.png?v=fjb2" />
        <link rel="alternate" type="text/plain" href={`${SITE_URL}/llms.txt`} title="LLM-readable site summary" />
        <link rel="alternate" type="text/plain" href={`${SITE_URL}/llms-full.txt`} title="Full LLM-readable site summary" />
        <link rel="describedby" href={`${SITE_URL}/.well-known/llms.txt`} />
        {gaId ? (
          <>
            <Script src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`} strategy="afterInteractive" />
            <Script id="ga" strategy="afterInteractive">{`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${gaId}');
            `}</Script>
          </>
        ) : null}
        {clarityId ? (
          <Script id="microsoft-clarity" strategy="afterInteractive">{`
            (function(c,l,a,r,i,t,y){
              c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
              t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
              y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
            })(window, document, "clarity", "script", "${clarityId}");
          `}</Script>
        ) : null}
      </head>
      <body className="min-h-screen flex flex-col antialiased bg-background" suppressHydrationWarning>
        {/* Google Tag Manager (noscript) */}
        {gtmId ? (
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${gtmId}`}
              height="0"
              width="0"
              style={{ display: "none", visibility: "hidden" }}
              title="Google Tag Manager"
            />
          </noscript>
        ) : null}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd({
            address: settings.address,
            phone: settings.phone,
            email: settings.email,
            openingHours: settings.opening_hours,
            googleReviewUrl: settings.google_review_url,
            trustpilotUrl: settings.trustpilot_url,
          })) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd()) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(siteNavigationJsonLd()) }}
        />
        <ClientLayout initialSettings={settings}>{children}</ClientLayout>
      </body>
    </html>
  );
}