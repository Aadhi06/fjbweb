"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Phone, X } from "lucide-react";
import { useSettings } from "@/lib/useSettings";

const IDLE_MS = 40_000;
const SESSION_KEY = "fjb_sell_gold_popup";
const EXCLUDED_PATHS = ["/admin", "/free-valuation", "/book-appointment", "/enquiry"];

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

export function SellGoldIdlePopup() {
  const pathname = usePathname();
  const settings = useSettings();
  const [open, setOpen] = useState(false);
  const idleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasTriggered = useRef(false);

  const isExcluded = EXCLUDED_PATHS.some((p) => pathname.startsWith(p));
  const phone = settings.phone || "020 3411 1438";
  const phoneHref = `tel:${phone.replace(/\s/g, "")}`;
  const waDigits = (settings.whatsapp || "").replace(/\D/g, "");
  const whatsappUrl = waDigits
    ? `https://wa.me/${waDigits}?text=${encodeURIComponent("Hi, I'm looking to sell gold and would like a free valuation.")}`
    : null;

  const dismiss = useCallback(() => {
    sessionStorage.setItem(SESSION_KEY, "1");
    setOpen(false);
  }, []);

  const resetIdleTimer = useCallback(() => {
    if (idleTimer.current) clearTimeout(idleTimer.current);
    if (isExcluded || hasTriggered.current) return;
    if (typeof window !== "undefined" && sessionStorage.getItem(SESSION_KEY)) return;

    idleTimer.current = setTimeout(() => {
      if (sessionStorage.getItem(SESSION_KEY)) return;
      hasTriggered.current = true;
      setOpen(true);
    }, IDLE_MS);
  }, [isExcluded]);

  useEffect(() => {
    if (isExcluded) return;

    const events = ["mousedown", "keydown", "scroll", "touchstart", "click"] as const;
    events.forEach((e) => window.addEventListener(e, resetIdleTimer, { passive: true }));
    resetIdleTimer();

    return () => {
      if (idleTimer.current) clearTimeout(idleTimer.current);
      events.forEach((e) => window.removeEventListener(e, resetIdleTimer));
    };
  }, [isExcluded, resetIdleTimer]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") dismiss();
    };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, dismiss]);

  if (isExcluded) return null;

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[90] bg-black/70 backdrop-blur-[2px]"
            onClick={dismiss}
            aria-hidden
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="sell-gold-idle-title"
            initial={{ opacity: 0, y: 48 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 32 }}
            transition={{ type: "spring", damping: 28, stiffness: 340 }}
            className="fixed inset-x-0 bottom-0 z-[91] mx-auto w-full max-w-md sm:bottom-auto sm:left-1/2 sm:top-1/2 sm:w-[calc(100%-1.5rem)] sm:-translate-x-1/2 sm:-translate-y-1/2"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative max-h-[min(92dvh,640px)] overflow-y-auto overscroll-contain rounded-t-3xl border border-white/10 bg-[#0c0c0c] shadow-2xl sm:rounded-3xl pb-[max(0.75rem,env(safe-area-inset-bottom))]">
              <div
                className="pointer-events-none absolute inset-0 opacity-80"
                style={{
                  background:
                    "radial-gradient(ellipse 80% 55% at 50% -10%, rgba(212,175,55,0.35), transparent 60%), linear-gradient(160deg, #141414 0%, #0a0a0a 55%, #12100a 100%)",
                }}
              />
              <div
                className="pointer-events-none absolute inset-0 opacity-[0.07]"
                style={{
                  backgroundImage:
                    "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
                }}
              />

              <div className="relative mx-auto mt-3 h-1 w-10 rounded-full bg-white/25 sm:hidden" aria-hidden />

              <button
                type="button"
                onClick={dismiss}
                className="absolute right-2 top-2 z-10 flex h-11 w-11 items-center justify-center rounded-full text-white/55 transition-colors hover:bg-white/10 hover:text-white cursor-pointer"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="relative px-5 pb-5 pt-7 sm:px-8 sm:pb-7 sm:pt-9">
                <p className="mb-2 text-center text-[11px] font-semibold uppercase tracking-[0.22em] text-gold sm:mb-3">
                  Still here?
                </p>
                <h2
                  id="sell-gold-idle-title"
                  className="mb-2 text-center font-serif text-[1.65rem] font-bold leading-tight text-white sm:mb-3 sm:text-[1.7rem]"
                >
                  Looking to sell gold?
                </h2>
                <p className="mx-auto mb-6 max-w-sm text-center text-[15px] leading-relaxed text-white/70 sm:mb-7 sm:text-sm">
                  Get a free valuation — no obligation. WhatsApp, call, or start online in under two minutes.
                </p>

                <div className="space-y-3">
                  <Link
                    href="/free-valuation"
                    onClick={dismiss}
                    className="flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-gold px-5 py-3.5 text-base font-bold text-black transition-colors hover:bg-gold-light cursor-pointer sm:text-sm"
                  >
                    Get a free valuation
                    <ArrowRight className="h-4 w-4" />
                  </Link>

                  {whatsappUrl && (
                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={dismiss}
                      className="flex min-h-12 w-full items-center justify-center gap-2.5 rounded-full bg-[#25D366] px-5 py-3.5 text-base font-bold text-white transition-opacity hover:opacity-95 cursor-pointer sm:text-sm"
                    >
                      <WhatsAppIcon className="h-5 w-5 shrink-0" />
                      WhatsApp us
                    </a>
                  )}

                  <a
                    href={phoneHref}
                    onClick={dismiss}
                    className="flex min-h-12 w-full items-center justify-center gap-2.5 rounded-full border border-white/20 bg-white/5 px-5 py-3.5 text-base font-semibold text-white transition-colors hover:bg-white/10 cursor-pointer sm:text-sm"
                  >
                    <Phone className="h-4 w-4 shrink-0 text-gold" />
                    Call {phone}
                  </a>
                </div>

                <button
                  type="button"
                  onClick={dismiss}
                  className="mt-4 flex min-h-11 w-full items-center justify-center text-sm text-white/45 transition-colors hover:text-white/70 cursor-pointer sm:mt-5 sm:text-xs"
                >
                  No thanks, just browsing
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
