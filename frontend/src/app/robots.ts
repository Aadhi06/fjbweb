import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

const ADMIN_DISALLOW = ["/admin/", "/admin"];

/**
 * ChatGPT Search indexes pages via OAI-SearchBot (and Bing).
 * ChatGPT-User fetches a page live when someone asks ChatGPT about it.
 * Allow the whole public site — a short Allow list can be treated as a whitelist.
 */
const AI_SEARCH_AGENTS = [
  "OAI-SearchBot",
  "ChatGPT-User",
  "OAI-AdsBot",
  "GPTBot",
  "ClaudeBot",
  "Claude-SearchBot",
  "PerplexityBot",
  "Google-Extended",
  "Bingbot",
  "Applebot",
  "Applebot-Extended",
];

const publicRule = {
  allow: "/",
  disallow: ADMIN_DISALLOW,
} as const;

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", ...publicRule },
      ...AI_SEARCH_AGENTS.map((userAgent) => ({
        userAgent,
        ...publicRule,
      })),
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: new URL(SITE_URL).host,
  };
}
