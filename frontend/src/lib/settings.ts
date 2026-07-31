export interface SiteSettings {
  business_name: string;
  tagline: string;
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  opening_hours: string;
  logo_url: string;
  logo_size: number;
  favicon_url: string;
  social_share_image: string;
  google_place_id: string;
  google_review_url: string;
  trustpilot_url: string;
  google_rating: number;
  total_reviews: number;
  years_in_business: number;
  happy_customers: string;
  total_sales: string;
  gtm_id: string;
  ga_id: string;
  meta_pixel_id: string;
  about_title: string;
  about_description: string;
  about_mission: string;
  about_vision: string;
  about_values: string;
  top_bar_ticker: string;
  top_bar_ticker_speed: number;
  newsletter_popup_enabled: boolean;
  newsletter_popup_title: string;
  newsletter_popup_message: string;
  newsletter_popup_button_text: string;
  newsletter_popup_success_message: string;
  newsletter_popup_delay_seconds: number;
  newsletter_popup_cookie_days: number;
  newsletter_popup_show_name: boolean;
  maintenance_mode: boolean;
  maintenance_message: string;
}

export const defaultSettings: SiteSettings = {
  business_name: "Fine Jewellery Buyers",
  tagline: "UK's Trusted Buyer of Gold, Diamonds & Watches",
  phone: "020 3123 4567",
  whatsapp: "442031234567",
  email: "info@finejewellerybuyers.co.uk",
  address: "88–90 Hatton Garden, London EC1N 8AA",
  opening_hours: "Mon–Sat: 10am–6pm",
  logo_url: "",
  logo_size: 48,
  favicon_url: "",
  social_share_image: "",
  google_place_id: "",
  google_review_url: "",
  trustpilot_url: "",
  google_rating: 4.9,
  total_reviews: 1000,
  years_in_business: 15,
  happy_customers: "10,000+",
  total_sales: "£5M+",
  gtm_id: "GTM-TW2L228T",
  ga_id: "",
  meta_pixel_id: "",
  about_title: "About Fine Jewellery Buyers",
  about_description: "",
  about_mission: "",
  about_vision: "",
  about_values: "[]",
  top_bar_ticker: JSON.stringify([
    { text: "Sell Your Gold Today", url: "/live-rates", enabled: true },
    { text: "We Buy Cartier, Tiffany & Boodles — Instant Cash", url: "/services/sell-jewellery", enabled: true },
    { text: "Free Valuation — No Obligation", url: "/free-valuation", enabled: true },
    { text: "Visit Us at Hatton Garden, London", url: "/book-appointment", enabled: true },
  ]),
  top_bar_ticker_speed: 35,
  newsletter_popup_enabled: true,
  newsletter_popup_title: "Stay in Touch",
  newsletter_popup_message:
    "Join our list for gold price alerts, selling tips and exclusive offers from Hatton Garden.",
  newsletter_popup_button_text: "Subscribe",
  newsletter_popup_success_message: "Thank you! We look forward to keeping you updated.",
  newsletter_popup_delay_seconds: 8,
  newsletter_popup_cookie_days: 14,
  newsletter_popup_show_name: false,
  maintenance_mode: false,
  maintenance_message:
    "We are making a few improvements. We still buy gold — connect with us on WhatsApp for instant valuations and same-day payments.",
};

export const API_SETTINGS_URL = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8002"}/api/settings`;

let cachedSettings: SiteSettings | null = null;

export async function getSettings(): Promise<SiteSettings> {
  if (cachedSettings) return cachedSettings;
  try {
    const res = await fetch(API_SETTINGS_URL, { next: { revalidate: 300 } });
    if (res.ok) {
      const json = await res.json();
      cachedSettings = { ...defaultSettings, ...json.data };
      return cachedSettings!;
    }
  } catch {}
  return defaultSettings;
}
