/**
 * Clean lead tracking for GTM / Google Ads (AW-16660342606 via GTM-TW2L228T).
 *
 * GTM listens for custom event `conversion` and GA4 `confirm_appointment`.
 * We also push named lead_* events for clearer reporting.
 */

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
    gtag?: (...args: unknown[]) => void;
  }
}

export type LeadType = "book_appointment" | "free_valuation" | "whatsapp" | "phone_call" | "form";

/** Accept G-XXXX, AW-XXXX, or bare Ads account digits → AW-XXXX. */
export function normalizeMeasurementId(raw?: string | null): string {
  const id = (raw || "").trim();
  if (!id) return "";
  if (/^AW-\d+$/i.test(id) || /^G-[A-Z0-9]+$/i.test(id) || /^GTM-/i.test(id)) {
    return id;
  }
  if (/^\d{6,}$/.test(id)) {
    return `AW-${id}`;
  }
  return id;
}

export function pushDataLayer(payload: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(payload);
}

/** Fire Ads conversion + named lead event. */
function trackLead(leadType: LeadType, extra: Record<string, unknown> = {}) {
  pushDataLayer({
    event: "conversion",
    lead_type: leadType,
    ...extra,
  });
  pushDataLayer({
    event: `lead_${leadType}`,
    lead_type: leadType,
    ...extra,
  });
}

/**
 * Form lead (free valuation / contact / enquiry).
 * Prefer free_valuation when slug matches.
 */
export function trackFormSubmission(formSlug: string) {
  const slug = (formSlug || "").toLowerCase();
  const leadType: LeadType =
    slug.includes("valuation") || slug.includes("free-valuation") || slug === "free_valuation"
      ? "free_valuation"
      : "form";

  trackLead(leadType, { form_slug: formSlug });
  pushDataLayer({
    event: "generate_lead",
    form_slug: formSlug,
    lead_type: leadType,
  });
}

/** Book appointment completed. */
export function trackBookingConversion(bookingId?: number | string) {
  trackLead("book_appointment", { booking_id: bookingId ?? null });
  pushDataLayer({
    event: "confirm_appointment",
    booking_id: bookingId ?? null,
    lead_type: "book_appointment",
  });
}

/** WhatsApp click (floating button, popup, etc.). */
export function trackWhatsAppClick(source = "site") {
  trackLead("whatsapp", { click_source: source });
}

/** Phone / Call us click (tel: links). */
export function trackPhoneClick(source = "site") {
  trackLead("phone_call", { click_source: source });
}
