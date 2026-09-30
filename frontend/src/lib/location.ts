import { defaultSettings } from "./settings";

export const VISIT_SUITE = {
  suite: "Suite 39",
  floor: "4th Floor",
  building: "88–90 Hatton Garden",
  line: "Suite 39, 4th Floor, 88–90 Hatton Garden, London",
} as const;

export const VISIT_STEPS = [
  {
    name: "Speak to security",
    text: "Security is in the lobby. Tell them you need Fine Jewellery Buyers — they will call us and open the gate.",
  },
  {
    name: "Take the lift to the 4th floor",
    text: "After the gate, take the lift up to the 4th floor.",
  },
  {
    name: "Last suite on the left — press the bell",
    text: "Turn left. We are the last office, Suite 39. Press the bell.",
  },
] as const;

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
  return /office\s*no\.?/i.test(line.trim());
}

/** Always show Suite 39, 4th Floor even if admin address is only the building. */
export function displayVisitAddress(address?: string | null): string {
  const full = (address || defaultSettings.address).trim();
  if (/suite\s*39/i.test(full)) return full;
  return `${VISIT_SUITE.suite}, ${VISIT_SUITE.floor}, ${full}`;
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
