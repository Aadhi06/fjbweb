"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  HelpCircle,
  MessageCircle,
  X,
  FileText,
  Package,
  Banknote,
  Sparkles,
  MapPin,
  CalendarDays,
  Gem,
  IdCard,
  Store,
} from "lucide-react";
import { useSettings } from "@/lib/useSettings";

const IDLE_MS = 45_000;
const DISMISSED_KEY = "fjb_idle_help_dismissed";

const EXCLUDED_PATHS = ["/admin", "/free-valuation", "/book-appointment"];

const sellOptions = [
  { id: "gold", label: "Gold / Scrap Gold", formValue: "Gold Jewellery" },
  { id: "diamonds", label: "Diamonds", formValue: "Diamonds" },
  { id: "watch", label: "Luxury Watch", formValue: "Luxury Watch" },
  { id: "silver", label: "Silver or Platinum", formValue: "Silver" },
  { id: "gemstones", label: "Gemstones", formValue: "Gemstones" },
  { id: "other", label: "Other / Not sure", formValue: "" },
];

const onlineGuideSteps = [
  { icon: FileText, title: "Fill our quick form", text: "Tell us what you're selling and upload photos — takes about 2 minutes." },
  { icon: MessageCircle, title: "Get a free valuation", text: "Our experts review your items and reply within 24 hours." },
  { icon: Package, title: "Ship securely", text: "We send a free, fully insured Royal Mail pack to your door." },
  { icon: Banknote, title: "Get paid same day", text: "Accept our offer and receive instant bank transfer." },
];

const visitHighlights = [
  { icon: Store, title: "Visit our Hatton Garden showroom", text: "Meet our expert valuers face-to-face in London's jewellery quarter." },
  { icon: Gem, title: "Free in-person valuation", text: "Bring your gold, diamonds or jewellery — get an expert assessment on the spot." },
  { icon: Banknote, title: "Instant offer, same-day payment", text: "Accept our offer and receive payment while you're with us." },
  { icon: IdCard, title: "What to bring", text: "Your items, photo ID, and any certificates or receipts you have." },
];

type Step = "closed" | "prompt" | "item" | "guide" | "visit";

export function IdleHelpAssistant() {
  const pathname = usePathname();
  const router = useRouter();
  const settings = useSettings();
  const [step, setStep] = useState<Step>("closed");
  const [selectedItem, setSelectedItem] = useState<(typeof sellOptions)[number] | null>(null);
  const idleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasTriggered = useRef(false);

  const isExcluded = EXCLUDED_PATHS.some((p) => pathname.startsWith(p));

  const resetIdleTimer = useCallback(() => {
    if (idleTimer.current) clearTimeout(idleTimer.current);
    if (isExcluded || hasTriggered.current) return;
    if (typeof window !== "undefined" && sessionStorage.getItem(DISMISSED_KEY)) return;

    idleTimer.current = setTimeout(() => {
      if (sessionStorage.getItem(DISMISSED_KEY)) return;
      hasTriggered.current = true;
      setStep("prompt");
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

  function dismiss() {
    sessionStorage.setItem(DISMISSED_KEY, "1");
    setStep("closed");
  }

  function openAssistant() {
    setStep("prompt");
  }

  function handleStartValuation() {
    const params = new URLSearchParams({ from: "guide" });
    if (selectedItem?.formValue) params.set("item", selectedItem.formValue);
    router.push(`/free-valuation?${params.toString()}`);
    setStep("closed");
  }

  function handleBookVisit() {
    router.push("/book-appointment?from=guide");
    setStep("closed");
  }

  if (isExcluded) return null;

  const isOpen = step !== "closed";

  return (
    <>
      {!isOpen && (
        <button
          type="button"
          onClick={openAssistant}
          aria-label="Need help selling?"
          className="fixed bottom-6 left-6 z-50 flex items-center gap-2 bg-black text-white pl-4 pr-5 py-3 rounded-full shadow-2xl hover:bg-black/90 transition-all duration-200 cursor-pointer group"
        >
          <HelpCircle className="w-5 h-5 text-gold" />
          <span className="text-sm font-semibold">Need help?</span>
        </button>
      )}

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.95 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="fixed bottom-6 left-6 z-50 w-[min(100vw-2rem,380px)] bg-white rounded-2xl shadow-2xl border border-border overflow-hidden"
          >
            <div className="gold-gradient px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-white font-serif font-bold text-base leading-tight">
                    Fine Jewellery Buyers
                  </p>
                  <p className="text-white/80 text-xs">Here to help you sell</p>
                </div>
              </div>
              <button
                type="button"
                onClick={dismiss}
                aria-label="Close"
                className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </div>

            <div className="p-5 max-h-[min(70vh,480px)] overflow-y-auto">
              {step === "prompt" && (
                <div className="space-y-4">
                  <p className="text-secondary font-medium leading-relaxed">
                    Hi there! 👋 How can we help you today?
                  </p>
                  <div className="space-y-2">
                    <button
                      type="button"
                      onClick={() => setStep("item")}
                      className="w-full py-3 px-4 bg-black text-white font-semibold rounded-xl hover:bg-black/90 transition-colors cursor-pointer text-sm text-left"
                    >
                      I&apos;d like to sell online
                    </button>
                    <button
                      type="button"
                      onClick={() => setStep("visit")}
                      className="w-full py-3 px-4 bg-gold text-black font-semibold rounded-xl hover:bg-gold-light transition-colors cursor-pointer text-sm text-left flex items-center gap-2"
                    >
                      <CalendarDays className="w-4 h-4 shrink-0" />
                      I&apos;d like to visit your shop
                    </button>
                    <button
                      type="button"
                      onClick={dismiss}
                      className="w-full py-3 px-4 border border-border text-muted-foreground font-medium rounded-xl hover:bg-muted transition-colors cursor-pointer text-sm"
                    >
                      No thanks, just browsing
                    </button>
                  </div>
                </div>
              )}

              {step === "visit" && (
                <div className="space-y-4">
                  <p className="text-secondary font-medium leading-relaxed">
                    Would you like to visit us in person? Our Hatton Garden experts offer free, no-obligation valuations while you wait.
                  </p>

                  <div className="bg-gold/5 border border-gold/20 rounded-xl p-4 space-y-2">
                    <div className="flex items-start gap-2 text-sm">
                      <MapPin className="w-4 h-4 text-gold-dark shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-black">{settings.address}</p>
                        <p className="text-muted-foreground text-xs mt-0.5">{settings.opening_hours}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {visitHighlights.map((item) => (
                      <div key={item.title} className="flex gap-3 items-start">
                        <div className="w-8 h-8 bg-gold/10 rounded-lg flex items-center justify-center shrink-0">
                          <item.icon className="w-4 h-4 text-gold-dark" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-black">{item.title}</p>
                          <p className="text-xs text-muted-foreground leading-relaxed">{item.text}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={handleBookVisit}
                    className="w-full py-3.5 px-4 bg-black text-white font-bold rounded-xl hover:bg-black/90 transition-colors cursor-pointer flex items-center justify-center gap-2 text-sm"
                  >
                    <CalendarDays className="w-4 h-4" />
                    Book Your Visit <ArrowRight className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setStep("prompt")}
                    className="text-xs text-muted-foreground hover:text-secondary transition-colors cursor-pointer"
                  >
                    ← Back
                  </button>
                </div>
              )}

              {step === "item" && (
                <div className="space-y-4">
                  <p className="text-secondary font-medium">
                    Great! What would you like to sell?
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {sellOptions.map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => {
                          setSelectedItem(opt);
                          setStep("guide");
                        }}
                        className="py-2.5 px-3 text-left text-sm border border-border rounded-xl hover:border-gold-dark hover:bg-gold/5 transition-all cursor-pointer font-medium text-secondary"
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => setStep("prompt")}
                    className="text-xs text-muted-foreground hover:text-secondary transition-colors cursor-pointer"
                  >
                    ← Back
                  </button>
                </div>
              )}

              {step === "guide" && (
                <div className="space-y-4">
                  <p className="text-secondary font-medium">
                    {selectedItem && selectedItem.id !== "other"
                      ? `Perfect — here's how to sell your ${selectedItem.label.toLowerCase()}:`
                      : "Here's how our simple selling process works:"}
                  </p>

                  <div className="space-y-3">
                    {onlineGuideSteps.map((s, i) => (
                      <div key={s.title} className="flex gap-3 items-start">
                        <div className="w-8 h-8 bg-gold/10 rounded-lg flex items-center justify-center shrink-0">
                          <s.icon className="w-4 h-4 text-gold-dark" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-gold-dark mb-0.5">Step {i + 1}</p>
                          <p className="text-sm font-semibold text-black">{s.title}</p>
                          <p className="text-xs text-muted-foreground leading-relaxed">{s.text}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={handleStartValuation}
                    className="w-full py-3.5 px-4 bg-gold text-black font-bold rounded-xl hover:bg-gold-light transition-colors cursor-pointer flex items-center justify-center gap-2 text-sm"
                  >
                    Start Free Valuation <ArrowRight className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setStep("visit")}
                    className="w-full py-3 px-4 border border-border text-secondary font-medium rounded-xl hover:bg-muted transition-colors cursor-pointer text-sm flex items-center justify-center gap-2"
                  >
                    <CalendarDays className="w-4 h-4" />
                    Prefer to visit us? Book appointment
                  </button>

                  <button
                    type="button"
                    onClick={() => setStep("item")}
                    className="text-xs text-muted-foreground hover:text-secondary transition-colors cursor-pointer"
                  >
                    ← Change item type
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
