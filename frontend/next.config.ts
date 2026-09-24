import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "api.finejewellerybuyers.co.uk",
      },
      {
        protocol: "http",
        hostname: "localhost",
      },
      {
        protocol: "http",
        hostname: "127.0.0.1",
      },
    ],
  },
  async redirects() {
    return [
      { source: "/where-to-sell-gold-in-london", destination: "/sell-gold-london", permanent: true },
      { source: "/where-can-i-sell-gold-in-london", destination: "/sell-gold-london", permanent: true },
      { source: "/sell-gold-in-london", destination: "/sell-gold-london", permanent: true },
      { source: "/gold-buyers-london", destination: "/sell-gold-london", permanent: true },
      { source: "/services/sell-gold", destination: "/sell-gold", permanent: true },
      { source: "/sell-gold-uk", destination: "/sell-gold", permanent: true },
      { source: "/gold-buyers-uk", destination: "/sell-gold", permanent: true },
      { source: "/sell-gold-bar", destination: "/sell-gold-bars", permanent: true },
      { source: "/sell-gold-sovereigns", destination: "/sell-gold-coins", permanent: true },
      { source: "/sell-inherited-jewellery", destination: "/sell-inherited-gold", permanent: true },
      { source: "/where-to-sell-jewellery-in-hatton-garden", destination: "/sell-jewellery-hatton-garden", permanent: true },
      { source: "/sell-jewellery-in-hatton-garden", destination: "/sell-jewellery-hatton-garden", permanent: true },
      { source: "/hatton-garden-jewellery-buyers", destination: "/sell-jewellery-hatton-garden", permanent: true },
    ];
  },
  async rewrites() {
    return [
      { source: "/.well-known/llms.txt", destination: "/llms.txt" },
      { source: "/.well-known/llms-full.txt", destination: "/llms-full.txt" },
    ];
  },
  async headers() {
    const plainText = [
      { key: "Content-Type", value: "text/plain; charset=utf-8" },
      { key: "Cache-Control", value: "public, max-age=86400, stale-while-revalidate=604800" },
    ];
    return [
      { source: "/llms.txt", headers: plainText },
      { source: "/llms-full.txt", headers: plainText },
      { source: "/.well-known/llms.txt", headers: plainText },
      { source: "/.well-known/llms-full.txt", headers: plainText },
    ];
  },
};

export default nextConfig;
