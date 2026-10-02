"use client";

import { useCallback, useEffect, useState } from "react";
import { ArrowLeft, Loader2, Mail, MessageSquare, Plus, RefreshCw, Send, X } from "lucide-react";
import { getAuthHeaders, SubmissionChatPanel } from "./SubmissionChatPanel";

const API_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8002") + "/api";

type ConversationItem = {
  id: number;
  form_name: string;
  customer_name: string;
  customer_email?: string | null;
  status: string;
  unread: boolean;
  booking?: { id: number; service_type?: string | null; booking_date?: string | null; booking_time?: string | null } | null;
  last_message?: {
    sender: string;
    body: string;
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

export function MessagesContent({
  showToast,
  onUnreadChange,
  initialSelectedId,
}: {
  showToast: (msg: string, type: "success" | "error") => void;
  onUnreadChange?: () => void;
  initialSelectedId?: number | null;
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

  const fetchMessages = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/admin/messages`, { headers: getAuthHeaders() });
      const data = await res.json();
      setConversations(data.data || []);
    } catch {
      showToast("Failed to load messages", "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 8000);
    return () => clearInterval(interval);
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

  const handleRead = useCallback(() => {
    onUnreadChange?.();
    setConversations((prev) =>
      prev.map((c) => (c.id === selectedId ? { ...c, unread: false } : c))
    );
  }, [onUnreadChange, selectedId]);

  const handleNewCustomerMessage = useCallback(() => {
    onUnreadChange?.();
    fetchMessages();
  }, [onUnreadChange, fetchMessages]);

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
      const date = booking.booking_date
        ? new Date(`${booking.booking_date}T12:00:00`).toLocaleDateString("en-GB", {
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 sm:mb-6 px-3 pt-3 sm:px-0 sm:pt-0">
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
        <div className="bg-white rounded-none sm:rounded-xl border-0 sm:border border-gray-200 overflow-hidden h-[calc(100dvh-7.5rem)] sm:h-[calc(100dvh-12rem)] min-h-[360px] flex">
          <div
            className={`${
              selectedId ? "hidden md:flex" : "flex"
            } w-full md:w-80 lg:w-96 border-r border-gray-200 flex-col shrink-0`}
          >
            <div className="overflow-y-auto flex-1">
              {conversations.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setSelectedId(c.id)}
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
                        <p className="font-semibold text-sm text-black truncate">{c.customer_name}</p>
                        {c.unread && <span className="w-2.5 h-2.5 rounded-full bg-red-500 shrink-0 animate-pulse" />}
                      </div>
                      <p className="text-xs text-gray-500 truncate">
                        {c.booking
                          ? `${c.booking.service_type || "Appointment"} · ${c.booking.booking_date || ""}`
                          : c.customer_email || c.form_name}
                      </p>
                      {c.last_message && (
                        <p className="text-xs text-gray-400 truncate mt-1">
                          {c.last_message.sender === "admin" ? "You: " : ""}
                          {c.last_message.body}
                        </p>
                      )}
                      <p className="text-[10px] text-gray-400 mt-1">{c.last_message?.created_at_human || c.created_at_human}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className={`${selectedId ? "flex" : "hidden md:flex"} flex-1 flex-col min-w-0 min-h-0`}>
            {selectedId ? (
              <>
                <button
                  type="button"
                  onClick={() => setSelectedId(null)}
                  className="md:hidden flex items-center gap-2 px-4 py-3 border-b border-gray-200 text-sm font-medium text-gray-700 bg-white shrink-0"
                >
                  <ArrowLeft className="w-4 h-4" /> Back to conversations
                </button>
                <SubmissionChatPanel
                  key={selectedId}
                  submissionId={selectedId}
                  showToast={showToast}
                  onRead={handleRead}
                  onNewCustomerMessage={handleNewCustomerMessage}
                  compact
                />
              </>
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
