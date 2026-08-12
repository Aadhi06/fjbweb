"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronDown, ChevronUp, Loader2, MessageSquare, Send, X } from "lucide-react";
import { useSettings } from "@/lib/useSettings";

const API_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8002") + "/api";

export function getAuthHeaders(): Record<string, string> {
  const token = typeof window !== "undefined" ? localStorage.getItem("admin_token") : null;
  return {
    Accept: "application/json",
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export type ChatMessage = {
  id: number;
  sender: "admin" | "customer";
  body: string;
  admin_name?: string | null;
  created_at_human: string;
};

export type SubmissionFile = {
  id: number;
  original_name: string;
  url: string;
  is_image: boolean;
};

export type SubmissionDetail = {
  id: number;
  form_name: string;
  form_slug?: string;
  data: Record<string, string>;
  files?: SubmissionFile[];
  messages: ChatMessage[];
  customer_email?: string | null;
  created_at_human: string;
};

const SUMMARY_FIELD_ORDER = ["gold_items", "estimated_total", "items_count", "expected_price", "name", "email", "phone"];

function suggestedReplies(whatsapp: string) {
  const waDigits = (whatsapp || "").replace(/\D/g, "");
  const waLink = waDigits ? `https://wa.me/${waDigits}` : "WhatsApp";

  return [
    {
      id: "more-details",
      label: "Need more details",
      text: "Thank you for your enquiry. To give you an accurate valuation, please send a few more details — clearer photos (front, back and any hallmarks), approximate weight, carat if known, and any certificates.",
    },
    {
      id: "whatsapp",
      label: "Send to WhatsApp",
      text: `Please send all photos and details to our WhatsApp and we will get back to you quickly: ${waLink}`,
    },
    {
      id: "received",
      label: "We've received this",
      text: "Thank you — we have received your valuation request and photos. Our team is reviewing everything and will reply with an offer shortly.",
    },
    {
      id: "visit",
      label: "Visit Hatton Garden",
      text: "We would be happy to value this in person at our Hatton Garden showroom. Please book a time that suits you and bring the item along — no obligation.",
    },
    {
      id: "offer-soon",
      label: "Offer coming soon",
      text: "Thank you for the extra information. We are preparing your offer now and will send it through as soon as it is ready.",
    },
  ];
}

function formatFields(data: Record<string, string>) {
  const entries: [string, string][] = [];
  const handled = new Set<string>();
  for (const key of SUMMARY_FIELD_ORDER) {
    if (data[key]) {
      entries.push([key, data[key]]);
      handled.add(key);
    }
  }
  for (const [key, value] of Object.entries(data)) {
    if (handled.has(key) || key.startsWith("_") || key === "photos" || key === "consent") continue;
    entries.push([key, value]);
  }
  return entries;
}

function ChatBubble({ msg }: { msg: ChatMessage }) {
  const isAdmin = msg.sender === "admin";
  return (
    <div className={`flex ${isAdmin ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[88%] sm:max-w-[75%] rounded-2xl px-3.5 py-2.5 sm:px-4 ${
          isAdmin ? "bg-black text-white rounded-br-md" : "bg-gray-100 text-black rounded-bl-md"
        }`}
      >
        <p className="text-[10px] font-semibold opacity-70 mb-1">
          {isAdmin ? (msg.admin_name || "You") : "Customer"}
        </p>
        <p className="text-sm whitespace-pre-wrap break-words">{msg.body}</p>
        <p className="text-[10px] opacity-60 mt-1">{msg.created_at_human}</p>
      </div>
    </div>
  );
}

export function SubmissionChatPanel({
  submissionId,
  showToast,
  onRead,
  onNewCustomerMessage,
  compact = false,
  onClose,
}: {
  submissionId: number;
  showToast: (msg: string, type: "success" | "error") => void;
  onRead?: () => void;
  onNewCustomerMessage?: () => void;
  compact?: boolean;
  onClose?: () => void;
}) {
  const [detail, setDetail] = useState<SubmissionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);
  const [showDetails, setShowDetails] = useState(!compact);
  const settings = useSettings();
  const chatEndRef = useRef<HTMLDivElement>(null);
  const replyRef = useRef<HTMLTextAreaElement>(null);
  const onReadRef = useRef(onRead);
  const onNewCustomerMessageRef = useRef(onNewCustomerMessage);
  const messageIdsRef = useRef<string>("");
  onReadRef.current = onRead;
  onNewCustomerMessageRef.current = onNewCustomerMessage;

  const loadDetail = useCallback(async (options?: { markRead?: boolean; silent?: boolean }) => {
    const markRead = options?.markRead ?? false;
    const silent = options?.silent ?? false;
    if (!silent) setLoading(true);

    try {
      const url = `${API_URL}/admin/submissions/${submissionId}?mark_read=${markRead ? "1" : "0"}`;
      const res = await fetch(url, { headers: getAuthHeaders() });
      if (!res.ok) throw new Error();
      const json = await res.json();
      const data = json.data as SubmissionDetail;

      if (silent) {
        const prevIds = messageIdsRef.current;
        const nextIds = data.messages.map((m) => m.id).join(",");
        const hasNewCustomer = data.messages.some(
          (m) => m.sender === "customer" && !prevIds.split(",").filter(Boolean).includes(String(m.id))
        );
        messageIdsRef.current = nextIds;
        setDetail(data);
        if (hasNewCustomer) {
          showToast("New message from customer", "success");
          onNewCustomerMessageRef.current?.();
          await fetch(`${API_URL}/admin/submissions/${submissionId}/mark-read`, {
            method: "POST",
            headers: getAuthHeaders(),
          });
          onReadRef.current?.();
        }
      } else {
        messageIdsRef.current = data.messages.map((m) => m.id).join(",");
        setDetail(data);
        if (markRead) onReadRef.current?.();
      }
    } catch {
      if (!silent) {
        showToast("Failed to load enquiry", "error");
        onClose?.();
      }
    } finally {
      if (!silent) setLoading(false);
    }
  }, [submissionId, onClose, showToast]);

  useEffect(() => {
    setLoading(true);
    setDetail(null);
    messageIdsRef.current = "";
    loadDetail({ markRead: true });

    const interval = setInterval(() => {
      loadDetail({ markRead: false, silent: true });
    }, 10000);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [submissionId]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [detail?.messages]);

  async function sendReply(e: React.FormEvent) {
    e.preventDefault();
    if (!reply.trim() || sending) return;
    setSending(true);
    try {
      const res = await fetch(`${API_URL}/admin/submissions/${submissionId}/messages`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ message: reply.trim() }),
      });
      if (!res.ok) throw new Error();
      setReply("");
      await loadDetail({ markRead: false });
      showToast("Reply sent to customer email", "success");
    } catch {
      showToast("Failed to send reply", "error");
    } finally {
      setSending(false);
    }
  }

  const fields = detail ? formatFields(detail.data || {}) : [];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!detail) return null;

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="flex items-center justify-between p-4 border-b border-gray-200 shrink-0 bg-white">
        <div className="min-w-0 flex-1">
          <h3 className="text-base sm:text-lg font-semibold text-black truncate">{detail.form_name}</h3>
          <p className="text-xs sm:text-sm text-gray-500 truncate">
            {detail.customer_email || "No email"} · {detail.created_at_human}
          </p>
        </div>
        {onClose && (
          <button onClick={onClose} className="ml-2 p-2 text-gray-400 hover:text-black shrink-0">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto min-h-0">
        {compact && (
          <button
            type="button"
            onClick={() => setShowDetails((v) => !v)}
            className="w-full flex items-center justify-between px-4 py-2.5 text-xs font-medium text-gray-600 bg-gray-50 border-b border-gray-100"
          >
            Enquiry details
            {showDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        )}

        {showDetails && (
          <div className="p-4 space-y-4 border-b border-gray-100 bg-white">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {fields.map(([key, value]) => (
                <div key={key} className="bg-gray-50 rounded-lg px-3 py-2 border border-gray-100">
                  <p className="text-[10px] font-semibold text-gray-400 uppercase">{key.replace(/_/g, " ")}</p>
                  <p className="text-sm text-black mt-0.5 break-words">{String(value)}</p>
                </div>
              ))}
            </div>
            {detail.files && detail.files.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Photos</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {detail.files.map((file) => (
                    <a key={file.id} href={file.url} target="_blank" rel="noopener noreferrer" className="block rounded-lg border overflow-hidden hover:border-amber-400">
                      {file.is_image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={file.url} alt={file.original_name} className="w-full h-24 sm:h-28 object-cover bg-gray-100" />
                      ) : (
                        <div className="h-24 flex items-center justify-center text-xs text-gray-500 p-2 text-center">{file.original_name}</div>
                      )}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="p-4 space-y-3">
          {!compact && (
            <p className="text-xs font-semibold text-gray-500 uppercase flex items-center gap-1.5">
              <MessageSquare className="w-4 h-4" /> Conversation
            </p>
          )}
          {detail.messages.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-8">No messages yet. Type below to email the customer.</p>
          )}
          {detail.messages.map((msg) => (
            <ChatBubble key={msg.id} msg={msg} />
          ))}
          <div ref={chatEndRef} />
        </div>
      </div>

      <form onSubmit={sendReply} className="border-t border-gray-200 p-3 sm:p-4 bg-gray-50 shrink-0 safe-bottom">
        <p className="text-[11px] text-gray-500 mb-2 hidden sm:block">Reply goes to customer email + their message page</p>
        <div className="flex flex-wrap gap-1.5 mb-2">
          {suggestedReplies(settings.whatsapp).map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => {
                setReply(preset.text);
                requestAnimationFrame(() => {
                  replyRef.current?.focus();
                  replyRef.current?.setSelectionRange(preset.text.length, preset.text.length);
                });
              }}
              className={`px-2.5 py-1 text-[11px] font-medium rounded-full border transition-colors ${
                reply === preset.text
                  ? "bg-amber-50 text-amber-800 border-amber-300"
                  : "bg-white text-gray-700 border-gray-200 hover:border-amber-400 hover:bg-amber-50/50"
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>
        <div className="flex gap-2 items-end">
          <textarea
            ref={replyRef}
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            placeholder="Type your reply, or tap a suggested reply above..."
            rows={2}
            className="flex-1 border border-gray-200 rounded-xl px-3 py-2.5 sm:px-4 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-amber-500/30 min-h-[44px]"
          />
          <button
            type="submit"
            disabled={sending || !reply.trim()}
            className="h-11 w-11 sm:px-4 sm:w-auto flex items-center justify-center bg-black text-white rounded-xl hover:bg-black/80 disabled:opacity-50 shrink-0"
          >
            {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          </button>
        </div>
      </form>
    </div>
  );
}

export function SubmissionChatModal({
  submissionId,
  onClose,
  showToast,
  onRead,
}: {
  submissionId: number;
  onClose: () => void;
  showToast: (msg: string, type: "success" | "error") => void;
  onRead?: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white sm:rounded-2xl shadow-xl w-full sm:max-w-3xl h-full sm:h-auto sm:max-h-[90vh] flex flex-col overflow-hidden">
        <SubmissionChatPanel
          submissionId={submissionId}
          showToast={showToast}
          onClose={onClose}
          onRead={onRead}
        />
      </div>
    </div>
  );
}
