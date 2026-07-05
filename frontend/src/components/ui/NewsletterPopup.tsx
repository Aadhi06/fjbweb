"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { X, Mail, Sparkles, Loader2, Clock, Ban } from "lucide-react";
import { useSettings } from "@/lib/useSettings";
import { showFormSuccess, showFormError } from "@/lib/alerts";

const COOKIE_KEY = "fjb_newsletter_popup";
const NEVER_KEY = "fjb_newsletter_never";
const EXCLUDED_PATHS = ["/admin"];

type CookieState = { status: "remind_later" | "subscribed"; until: number };

function isNeverDismissed(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(NEVER_KEY) === "1";
}

function setNeverDismissed(): void {
  localStorage.setItem(NEVER_KEY, "1");
}

function readCookie(): CookieState | null {
  if (typeof document === "undefined") return null;
  const raw = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${COOKIE_KEY}=`))
    ?.split("=")[1];
  if (!raw) return null;
  try {
    const parsed = JSON.parse(decodeURIComponent(raw));
    if (parsed?.until && Date.now() < parsed.until) return parsed;
  } catch {}
  return null;
}

function writeCookie(status: CookieState["status"], days: number) {
  const until = Date.now() + days * 24 * 60 * 60 * 1000;
  const value = encodeURIComponent(JSON.stringify({ status, until }));
  document.cookie = `${COOKIE_KEY}=${value}; path=/; max-age=${days * 86400}; SameSite=Lax`;
}

function shouldHidePopup(): boolean {
  return isNeverDismissed() || !!readCookie();
}

function parseBool(value: unknown, fallback: boolean): boolean {
  if (typeof value === "boolean") return value;
  if (value === "1" || value === "true" || value === "yes") return true;
  if (value === "0" || value === "false" || value === "no") return false;
  return fallback;
}

export function NewsletterPopup() {
  const pathname = usePathname();
  const settings = useSettings();
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const enabled = parseBool(settings.newsletter_popup_enabled, true);
  const showName = parseBool(settings.newsletter_popup_show_name, false);
  const delaySec = Math.max(3, Number(settings.newsletter_popup_delay_seconds) || 8);
  const remindDays = Math.max(1, Number(settings.newsletter_popup_cookie_days) || 14);

  const title = settings.newsletter_popup_title || "Stay in Touch";
  const message =
    settings.newsletter_popup_message ||
    "Join our list for gold price alerts, selling tips and exclusive offers.";
  const buttonText = settings.newsletter_popup_button_text || "Subscribe";
  const successMessage =
    settings.newsletter_popup_success_message ||
    "Thank you! We look forward to keeping you updated.";

  const isExcluded = EXCLUDED_PATHS.some((p) => pathname.startsWith(p));

  useEffect(() => {
    if (!enabled || isExcluded) return;
    if (shouldHidePopup()) return;

    const timer = setTimeout(() => {
      if (!shouldHidePopup()) setOpen(true);
    }, delaySec * 1000);

    return () => clearTimeout(timer);
  }, [enabled, isExcluded, delaySec]);

  function remindLater() {
    writeCookie("remind_later", remindDays);
    setOpen(false);
  }

  function dontShowAgain() {
    setNeverDismissed();
    setOpen(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;

    setSubmitting(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8002"}/api/newsletter/subscribe`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify({
            email: email.trim(),
            ...(showName && name.trim() ? { name: name.trim() } : {}),
          }),
        }
      );

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Subscription failed");
      }

      writeCookie("subscribed", 365);
      setOpen(false);
      await showFormSuccess("You're subscribed!", successMessage);
    } catch (err) {
      await showFormError(
        "Something went wrong",
        err instanceof Error ? err.message : "Please try again later."
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (!enabled || isExcluded) return null;

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[90] bg-black/60 backdrop-blur-sm"
            onClick={remindLater}
            aria-hidden
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="newsletter-popup-title"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 26, stiffness: 320 }}
            className="fixed left-1/2 top-1/2 z-[91] w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative bg-white rounded-3xl shadow-2xl border border-border overflow-hidden">
              <div className="h-2 gold-gradient" />
              <button
                type="button"
                onClick={remindLater}
                className="absolute top-4 right-4 p-2 rounded-full text-muted-foreground hover:text-black hover:bg-muted transition-colors cursor-pointer"
                aria-label="Remind me later"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="p-8 pt-10">
                <div className="w-14 h-14 bg-gold/10 rounded-2xl flex items-center justify-center mx-auto mb-5">
                  <Sparkles className="w-7 h-7 text-gold-dark" />
                </div>

                <h2 id="newsletter-popup-title" className="text-2xl font-serif font-bold text-black text-center mb-3">
                  {title}
                </h2>
                <p className="text-muted-foreground text-center text-sm leading-relaxed mb-6 whitespace-pre-line">
                  {message}
                </p>

                <form onSubmit={handleSubmit} className="space-y-3">
                  {showName && (
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your name"
                      className="w-full px-4 py-3 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-gold/40 text-sm"
                    />
                  )}
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full pl-11 pr-4 py-3 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-gold/40 text-sm"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-3.5 bg-black text-white font-bold rounded-full hover:bg-black/90 transition-colors disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                    {buttonText}
                  </button>
                </form>

                <div className="mt-4 pt-4 border-t border-border space-y-2">
                  <button
                    type="button"
                    onClick={remindLater}
                    className="w-full flex items-center justify-center gap-2 py-2 text-sm text-muted-foreground hover:text-gold-dark transition-colors cursor-pointer"
                  >
                    <Clock className="w-4 h-4" />
                    Remind me later
                  </button>
                  <button
                    type="button"
                    onClick={dontShowAgain}
                    className="w-full flex items-center justify-center gap-2 py-2 text-sm text-muted-foreground hover:text-red-600 transition-colors cursor-pointer"
                  >
                    <Ban className="w-4 h-4" />
                    Don&apos;t show again
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
