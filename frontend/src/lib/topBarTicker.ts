export type TopBarTickerItem = {
  text: string;
  url: string;
  enabled?: boolean;
};

export const DEFAULT_TOP_BAR_TICKER: TopBarTickerItem[] = [
  { text: "Sell Your Gold Today", url: "/live-rates", enabled: true },
  { text: "We Buy Cartier, Tiffany & Boodles — Instant Cash", url: "/services/sell-jewellery", enabled: true },
  { text: "Free Valuation — No Obligation", url: "/free-valuation", enabled: true },
  { text: "Visit Us at Hatton Garden, London", url: "/book-appointment", enabled: true },
];

export function parseTopBarTicker(raw: unknown): TopBarTickerItem[] {
  if (!raw) return DEFAULT_TOP_BAR_TICKER;

  let parsed: unknown = raw;
  if (typeof raw === "string") {
    try {
      parsed = JSON.parse(raw);
    } catch {
      return DEFAULT_TOP_BAR_TICKER;
    }
  }

  if (!Array.isArray(parsed)) return DEFAULT_TOP_BAR_TICKER;

  const items = parsed
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const row = item as Record<string, unknown>;
      const text = String(row.text ?? "").trim();
      const url = String(row.url ?? "").trim();
      if (!text) return null;
      return {
        text,
        url: url || "/",
        enabled: row.enabled !== false,
      } satisfies TopBarTickerItem;
    })
    .filter(Boolean) as TopBarTickerItem[];

  return items.length > 0 ? items.filter((i) => i.enabled !== false) : DEFAULT_TOP_BAR_TICKER;
}

export function parseTopBarTickerSpeed(raw: unknown): number {
  const n = Number(raw);
  if (!Number.isFinite(n) || n < 10) return 35;
  return Math.min(n, 120);
}
