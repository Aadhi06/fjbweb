import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: "FJB Admin",
  robots: { index: false, follow: false },
  manifest: "/admin-manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "FJB Admin",
    statusBarStyle: "black-translucent",
  },
  icons: {
    icon: [
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/apple-icon.png", sizes: "180x180", type: "image/png" }],
  },
};

export const viewport: Viewport = {
  themeColor: "#111111",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  interactiveWidget: "resizes-content",
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return children;
}
