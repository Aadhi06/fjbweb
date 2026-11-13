/**
 * Site-side analytics helpers for GTM / Google Ads.
 *
 * GTM-TW2L228T already has Google Ads tags (AW-16660342606) listening for
 * custom events `conversion` and GA4 event `confirm_appointment`.
 */

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
    gtag?: (...args: unknown[]) => void;
  }
}

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

/**
 * Form lead. GTM fires Ads conversion tags on custom event `conversion`.
 * Also mirrors GA4-style `generate_lead` for reporting.
 */
export function trackFormSubmission(formSlug: string) {
  pushDataLayer({
    event: "conversion",
    form_slug: formSlug,
    lead_type: "form",
  });
  pushDataLayer({
    event: "generate_lead",
    form_slug: formSlug,
    lead_type: "form",
  });
}

/**
 * Appointment booking. Matches GTM GA4 event name `confirm_appointment`
 * and also sends `conversion` so Ads conversion tags can fire.
 */
export function trackBookingConversion(bookingId?: number | string) {
  pushDataLayer({
    event: "confirm_appointment",
    booking_id: bookingId ?? null,
    lead_type: "booking",
  });
  pushDataLayer({
    event: "conversion",
    booking_id: bookingId ?? null,
    lead_type: "booking",
  });
}
