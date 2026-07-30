import { defaultSettings } from "./settings";

export const HATTON_GARDEN_MEDIA = {
  buildingImage: "/images/hatton-garden-building.jpg",
  buildingImageAlt: "Fine Jewellery Buyers office building, Hatton Garden, London",
} as const;

export type ParsedAddress = {
  building: string;
  floor: string;
  city: string;
  lines: string[];
  /** Public-facing lines without floor / office number */
  publicLines: string[];
  full: string;
  short: string;
  mapsUrl: string;
};

function isOfficeDetailLine(line: string): boolean {
  return /office\s*no\.?|^\d+(st|nd|rd|th)\s+floor|\bfloor\b.*\boffice\b/i.test(line.trim());
}

/** Split admin address into display lines for the office card. */
export function parseAddress(fullAddress?: string | null): ParsedAddress {
  const full = (fullAddress || defaultSettings.address).trim();
  const parts = full.split(",").map((p) => p.trim()).filter(Boolean);
  const publicParts = parts.filter((p) => !isOfficeDetailLine(p));

  const building = publicParts[0] || parts[0] || full;
  const city =
    publicParts.length > 1
      ? publicParts[publicParts.length - 1]
      : parts.length > 1
        ? parts[parts.length - 1]
        : "";
  const floor = parts.filter((p) => isOfficeDetailLine(p)).join(", ");

  return {
    building,
    floor,
    city,
    lines: parts.length > 0 ? parts : [full],
    publicLines: publicParts.length > 0 ? publicParts : [building],
    full,
    short:
      publicParts.length >= 2
        ? `${publicParts[0]}, ${publicParts[publicParts.length - 1]}`
        : building,
    mapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(full)}`,
  };
}

/** @deprecated Use parseAddress(settings.address) */
export const HATTON_GARDEN = {
  ...parseAddress(defaultSettings.address),
  ...HATTON_GARDEN_MEDIA,
};
