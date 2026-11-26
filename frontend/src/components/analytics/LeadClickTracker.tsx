"use client";

import { useEffect } from "react";
import { trackPhoneClick, trackWhatsAppClick } from "@/lib/analytics";

/**
 * Captures clicks on tel: and WhatsApp links site-wide for Ads lead tracking.
 */
export function LeadClickTracker() {
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const target = event.target as Element | null;
      if (!target?.closest) return;
      const anchor = target.closest("a") as HTMLAnchorElement | null;
      if (!anchor?.href) return;

      const href = anchor.href;
      if (href.startsWith("tel:")) {
        trackPhoneClick(anchor.dataset.trackSource || "tel_link");
        return;
      }
      if (
        href.includes("wa.me/") ||
        href.includes("api.whatsapp.com/") ||
        href.includes("whatsapp.com/send")
      ) {
        trackWhatsAppClick(anchor.dataset.trackSource || "whatsapp_link");
      }
    };

    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  return null;
}
