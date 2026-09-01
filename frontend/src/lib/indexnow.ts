import { SITE_URL } from "@/lib/seo";

/** Public IndexNow key (also served as /{key}.txt). Used so Bing — and therefore ChatGPT Search — can pick up new pages quickly. */
export const INDEXNOW_KEY = "c7e4a91f2b8d46a0b3f15e9c8d2a7041";

const PRIORITY_PATHS = [
  "/",
  "/sell-gold-london",
  "/sell-jewellery-hatton-garden",
  "/services/sell-gold",
  "/services/sell-jewellery",
  "/faq",
  "/llms.txt",
  "/llms-full.txt",
];

export function indexNowPriorityUrls(): string[] {
  return PRIORITY_PATHS.map((path) => `${SITE_URL}${path}`);
}

export async function pingIndexNow(urls: string[] = indexNowPriorityUrls()): Promise<void> {
  if (process.env.NODE_ENV !== "production") return;
  if (!SITE_URL.includes("finejewellerybuyers.co.uk")) return;

  try {
    await fetch("https://api.indexnow.org/indexnow", {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({
        host: new URL(SITE_URL).host,
        key: INDEXNOW_KEY,
        keyLocation: `${SITE_URL}/${INDEXNOW_KEY}.txt`,
        urlList: urls,
      }),
    });
  } catch {
    // IndexNow is best-effort; never fail page generation.
  }
}
