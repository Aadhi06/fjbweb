"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Loader2, Mail, MessageSquare, Plus, RefreshCw, Search, Send, X } from "lucide-react";
import { getAuthHeaders, SubmissionChatPanel } from "./SubmissionChatPanel";

const API_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8002") + "/api";

type ConversationItem = {
  id: number;
  form_name: string;
  customer_name: string;
  customer_email?: string | null;
  status: string;
  unread: boolean;
  replied?: boolean;
  awaiting_reply?: boolean;
  last_message_at?: string;
  customer_typing?: boolean;
  booking?: { id: number; service_type?: string | null; booking_date?: string | null; booking_time?: string | null } | null;
  last_message?: {
    sender: string;
    body: string;
    created_at?: string;
    created_at_human: string;
  } | null;
  message_count: number;
  created_at_human: string;
};

type BookingOption = {
  id: number;
  name: string;
  email: string;
  service_type: string;
  booking_date: string;
  booking_time: string;
  status: string;
};

type ComposeMode = "email" | "chat" | null;

function lastMessageTime(conversation: ConversationItem): string {
  return conversation.last_message?.created_at || conversation.last_message_at || "";
}

function isAwaitingReply(conversation: ConversationItem): boolean {
  if (conversation.last_message?.sender === "customer") return true;
  if (typeof conversation.awaiting_reply === "boolean") return conversation.awaiting_reply;
  return conversation.unread;
}

function isReplied(conversation: ConversationItem): boolean {
  return conversation.last_message?.sender === "admin";
}

function localDateTimeParts(value?: string): { date: string; time: string } | null {
  if (!value) return null;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  const date = `${parsed.getFullYear()}-${String(parsed.getMonth() + 1).padStart(2, "0")}-${String(parsed.getDate()).padStart(2, "0")}`;
  const time = `${String(parsed.getHours()).padStart(2, "0")}:${String(parsed.getMinutes()).padStart(2, "0")}`;
  return { date, time };
}

function matchesConversationSearch(
  conversation: ConversationItem,
  searchName: string,
  searchDate: string,
  searchTime: string,
): boolean {
  const query = searchName.trim().toLowerCase();
  if (query) {
    const haystack = `${conversation.customer_name} ${conversation.customer_email || ""}`.toLowerCase();
    if (!haystack.includes(query)) return false;
  }

  if (!searchDate && !searchTime) return true;

  const parts = localDateTimeParts(conversation.last_message?.created_at || conversation.last_message_at);
  if (!parts) return false;
  if (searchDate && parts.date !== searchDate) return false;
  if (searchTime && parts.time !== searchTime) return false;
  return true;
}

export function MessagesContent({
  showToast,
  onUnreadChange,
  initialSelectedId,
  onClearSelected,
}: {
  showToast: (msg: string, type: "success" | "error") => void;
  onUnreadChange?: () => void;
  initialSelectedId?: number | null;
  onClearSelected?: () => void;
}) {
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<number | null>(initialSelectedId ?? null);
  const [compose, setCompose] = useState<ComposeMode>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [bookingId, setBookingId] = useState("");
  const [bookings, setBookings] = useState<BookingOption[]>([]);
  const [sending, setSending] = useState(false);
  const [listFilter, setListFilter] = useState<"all" | "unread" | "replied">("all");
  const [searchName, setSearchName] = useState("");
  const [searchDate, setSearchDate] = useState("");
  const [searchTime, setSearchTime] = useState("");
  const fetchingRef = useRef(false);

  const fetchMessages = useCallback(async (options?: { silent?: boolean }) => {
    if (fetchingRef.current) return;
    fetchingRef.current = true;
    try {
      const res = await fetch(`${API_URL}/admin/messages`, { headers: getAuthHeaders() });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || "Failed to load messages");
      setConversations(Array.isArray(data.data) ? data.data : []);
    } catch {
      if (!options?.silent) showToast("Failed to load messages", "error");
    } finally {
      fetchingRef.current = false;
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchMessages();
    const tick = () => {
      if (document.hidden) return;
      fetchMessages({ silent: true });
    };
    const interval = setInterval(tick, 20000);
    const onVisible = () => {
      if (!document.hidden) fetchMessages({ silent: true });
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [fetchMessages]);

  useEffect(() => {
    fetch(`${API_URL}/admin/bookings?per_page=100`, { headers: getAuthHeaders() })
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => setBookings(json?.data || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (initialSelectedId) setSelectedId(initialSelectedId);
  }, [initialSelectedId]);

  useEffect(() => {
    const onPop = () => {
      const id = new URLSearchParams(window.location.search).get("submission");
      setSelectedId(id ? Number(id) : null);
      if (!id) onClearSelected?.();
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, [onClearSelected]);

  const unreadTotal = conversations.filter((c) => isAwaitingReply(c)).length;
  const repliedTotal = conversations.filter((c) => isReplied(c)).length;
  const visibleConversations = useMemo(() => {
    const sorted = [...conversations].sort((a, b) => {
      const aTime = lastMessageTime(a);
      const bTime = lastMessageTime(b);
      if (aTime && bTime && aTime !== bTime) return bTime.localeCompare(aTime);
      if (aTime && !bTime) return -1;
      if (!aTime && bTime) return 1;
      return b.id - a.id;
    });
    return sorted.filter((c) => {
      if (listFilter === "unread" && !isAwaitingReply(c)) return false;
      if (listFilter === "replied" && !isReplied(c)) return false;
      return matchesConversationSearch(c, searchName, searchDate, searchTime);
    });
  }, [conversations, listFilter, searchName, searchDate, searchTime]);

  const handleRead = useCallback(() => {
    onUnreadChange?.();
    setConversations((prev) =>
      prev.map((c) => (c.id === selectedId ? { ...c, unread: false } : c))
    );
  }, [onUnreadChange, selectedId]);

  const handleNewCustomerMessage = useCallback(() => {
    onUnreadChange?.();
    setConversations((prev) =>
      prev.map((c) =>
        c.id === selectedId
          ? {
              ...c,
              unread: true,
              awaiting_reply: true,
              replied: false,
              last_message: {
                sender: "customer",
                body: c.last_message?.body || "New message",
                created_at: new Date().toISOString(),
                created_at_human: "just now",
              },
              last_message_at: new Date().toISOString(),
            }
          : c
      )
    );
  }, [onUnreadChange, selectedId]);

  function closeChat() {
    if (typeof window !== "undefined" && window.history.state?.fjbChat) {
      window.history.back();
      return;
    }
    setSelectedId(null);
    onClearSelected?.();
  }

  function openChat(id: number) {
    setSelectedId(id);
    if (typeof window === "undefined") return;
    const url = new URL(window.location.href);
    url.searchParams.set("tab", "messages");
    url.searchParams.set("submission", String(id));
    window.history.pushState({ fjbChat: id }, "", `${url.pathname}?${url.searchParams.toString()}`);
  }

  function resetCompose() {
    setCompose(null);
    setName("");
    setEmail("");
    setSubject("");
    setMessage("");
    setBookingId("");
  }

  function selectBooking(id: string) {
    setBookingId(id);
    const booking = bookings.find((b) => String(b.id) === id);
    if (!booking) return;
    setName(booking.name || "");
    setEmail(booking.email || "");
    if (compose === "chat" && !message.trim()) {
      const parsed = booking.booking_date
        ? new Date(booking.booking_date.includes("T") ? booking.booking_date : `${booking.booking_date.slice(0, 10)}T12:00:00`)
        : null;
      const date =
        parsed && !Number.isNaN(parsed.getTime())
          ? parsed.toLocaleDateString("en-GB", {
              weekday: "short",
              day: "numeric",
              month: "short",
            })
          : "";
      setMessage(
        `Fine Jewellery Buyers started a new conversation with you about your appointment${date ? ` on ${date}` : ""}${booking.booking_time ? ` at ${booking.booking_time}` : ""}${booking.service_type ? ` (${booking.service_type})` : ""}. Reply here if you have any questions before you visit.`
      );
    }
  }

  async function handleComposeSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!compose) return;
    setSending(true);
    try {
      const path = compose === "email" ? "/admin/messages/email" : "/admin/messages/start";
      const body =
        compose === "email"
          ? { email, name, subject, message }
          : { email, name, message, booking_id: bookingId ? Number(bookingId) : undefined };
      const res = await fetch(`${API_URL}${path}`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(body),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.message || "Send failed");
      showToast(json.message || "Sent", "success");
      if (compose === "chat" && json.data?.id) {
        setSelectedId(json.data.id);
        fetchMessages();
      }
      resetCompose();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Send failed", "error");
    } finally {
      setSending(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div>
      <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 sm:mb-6 px-3 pt-3 sm:px-0 sm:pt-0 ${selectedId ? "hidden md:flex" : ""}`}>
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-black mb-1">Messages</h2>
          <p className="text-sm text-gray-500">Email anyone, or start a chat from admin</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setCompose("email")}
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-black text-white text-sm font-semibold rounded-lg hover:bg-gray-800"
          >
            <Mail className="w-4 h-4" /> Send email
          </button>
          <button
            type="button"
            onClick={() => setCompose("chat")}
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-[#D97706] text-white text-sm font-semibold rounded-lg hover:bg-[#b45309]"
          >
            <Plus className="w-4 h-4" /> Start chat
          </button>
          <button
            type="button"
            onClick={() => { setLoading(true); fetchMessages(); onUnreadChange?.(); }}
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-black px-2 py-2"
          >
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
        </div>
      </div>

      {conversations.length === 0 && !selectedId ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No conversations yet. Send an email or start a chat with any customer.</p>
        </div>
      ) : (
        <div className={`bg-white rounded-none sm:rounded-xl border-0 sm:border border-gray-200 overflow-hidden min-h-[360px] flex ${
          selectedId
            ? "fixed inset-0 z-50 h-dvh md:static md:z-auto md:h-[calc(100dvh-12rem)]"
            : "h-[calc(100dvh-7.5rem)] sm:h-[calc(100dvh-12rem)]"
        }`}>
          <div
            className={`${
              selectedId ? "hidden md:flex" : "flex"
            } w-full md:w-80 lg:w-96 border-r border-gray-200 flex-col shrink-0`}
          >
            <div className="sticky top-0 z-10 bg-white border-b border-gray-100 px-3 py-2.5 space-y-2 shrink-0">
              <label className="relative block">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="search"
                  value={searchName}
                  onChange={(e) => setSearchName(e.target.value)}
                  placeholder="Search by name"
                  aria-label="Search by name"
                  className="w-full min-h-11 pl-9 pr-3 rounded-lg border border-gray-200 text-sm text-black placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#D97706]/30 focus:border-[#D97706]"
                />
              </label>
              <div className="grid grid-cols-2 gap-2">
                <label className="block">
                  <span className="sr-only">Filter by date</span>
                  <input
                    type="date"
                    value={searchDate}
                    onChange={(e) => setSearchDate(e.target.value)}
                    className="w-full min-h-11 px-3 rounded-lg border border-gray-200 text-sm text-black focus:outline-none focus:ring-2 focus:ring-[#D97706]/30 focus:border-[#D97706]"
                  />
                </label>
                <label className="block">
                  <span className="sr-only">Filter by time</span>
                  <input
                    type="time"
                    value={searchTime}
                    onChange={(e) => setSearchTime(e.target.value)}
                    className="w-full min-h-11 px-3 rounded-lg border border-gray-200 text-sm text-black focus:outline-none focus:ring-2 focus:ring-[#D97706]/30 focus:border-[#D97706]"
                  />
                </label>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  aria-pressed={listFilter === "all"}
                  onClick={() => setListFilter("all")}
                  className={`min-h-11 px-3.5 rounded-full text-sm font-semibold transition-colors ${
                    listFilter === "all" ? "bg-black text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  All {conversations.length}
                </button>
                <button
                  type="button"
                  aria-pressed={listFilter === "unread"}
                  onClick={() => setListFilter("unread")}
                  className={`min-h-11 px-3.5 rounded-full text-sm font-semibold inline-flex items-center gap-1.5 transition-colors ${
                    listFilter === "unread" ? "bg-[#D97706] text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  New
                  {unreadTotal > 0 && (
                    <span
                      className={`min-w-5 h-5 px-1 rounded-full text-[11px] leading-5 font-bold ${
                        listFilter === "unread" ? "bg-white text-[#D97706]" : "bg-red-500 text-white"
                      }`}
                    >
                      {unreadTotal > 99 ? "99+" : unreadTotal}
                    </span>
                  )}
                </button>
                <button
                  type="button"
                  aria-pressed={listFilter === "replied"}
                  onClick={() => setListFilter("replied")}
                  className={`ml-auto min-h-11 px-3.5 rounded-full text-sm font-semibold inline-flex items-center gap-1.5 transition-colors ${
                    listFilter === "replied" ? "bg-[#008069] text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  Replied
                  {repliedTotal > 0 && (
                    <span
                      className={`min-w-5 h-5 px-1 rounded-full text-[11px] leading-5 font-bold ${
                        listFilter === "replied" ? "bg-white text-[#008069]" : "bg-[#008069] text-white"
                      }`}
                    >
                      {repliedTotal > 99 ? "99+" : repliedTotal}
                    </span>
                  )}
                </button>
              </div>
            </div>
            <div className="overflow-y-auto flex-1">
              {visibleConversations.length === 0 ? (
                <div className="p-8 text-center">
                  <p className="text-sm text-gray-500">
                    {listFilter === "unread"
                      ? "No new customer messages"
                      : listFilter === "replied"
                        ? "No replied messages"
                        : searchName || searchDate || searchTime
                          ? "No matching conversations"
                          : "No conversations"}
                  </p>
                </div>
              ) : (
                visibleConversations.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => openChat(c.id)}
                  className={`w-full text-left px-4 py-3.5 border-b border-gray-50 hover:bg-gray-50 transition-colors ${
                    selectedId === c.id ? "bg-amber-50/80" : ""
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center text-sm font-bold shrink-0">
                      {c.customer_name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className={`text-sm text-black truncate ${isAwaitingReply(c) ? "font-bold" : "font-semibold"}`}>
                          {c.customer_name}
                        </p>
                        {isAwaitingReply(c) ? (
                          <span className="text-[10px] font-bold uppercase tracking-wide text-red-500 shrink-0">New</span>
                        ) : isReplied(c) ? (
                          <span className="text-[10px] font-bold uppercase tracking-wide text-[#008069] shrink-0">Replied</span>
                        ) : null}
                      </div>
                      <p className="text-xs text-gray-500 truncate">
                        {c.booking
                          ? `${c.booking.service_type || "Appointment"} · ${c.booking.booking_date || ""}`
                          : c.customer_email || c.form_name}
                      </p>
                      {c.customer_typing ? (
                        <p className="text-xs text-[#008069] font-medium truncate mt-1">typing...</p>
                      ) : c.last_message ? (
                        <p className={`text-xs truncate mt-1 ${isAwaitingReply(c) ? "text-gray-700 font-medium" : "text-gray-400"}`}>
                          {c.last_message.sender === "admin" ? "You: " : ""}
                          {c.last_message.body}
                        </p>
                      ) : null}
                      <p className="text-[10px] text-gray-400 mt-1">{c.last_message?.created_at_human || c.created_at_human}</p>
                    </div>
                  </div>
                </button>
                ))
              )}
            </div>
          </div>

          <div className={`${selectedId ? "flex" : "hidden md:flex"} flex-1 flex-col min-w-0 min-h-0`}>
            {selectedId ? (
              <SubmissionChatPanel
                key={selectedId}
                submissionId={selectedId}
                showToast={showToast}
                onRead={handleRead}
                onNewCustomerMessage={handleNewCustomerMessage}
                onClose={closeChat}
                compact
              />
            ) : (
              <div className="hidden md:flex flex-1 items-center justify-center text-gray-400 text-sm p-8 text-center">
                <div>
                  <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  Select a conversation, or start a new chat
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {compose && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <form
            onSubmit={handleComposeSubmit}
            className="bg-white rounded-t-2xl sm:rounded-2xl max-w-lg w-full shadow-2xl max-h-[92dvh] overflow-y-auto"
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h3 className="font-bold text-black">
                {compose === "email" ? "Send email" : "Start chat"}
              </h3>
              <button type="button" onClick={resetCompose} className="text-gray-400 hover:text-black">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 sm:p-6 space-y-4">
              {compose === "chat" && bookings.length > 0 && (
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase block mb-1">Link appointment (optional)</label>
                  <select
                    value={bookingId}
                    onChange={(e) => selectBooking(e.target.value)}
                    className="w-full px-3 py-3 border border-gray-200 rounded-lg text-base sm:text-sm min-h-11"
                  >
                    <option value="">No appointment</option>
                    {bookings.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name} · {b.service_type} · {b.booking_date} {b.booking_time}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase block mb-1">To email</label>
                <input
                  type="email"
                  required={!bookingId}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="customer@email.com"
                  className="w-full px-3 py-3 border border-gray-200 rounded-lg text-base sm:text-sm min-h-11"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase block mb-1">Name (optional)</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Customer name"
                  className="w-full px-3 py-3 border border-gray-200 rounded-lg text-base sm:text-sm min-h-11"
                />
              </div>
              {compose === "email" && (
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase block mb-1">Subject</label>
                  <input
                    required
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Your valuation"
                    className="w-full px-3 py-3 border border-gray-200 rounded-lg text-base sm:text-sm min-h-11"
                  />
                </div>
              )}
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase block mb-1">
                  {compose === "email" ? "Message" : "First message"}
                </label>
                <textarea
                  required
                  rows={6}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={
                    compose === "email"
                      ? "Write the email…"
                      : "This starts a chat. They get an email with a reply link."
                  }
                  className="w-full px-3 py-3 border border-gray-200 rounded-lg text-base sm:text-sm resize-y min-h-[120px]"
                />
              </div>
              <button
                type="submit"
                disabled={sending}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 bg-black text-white text-sm font-semibold rounded-lg hover:bg-gray-800 disabled:opacity-50"
              >
                {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                {compose === "email" ? "Send email" : "Start chat & email them"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
