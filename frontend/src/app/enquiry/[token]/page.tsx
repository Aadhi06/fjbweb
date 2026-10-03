"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, CalendarDays, CheckCheck, Loader2, Send } from "lucide-react";
import Link from "next/link";

const API_URL =
  (process.env.NEXT_PUBLIC_API_URL ||
    (typeof window !== "undefined" && !window.location.hostname.includes("localhost")
      ? "https://api.finejewellerybuyers.co.uk"
      : "http://localhost:8002")) + "/api";

type ChatMessage = {
  id: number;
  sender: "admin" | "customer";
  body: string;
  admin_name?: string | null;
  created_at?: string;
  created_at_human: string;
};

type LinkedBooking = {
  id: number;
  service_type?: string | null;
  booking_date?: string | null;
  booking_time?: string | null;
  status?: string | null;
};

function dayKey(iso?: string) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
}

function dayLabel(iso?: string) {
  const key = dayKey(iso);
  if (!key) return "";
  const d = new Date(`${key}T12:00:00`);
  const today = new Date();
  const todayKey = today.toISOString().slice(0, 10);
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const yesterdayKey = yesterday.toISOString().slice(0, 10);
  if (key === todayKey) return "Today";
  if (key === yesterdayKey) return "Yesterday";
  return d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });
}

function timeLabel(iso?: string, fallback?: string) {
  if (!iso) return fallback || "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return fallback || "";
  return d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
}

function formatBookingChip(booking: LinkedBooking) {
  const parsed = booking.booking_date
    ? new Date(booking.booking_date.includes("T") ? booking.booking_date : `${booking.booking_date.slice(0, 10)}T12:00:00`)
    : null;
  const date =
    parsed && !Number.isNaN(parsed.getTime())
      ? parsed.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" })
      : "";
  return [booking.service_type, date, booking.booking_time].filter(Boolean).join(" · ");
}

export default function EnquiryPage({ params }: { params: Promise<{ token: string }> }) {
  const [token, setToken] = useState<string | null>(null);
  const [formName, setFormName] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [booking, setBooking] = useState<LinkedBooking | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [reply, setReply] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [newIncoming, setNewIncoming] = useState(false);
  const [adminTyping, setAdminTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const nearBottomRef = useRef(true);
  const lastIdsRef = useRef("");
  const typingTimer = useRef<number | null>(null);
  const lastTypingPing = useRef(0);

  useEffect(() => {
    document.body.classList.add("overflow-hidden");
    return () => document.body.classList.remove("overflow-hidden");
  }, []);

  useEffect(() => {
    params.then((p) => {
      try {
        setToken(decodeURIComponent(p.token || "").trim());
      } catch {
        setToken((p.token || "").trim());
      }
    });
  }, [params]);

  const applyPayload = useCallback((json: { data?: { form_name?: string; customer_name?: string; messages?: ChatMessage[]; booking?: LinkedBooking | null; admin_typing?: boolean } }, silent = false) => {
    const next = json.data?.messages || [];
    const nextIds = next.map((m) => m.id).join(",");
    const prevIds = lastIdsRef.current;
    const hasNewAdmin =
      silent &&
      next.some((m) => m.sender === "admin" && !prevIds.split(",").filter(Boolean).includes(String(m.id)));

    lastIdsRef.current = nextIds;
    if (json.data?.form_name) setFormName(json.data.form_name);
    if (json.data?.customer_name) setCustomerName(json.data.customer_name);
    if (json.data?.booking) setBooking(json.data.booking);
    setAdminTyping(Boolean(json.data?.admin_typing));
    setMessages(next);

    if (hasNewAdmin) {
      if (nearBottomRef.current) {
        requestAnimationFrame(() => chatEndRef.current?.scrollIntoView({ behavior: "smooth" }));
      } else {
        setNewIncoming(true);
      }
    }
  }, []);

  const loadConversation = useCallback(async (silent = false) => {
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/enquiry/${token}`, { cache: "no-store" });
      if (!res.ok) throw new Error();
      const json = await res.json();
      applyPayload(json, silent);
      setError("");
    } catch {
      if (!silent) setError("This enquiry link is invalid or has expired.");
    } finally {
      if (!silent) setLoading(false);
    }
  }, [token, applyPayload]);

  useEffect(() => {
    if (!token) return;
    loadConversation(false);
    const interval = setInterval(() => loadConversation(true), 2000);
    return () => {
      clearInterval(interval);
      if (typingTimer.current) window.clearTimeout(typingTimer.current);
      fetch(`${API_URL}/enquiry/${token}/typing`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ typing: false }),
      }).catch(() => {});
    };
  }, [token, loadConversation]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const openToken = new URLSearchParams(window.location.search).get("o");
    if (!openToken) return;
    fetch(`${API_URL}/mail/click/${encodeURIComponent(openToken)}`, { cache: "no-store", redirect: "manual" }).catch(() => {});
  }, []);

  useEffect(() => {
    if (!loading && messages.length) {
      chatEndRef.current?.scrollIntoView({ behavior: "auto" });
    }
  }, [loading]);

  function handleScroll() {
    const el = scrollerRef.current;
    if (!el) return;
    nearBottomRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
    if (nearBottomRef.current) setNewIncoming(false);
  }

  function jumpToLatest() {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    setNewIncoming(false);
    nearBottomRef.current = true;
  }

  function pingTyping(typing: boolean) {
    if (!token) return;
    fetch(`${API_URL}/enquiry/${token}/typing`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ typing }),
    }).catch(() => {});
  }

  function resizeComposer() {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 128)}px`;
  }

  async function handleSend(e?: React.FormEvent) {
    e?.preventDefault();
    if (!token || !reply.trim() || sending) return;
    const text = reply.trim();
    setSending(true);
    setError("");
    setReply("");
    pingTyping(false);
    requestAnimationFrame(resizeComposer);
    try {
      const res = await fetch(`${API_URL}/enquiry/${token}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ message: text }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Failed");
      applyPayload(json);
      nearBottomRef.current = true;
      requestAnimationFrame(() => chatEndRef.current?.scrollIntoView({ behavior: "smooth" }));
      textareaRef.current?.focus();
    } catch {
      setReply(text);
      setError("Couldn’t send. Check your connection and try again.");
    } finally {
      setSending(false);
    }
  }

  if (loading) {
    return (
      <div className="h-dvh flex items-center justify-center bg-[#efeae2]">
        <Loader2 className="w-8 h-8 animate-spin text-[#008069]" />
      </div>
    );
  }

  if (error && messages.length === 0 && !formName) {
    return (
      <div className="h-dvh flex items-center justify-center bg-[#f3eee6] px-6">
        <div className="text-center max-w-md">
          <p className="text-red-600 mb-4">{error}</p>
          <Link href="/" className="inline-flex min-h-11 items-center text-amber-800 font-semibold">
            Back to home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="h-dvh flex flex-col bg-[#efeae2] overflow-hidden">
      <header className="shrink-0 bg-[#008069] text-white safe-top">
        <div className="flex items-center gap-2 px-2 sm:px-3 py-2">
          <Link
            href="/"
            className="flex items-center justify-center min-h-11 min-w-11 text-white/90 hover:text-white"
            aria-label="Back to home"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="w-10 h-10 rounded-full bg-white text-[#008069] font-bold flex items-center justify-center shrink-0">
            F
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-[15px] font-semibold truncate">Fine Jewellery Buyers</h1>
            <p className="text-[11px] text-white/85 truncate">
              {adminTyping ? "typing..." : formName ? `${formName} · typically replies in minutes` : "Typically replies in minutes"}
            </p>
          </div>
        </div>
      </header>

      <div className="relative flex-1 min-h-0">
        <div
          ref={scrollerRef}
          onScroll={handleScroll}
          className="absolute inset-0 overflow-y-auto overscroll-contain chat-wallpaper px-3 sm:px-4 py-3"
        >
          <div className="max-w-2xl mx-auto space-y-2 pb-2">
            {customerName && (
              <p className="text-center text-[11px] text-black/50 py-1">
                Hi {customerName}. Your messages stay in this chat so you can pick up where you left off.
              </p>
            )}
            {booking && (
              <div className="mx-auto max-w-[92%] rounded-2xl bg-white/90 border border-black/5 px-3 py-2.5 text-center shadow-sm">
                <p className="text-[11px] font-semibold text-amber-800 inline-flex items-center gap-1.5">
                  <CalendarDays className="w-3.5 h-3.5" /> Linked appointment
                </p>
                <p className="text-xs text-black mt-0.5">{formatBookingChip(booking)}</p>
              </div>
            )}

            {messages.length === 0 && (
              <p className="text-center text-sm text-black/50 py-16">
                Send a message below and we’ll reply here.
              </p>
            )}

            {messages.map((msg, index) => {
              const showDay = dayKey(msg.created_at) && dayKey(msg.created_at) !== dayKey(messages[index - 1]?.created_at);
              const mine = msg.sender === "customer";
              return (
                <div key={msg.id}>
                  {showDay && (
                    <div className="flex justify-center my-3">
                      <span className="text-[11px] font-medium text-black/60 bg-white/80 px-3 py-1 rounded-full shadow-sm">
                        {dayLabel(msg.created_at)}
                      </span>
                    </div>
                  )}
                  <div className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[86%] rounded-2xl px-3 py-2 shadow-sm ${
                        mine
                          ? "bg-[#d9fdd3] text-[#111b21] rounded-br-sm"
                          : "bg-white text-[#111b21] rounded-bl-sm"
                      }`}
                    >
                      {!mine && (
                        <p className="text-[10px] font-semibold text-[#008069] mb-0.5">
                          {msg.admin_name || "Fine Jewellery Buyers"}
                        </p>
                      )}
                      <p className="text-[15px] whitespace-pre-wrap break-words leading-relaxed">{msg.body}</p>
                      <p className={`mt-1 flex items-center gap-1 text-[10px] text-[#667781] ${mine ? "justify-end" : ""}`}>
                        <span>{timeLabel(msg.created_at, msg.created_at_human)}</span>
                        {mine && <CheckCheck className="w-3.5 h-3.5" aria-hidden />}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
            {adminTyping && (
              <div className="flex justify-start">
                <div className="bg-white rounded-2xl rounded-bl-sm px-3 py-2.5 shadow-sm">
                  <span className="wa-typing" aria-label="Fine Jewellery Buyers is typing">
                    <i /><i /><i />
                  </span>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>
        </div>

        {newIncoming && (
          <button
            type="button"
            onClick={jumpToLatest}
            className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 min-h-9 px-3 rounded-full bg-black text-white text-xs font-semibold shadow-lg"
          >
            New message
          </button>
        )}
      </div>

      <div className="shrink-0 bg-[#f0f2f5] safe-bottom">
        <form onSubmit={handleSend} className="max-w-2xl mx-auto px-2.5 sm:px-3 py-2">
          {error && <p className="text-xs text-red-600 px-2 mb-1.5">{error}</p>}
          <div className="flex items-end gap-2">
            <label className="sr-only" htmlFor="enquiry-message">
              Your message
            </label>
            <textarea
              id="enquiry-message"
              ref={textareaRef}
              value={reply}
              onChange={(e) => {
                setReply(e.target.value);
                resizeComposer();
                const now = Date.now();
                if (e.target.value.trim() && now - lastTypingPing.current > 1500) {
                  lastTypingPing.current = now;
                  pingTyping(true);
                }
                if (typingTimer.current) window.clearTimeout(typingTimer.current);
                typingTimer.current = window.setTimeout(() => pingTyping(false), 2500);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Type a message"
              rows={1}
              className="flex-1 bg-white text-[#111b21] rounded-3xl px-4 py-2.5 text-base resize-none shadow-sm focus:outline-none focus:ring-2 focus:ring-[#008069]/30 min-h-11 max-h-32 leading-relaxed"
            />
            <button
              type="submit"
              disabled={sending || !reply.trim()}
              className="h-11 w-11 flex items-center justify-center bg-[#008069] text-white rounded-full disabled:opacity-40 shrink-0 active:scale-95 transition-transform"
              aria-label="Send message"
            >
              {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
