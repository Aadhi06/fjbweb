"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, CalendarDays, Check, CheckCheck, Loader2, MessageSquare, Paperclip, Send } from "lucide-react";
import { ChatMedia, PendingChatFiles, type ChatAttachment } from "@/components/chat/ChatMedia";
import { useSettings } from "@/lib/useSettings";

const API_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8002") + "/api";

export function getAuthHeaders(json = true): Record<string, string> {
  const token = typeof window !== "undefined" ? localStorage.getItem("admin_token") : null;
  return {
    Accept: "application/json",
    ...(json ? { "Content-Type": "application/json" } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export type ChatMessage = {
  id: number;
  sender: "admin" | "customer";
  body: string;
  admin_name?: string | null;
  created_at_human: string;
  email_opened_at?: string | null;
  email_opened_at_human?: string | null;
  page_viewed_at?: string | null;
  page_viewed_at_human?: string | null;
  delivery_status?: "sent" | "email_opened" | "chat_opened" | null;
  attachments?: ChatAttachment[];
};

export type SubmissionFile = {
  id: number;
  original_name: string;
  url: string;
  is_image: boolean;
};

export type LinkedBooking = {
  id: number;
  name?: string | null;
  service_type?: string | null;
  booking_date?: string | null;
  booking_time?: string | null;
  status?: string | null;
};

export type SubmissionDetail = {
  id: number;
  form_name: string;
  form_slug?: string;
  data: Record<string, string>;
  files?: SubmissionFile[];
  messages: ChatMessage[];
  booking?: LinkedBooking | null;
  customer_email?: string | null;
  customer_typing?: boolean;
  created_at_human: string;
};

const SUMMARY_FIELD_ORDER = ["gold_items", "estimated_total", "items_count", "expected_price", "name", "email", "phone"];

type SuggestedReply = { id: string; label: string; body: string };

function fieldValue(data: Record<string, string>, ...keys: string[]) {
  for (const key of keys) {
    const value = (data[key] || "").trim();
    if (value) return value;
  }
  return "";
}

function firstName(fullName: string) {
  return fullName.trim().split(/\s+/)[0] || "";
}

function greetingFor(name: string) {
  return name ? `Hi ${name}, ` : "Hi, ";
}

function itemPhraseFrom(detail: SubmissionDetail) {
  const data = detail.data || {};
  const itemType = fieldValue(data, "item_type", "item", "what_are_you_selling");
  const subject = fieldValue(data, "subject");
  const blob = `${itemType} ${subject} ${fieldValue(data, "description", "item_description", "details", "message")}`.toLowerCase();

  if (/gold and diamond|gold & diamond|gold \/ diamond/.test(blob)) return "your gold and diamond rings";
  if (itemType) return `your ${itemType.toLowerCase()}`;
  if (/diamond ring/.test(blob)) return "your diamond rings";
  if (/gold ring/.test(blob)) return "your gold rings";
  if (/diamond/.test(blob)) return "your diamonds";
  if (/gold/.test(blob)) return "your gold";
  if (/watch/.test(blob)) return "your watch";
  if (subject) return `your ${subject.toLowerCase().replace(/^selling\s+/, "")}`;
  return "your jewellery";
}

function buildSuggestedReplies(detail: SubmissionDetail, whatsapp: string): SuggestedReply[] {
  const data = detail.data || {};
  const itemType = fieldValue(data, "item_type", "item", "what_are_you_selling");
  const description = fieldValue(data, "description", "item_description", "details", "message");
  const preferred = fieldValue(data, "preferred_contact", "contact_method").toLowerCase();
  const hasPhotos = (detail.files?.length ?? 0) > 0;
  const customerText = detail.messages
    .filter((m) => m.sender === "customer")
    .map((m) => m.body)
    .join(" ")
    .toLowerCase();
  const blob = `${itemType} ${description} ${customerText} ${detail.form_name} ${fieldValue(data, "subject")}`.toLowerCase();
  const itemPhrase = itemPhraseFrom(detail);
  const waDigits = (whatsapp || "").replace(/\D/g, "");
  const waLink = waDigits ? `https://wa.me/${waDigits}` : "WhatsApp";
  const replies: SuggestedReply[] = [];

  if (/do you (purchase|buy)|do you take|would you buy|are you buying/.test(blob)) {
    replies.push({
      id: "yes-we-buy",
      label: "Yes, we buy these",
      body: `yes we buy ${itemPhrase.replace(/^your /, "")}. You are welcome to send photos for a free valuation, or visit us when you are in London.`,
    });
  }

  if (/travel|travelling|traveling|coming to london|visit london|from ireland|ireland|in london soon/.test(blob)) {
    replies.push({
      id: "coming-to-london",
      label: "Coming to London",
      body: `when you are in London you can visit our Hatton Garden showroom for a same-day valuation of ${itemPhrase} — no appointment is essential, but booking a time helps us prepare.`,
    });
  }

  replies.push({
    id: "received",
    label: "We've received this",
    body: `thank you for your enquiry about ${itemPhrase}. We have received it and our team is reviewing the details.`,
  });

  if (!hasPhotos) {
    replies.push({
      id: "more-details",
      label: "Need photos & details",
      body: `to give you an accurate valuation of ${itemPhrase}, please send photos (front, back and hallmarks), approximate weight, and carat if known.`,
    });
  } else if (description.length < 40 || /photo|picture|image|clearer|blur/i.test(blob)) {
    replies.push({
      id: "more-details",
      label: "Need clearer photos",
      body: `please send a few clearer photos of ${itemPhrase} — front, back and hallmarks — plus approximate weight and any certificates.`,
    });
  } else {
    replies.push({
      id: "more-details",
      label: "Need more details",
      body: `could you also confirm the approximate weight of ${itemPhrase}, carat if known, and whether you have any certificates?`,
    });
  }

  replies.push({
    id: "whatsapp",
    label: preferred.includes("whatsapp") ? "Continue on WhatsApp" : "Send to WhatsApp",
    body: `please send all photos and details for ${itemPhrase} to our WhatsApp and we will get back to you quickly: ${waLink}`,
  });

  if (!replies.some((r) => r.id === "coming-to-london")) {
    if (/visit|appointment|hatton|come in|in person|showroom/.test(blob)) {
      replies.push({
        id: "visit",
        label: "Book a visit",
        body: `we would be happy to value ${itemPhrase} in person at our Hatton Garden showroom. Please book a time that suits you — no obligation.`,
      });
    } else {
      replies.push({
        id: "visit",
        label: "Visit Hatton Garden",
        body: `if you prefer, you can bring ${itemPhrase} to our Hatton Garden showroom for a same-day valuation. No obligation.`,
      });
    }
  }

  replies.push({
    id: "offer-soon",
    label: "We'll send an offer",
    body: `our valuers will look at ${itemPhrase} and send you an offer as soon as we have the photos and details.`,
  });

  if (/gold|scrap|chain|ring|bangle|hallmark/.test(blob) || itemType.toLowerCase().includes("gold")) {
    replies.push({
      id: "hallmark",
      label: "Ask hallmark / weight",
      body: `could you confirm the carat (9ct, 18ct, 22ct) and approximate weight in grams? A close-up of any hallmark would also help.`,
    });
  }

  if (/diamond|sapphire|ruby|emerald|gem|stone|gia/.test(blob) || /diamond|gem/.test(itemType.toLowerCase())) {
    replies.push({
      id: "certificate",
      label: "Ask for certificate",
      body: `if you have a GIA or other diamond certificate, please send a photo of it. If not, extra close-ups of the stones will help us assess them.`,
    });
  }

  if (/watch|rolex|omega|cartier/.test(blob) || itemType.toLowerCase().includes("watch")) {
    replies.push({
      id: "watch-papers",
      label: "Ask box & papers",
      body: `please let us know the watch brand and model, and whether you have the original box and papers. Photos of the dial, case back and clasp would be useful.`,
    });
  }

  if (preferred.includes("phone") || preferred.includes("call")) {
    replies.push({
      id: "call",
      label: "We'll call you",
      body: `we will give you a call shortly to go through ${itemPhrase}. If another time is better, just reply with a convenient slot.`,
    });
  }

  return replies;
}

function combineSuggestedTexts(presets: SuggestedReply[], selectedIds: string[], greeting: string) {
  const selected = presets.filter((preset) => selectedIds.includes(preset.id));
  if (!selected.length) return "";

  const sentences = selected.map((preset, index) => {
    const body = preset.body.trim().replace(/\s+/g, " ");
    if (index === 0) return body.charAt(0).toLowerCase() + body.slice(1);
    return body.charAt(0).toUpperCase() + body.slice(1);
  });

  return `${greeting}${sentences.join(" ")}`;
}

function useKeyboardInset() {
  const [inset, setInset] = useState(0);

  useEffect(() => {
    const viewport = window.visualViewport;
    if (!viewport) return;

    const update = () => {
      const gap = Math.max(0, window.innerHeight - viewport.height - viewport.offsetTop);
      setInset(gap > 40 ? gap : 0);
    };

    viewport.addEventListener("resize", update);
    viewport.addEventListener("scroll", update);
    update();
    return () => {
      viewport.removeEventListener("resize", update);
      viewport.removeEventListener("scroll", update);
    };
  }, []);

  return inset;
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

function shouldHideAttachmentLabel(msg: ChatMessage): boolean {
  if (!msg.attachments?.length) return false;
  const body = (msg.body || "").trim().toLowerCase();
  return body === "" || body === "photo" || body === "pdf" || body === "photo and pdf" || body === "attachment";
}

function ReceiptTicks({ status }: { status?: ChatMessage["delivery_status"] }) {
  const read = status === "chat_opened";
  const delivered = status === "email_opened" || read;
  const label = read ? "Read" : delivered ? "Delivered" : "Sent";
  const Icon = delivered || read ? CheckCheck : Check;

  return (
    <span
      title={label}
      aria-label={label}
      className={`inline-flex ${read ? "text-[#53bdeb]" : "text-[#667781]"}`}
    >
      <Icon className="w-3.5 h-3.5" strokeWidth={2.4} />
    </span>
  );
}

function ChatBubble({ msg }: { msg: ChatMessage }) {
  const isAdmin = msg.sender === "admin";

  return (
    <div className={`flex ${isAdmin ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[88%] sm:max-w-[75%] rounded-2xl px-3.5 py-2 shadow-sm ${
          isAdmin ? "bg-[#d9fdd3] text-[#111b21] rounded-br-sm" : "bg-white text-[#111b21] rounded-bl-sm"
        }`}
      >
        <p className="text-[10px] font-semibold text-[#008069] mb-0.5">
          {isAdmin ? (msg.admin_name || "You") : "Customer"}
        </p>
        {msg.body && !shouldHideAttachmentLabel(msg) ? (
          <p className="text-[15px] whitespace-pre-wrap break-words leading-relaxed">{msg.body}</p>
        ) : null}
        <ChatMedia attachments={msg.attachments} />
        <div className={`mt-1 flex items-center gap-1.5 text-[10px] text-[#667781] ${isAdmin ? "justify-end" : ""}`}>
          <span>{msg.created_at_human}</span>
          {isAdmin ? <ReceiptTicks status={msg.delivery_status} /> : null}
        </div>
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
  const [selectedReplyIds, setSelectedReplyIds] = useState<string[]>([]);
  const [sending, setSending] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [showSuggested, setShowSuggested] = useState(false);
  const [composerFocused, setComposerFocused] = useState(false);
  const [pendingFiles, setPendingFiles] = useState<{ file: File; url: string }[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const settings = useSettings();
  const keyboardInset = useKeyboardInset();
  const chatEndRef = useRef<HTMLDivElement>(null);
  const replyRef = useRef<HTMLTextAreaElement>(null);
  const onReadRef = useRef(onRead);
  const onNewCustomerMessageRef = useRef(onNewCustomerMessage);
  const messageIdsRef = useRef<string>("");
  const typingTimer = useRef<number | null>(null);
  const lastTypingPing = useRef(0);
  onReadRef.current = onRead;
  onNewCustomerMessageRef.current = onNewCustomerMessage;

  const pingTyping = useCallback((typing: boolean) => {
    fetch(`${API_URL}/admin/submissions/${submissionId}/typing`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ typing }),
    }).catch(() => {});
  }, [submissionId]);

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
    setReply("");
    setSelectedReplyIds([]);
    setPendingFiles((current) => {
      current.forEach((item) => URL.revokeObjectURL(item.url));
      return [];
    });
    messageIdsRef.current = "";
    loadDetail({ markRead: true });

    const interval = setInterval(() => {
      loadDetail({ markRead: false, silent: true });
    }, 2000);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [submissionId]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [detail?.messages, detail?.customer_typing]);

  useEffect(() => {
    return () => {
      if (typingTimer.current) window.clearTimeout(typingTimer.current);
      pingTyping(false);
    };
  }, [pingTyping]);

  function addPendingFiles(list: FileList | null) {
    if (!list) return;
    const next = Array.from(list).filter((file) => {
      const okType = file.type.startsWith("image/") || file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
      const okSize = file.size <= 10 * 1024 * 1024;
      if (!okType) showToast("Use a photo or PDF", "error");
      else if (!okSize) showToast("Each file must be under 10MB", "error");
      return okType && okSize;
    });
    setPendingFiles((current) => {
      const room = Math.max(0, 5 - current.length);
      return [
        ...current,
        ...next.slice(0, room).map((file) => ({ file, url: URL.createObjectURL(file) })),
      ];
    });
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function removePendingFile(index: number) {
    setPendingFiles((current) => {
      const copy = [...current];
      const [removed] = copy.splice(index, 1);
      if (removed) URL.revokeObjectURL(removed.url);
      return copy;
    });
  }

  async function sendReply(e: React.FormEvent) {
    e.preventDefault();
    if ((!reply.trim() && pendingFiles.length === 0) || sending) return;
    setSending(true);
    try {
      const formData = new FormData();
      if (reply.trim()) formData.append("message", reply.trim());
      pendingFiles.forEach((item) => formData.append("files[]", item.file));
      const res = await fetch(`${API_URL}/admin/submissions/${submissionId}/messages`, {
        method: "POST",
        headers: getAuthHeaders(false),
        body: formData,
      });
      if (!res.ok) throw new Error();
      setReply("");
      setSelectedReplyIds([]);
      setPendingFiles((current) => {
        current.forEach((item) => URL.revokeObjectURL(item.url));
        return [];
      });
      pingTyping(false);
      await loadDetail({ markRead: false });
      showToast("Reply sent to customer email", "success");
    } catch {
      showToast("Failed to send reply", "error");
    } finally {
      setSending(false);
    }
  }

  const fields = detail ? formatFields(detail.data || {}) : [];
  const presets = detail ? buildSuggestedReplies(detail, settings.whatsapp) : [];
  const greeting = detail
    ? greetingFor(firstName(fieldValue(detail.data || {}, "name", "full_name")))
    : "Hi, ";

  function resizeComposer() {
    const el = replyRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(Math.max(el.scrollHeight, 52), 140)}px`;
  }

  function toggleSuggestedReply(id: string) {
    const nextIds = selectedReplyIds.includes(id)
      ? selectedReplyIds.filter((item) => item !== id)
      : [...selectedReplyIds, id];
    setSelectedReplyIds(nextIds);
    setReply(combineSuggestedTexts(presets, nextIds, greeting));
    setShowSuggested(false);
    requestAnimationFrame(() => {
      resizeComposer();
      replyRef.current?.focus();
    });
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!detail) return null;

  const appChat = Boolean(onClose);
  const photoCount = detail.files?.length ?? 0;
  const itemPreview = fieldValue(detail.data || {}, "item_type", "description", "message", "subject");
  const hideExtras = composerFocused || keyboardInset > 40;

  const customerTyping = Boolean(detail.customer_typing);

  return (
    <div className="relative flex flex-col h-full min-h-0 bg-[#efeae2]">
      <div className={`flex items-center gap-2 px-2 sm:px-4 py-2.5 border-b border-black/5 shrink-0 bg-[#008069] text-white ${appChat ? "safe-top" : ""}`}>
        {onClose && (
          <button type="button" onClick={onClose} className="min-h-12 min-w-12 flex items-center justify-center text-white/90 hover:text-white shrink-0" aria-label="Back to enquiries">
            <ArrowLeft className="w-5 h-5" />
          </button>
        )}
        <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold shrink-0 bg-white text-[#008069]">
          {(fieldValue(detail.data || {}, "name", "full_name") || "C").charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-base font-semibold truncate text-white">
            {fieldValue(detail.data || {}, "name", "full_name") || detail.form_name}
          </h3>
          <p className="text-xs truncate text-white/85">
            {customerTyping ? "typing..." : detail.form_name}
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setShowDetails(true);
            setShowSuggested(false);
          }}
          className="shrink-0 min-h-11 px-3 rounded-full text-sm font-semibold bg-white/15 text-white"
        >
          Details
        </button>
      </div>

      {!hideExtras && photoCount > 0 && (
        <div className="shrink-0 flex gap-2 overflow-x-auto px-3 py-2 bg-[#f0f2f5] border-b border-black/5">
          {detail.files!.slice(0, 6).map((file) => (
            <a key={file.id} href={file.url} target="_blank" rel="noopener noreferrer" className="shrink-0">
              {file.is_image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={file.url} alt={file.original_name} className="w-16 h-16 rounded-xl object-cover bg-gray-100" />
              ) : (
                <span className="w-16 h-16 rounded-xl bg-gray-100 flex items-center justify-center text-[10px] text-gray-500 p-1">{file.original_name}</span>
              )}
            </a>
          ))}
        </div>
      )}

      <div className="flex-1 overflow-y-auto min-h-0 chat-wallpaper">
        {!hideExtras && itemPreview && (
          <p className="px-4 py-2 text-xs text-black/60 line-clamp-2">{itemPreview}</p>
        )}
        <div className="p-3 sm:p-4 space-y-3">
          {!compact && !appChat && (
            <p className="text-xs font-semibold text-gray-500 uppercase flex items-center gap-1.5">
              <MessageSquare className="w-4 h-4" /> Conversation
            </p>
          )}
          {detail.messages.length === 0 && (
            <p className="text-sm text-black/50 text-center py-10 px-6">
              No messages yet. Write below — they get an email and can reply in this chat.
            </p>
          )}
          {detail.messages.map((msg) => (
            <ChatBubble key={msg.id} msg={msg} />
          ))}
          {customerTyping && (
            <div className="flex justify-start">
              <div className="bg-white rounded-2xl rounded-bl-sm px-3 py-2.5 shadow-sm">
                <span className="wa-typing" aria-label="Customer is typing">
                  <i /><i /><i />
                </span>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>
      </div>

      <form
        onSubmit={sendReply}
        className="border-t border-black/5 shrink-0 bg-[#f0f2f5]"
        style={{ paddingBottom: keyboardInset > 0 ? keyboardInset + 8 : undefined }}
      >
        {!hideExtras && (
          <div className="px-3 pt-2">
            <button
              type="button"
              onClick={() => setShowSuggested((v) => !v)}
              className="min-h-10 px-3 rounded-full text-sm font-semibold bg-white text-[#111b21] border border-black/10"
            >
              {showSuggested ? "Hide quick replies" : "Quick replies"}
            </button>
          </div>
        )}
        {showSuggested && !hideExtras && (
          <div className="flex gap-2 overflow-x-auto px-3 py-2">
            {presets.map((preset) => {
              const selected = selectedReplyIds.includes(preset.id);
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => toggleSuggestedReply(preset.id)}
                  className={`shrink-0 min-h-11 px-4 rounded-full text-sm font-semibold whitespace-nowrap ${
                    selected
                      ? "bg-[#D97706] text-black"
                      : "bg-white text-black border border-gray-200"
                  }`}
                >
                  {preset.label}
                </button>
              );
            })}
          </div>
        )}
        {pendingFiles.length > 0 && (
          <div className="px-3 pt-2">
            <PendingChatFiles
              files={pendingFiles.map((item) => ({
                name: item.file.name,
                url: item.url,
                isImage: item.file.type.startsWith("image/"),
              }))}
              onRemove={removePendingFile}
            />
          </div>
        )}
        <div className="flex gap-2 items-end px-3 py-2.5">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,.pdf,application/pdf"
            multiple
            className="sr-only"
            onChange={(e) => addPendingFiles(e.target.files)}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="h-[52px] w-[52px] flex items-center justify-center bg-white text-[#111b21] rounded-full shrink-0 border border-black/10"
            aria-label="Attach photo or PDF"
          >
            <Paperclip className="w-5 h-5" />
          </button>
          <label className="sr-only" htmlFor={`reply-${submissionId}`}>Message</label>
          <textarea
            id={`reply-${submissionId}`}
            ref={replyRef}
            value={reply}
            onFocus={() => {
              setComposerFocused(true);
              setShowSuggested(false);
              setShowDetails(false);
            }}
            onBlur={() => setComposerFocused(false)}
            onChange={(e) => {
              const value = e.target.value;
              setReply(value);
              if (value !== combineSuggestedTexts(presets, selectedReplyIds, greeting)) {
                setSelectedReplyIds([]);
              }
              resizeComposer();
              const now = Date.now();
              if (value.trim() && now - lastTypingPing.current > 1500) {
                lastTypingPing.current = now;
                pingTyping(true);
              }
              if (typingTimer.current) window.clearTimeout(typingTimer.current);
              typingTimer.current = window.setTimeout(() => pingTyping(false), 2500);
            }}
            placeholder="Type a message"
            rows={2}
            className="flex-1 rounded-3xl px-4 py-3 text-[16px] leading-6 text-[#111b21] bg-white border-0 shadow-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#008069]/30 min-h-[52px] max-h-[140px]"
          />
          <button
            type="submit"
            disabled={sending || (!reply.trim() && pendingFiles.length === 0)}
            className="h-[52px] w-[52px] flex items-center justify-center bg-[#008069] text-white rounded-full disabled:opacity-40 shrink-0"
            aria-label="Send message"
          >
            {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          </button>
        </div>
      </form>

      {showDetails && (
        <div className="absolute inset-0 z-20 bg-white flex flex-col">
          <div className="flex items-center justify-between px-4 py-3 border-b safe-top">
            <p className="font-semibold text-black">Enquiry details</p>
            <button
              type="button"
              onClick={() => setShowDetails(false)}
              className="min-h-11 px-4 rounded-full bg-black text-white text-sm font-semibold"
            >
              Back to chat
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {detail.booking && (
              <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5">
                <p className="text-xs font-semibold text-amber-800 inline-flex items-center gap-1.5">
                  <CalendarDays className="w-3.5 h-3.5" /> Linked appointment
                </p>
                <p className="text-sm text-black mt-1">
                  {[detail.booking.service_type, detail.booking.booking_date, detail.booking.booking_time]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
              </div>
            )}
            <div className="grid grid-cols-1 gap-2">
              {fields.map(([key, value]) => (
                <div key={key} className="bg-gray-50 rounded-xl px-4 py-3">
                  <p className="text-xs font-semibold text-gray-500 mb-1">{key.replace(/_/g, " ")}</p>
                  <p className="text-base text-black break-words leading-relaxed">{String(value)}</p>
                </div>
              ))}
            </div>
            {detail.files && detail.files.length > 0 && (
              <div>
                <p className="text-sm font-semibold text-black mb-2">Photos</p>
                <div className="grid grid-cols-2 gap-2">
                  {detail.files.map((file) => (
                    <a key={file.id} href={file.url} target="_blank" rel="noopener noreferrer" className="block rounded-xl overflow-hidden border">
                      {file.is_image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={file.url} alt={file.original_name} className="w-full h-36 object-cover bg-gray-100" />
                      ) : (
                        <div className="h-36 flex items-center justify-center text-xs text-gray-500 p-2 text-center">{file.original_name}</div>
                      )}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
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
      <div className="relative bg-white sm:rounded-2xl shadow-xl w-full sm:max-w-3xl h-dvh sm:h-auto sm:max-h-[90vh] flex flex-col overflow-hidden">
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
