"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Loader2, MessageSquare, Send } from "lucide-react";
import Link from "next/link";

const API_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8002") + "/api";

type ChatMessage = {
  id: number;
  sender: "admin" | "customer";
  body: string;
  admin_name?: string | null;
  created_at_human: string;
};

export default function EnquiryPage({ params }: { params: Promise<{ token: string }> }) {
  const [token, setToken] = useState<string | null>(null);
  const [formName, setFormName] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [reply, setReply] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    params.then((p) => setToken(p.token));
  }, [params]);

  useEffect(() => {
    if (!token) return;
    async function load() {
      try {
        const res = await fetch(`${API_URL}/enquiry/${token}`);
        if (!res.ok) throw new Error();
        const json = await res.json();
        setFormName(json.data.form_name);
        setCustomerName(json.data.customer_name);
        setMessages(json.data.messages || []);
      } catch {
        setError("This enquiry link is invalid or has expired.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [token]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend(e?: React.FormEvent) {
    e?.preventDefault();
    if (!token || !reply.trim() || sending) return;
    setSending(true);
    setError("");
    try {
      const res = await fetch(`${API_URL}/enquiry/${token}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ message: reply.trim() }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Failed");
      setMessages(json.data.messages || []);
      setReply("");
      textareaRef.current?.focus();
    } catch {
      setError("Failed to send message. Please try again.");
    } finally {
      setSending(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-surface">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (error && messages.length === 0 && !formName) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-surface px-4">
        <div className="text-center max-w-md">
          <p className="text-red-600 mb-4">{error}</p>
          <Link href="/" className="text-amber-700 font-medium hover:underline">Back to home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[100dvh] flex flex-col bg-surface overflow-hidden">
      {/* Header */}
      <header className="bg-black shrink-0 safe-top">
        <div className="max-w-2xl mx-auto px-4 py-3 sm:py-4 flex items-center gap-3">
          <Link href="/" className="p-2 -ml-2 text-white/70 hover:text-white sm:hidden" aria-label="Back">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gold/20 flex items-center justify-center shrink-0">
            <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5 text-gold" />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-base sm:text-lg font-serif font-bold text-white truncate">{formName}</h1>
            <p className="text-xs sm:text-sm text-white/60 truncate">Hi {customerName}</p>
          </div>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto overscroll-contain px-3 sm:px-4 py-4 max-w-2xl mx-auto w-full">
        <div className="space-y-3 min-h-full flex flex-col justify-end">
          {messages.length === 0 && (
            <p className="text-center text-muted-foreground text-sm py-12">No messages yet. Send us a message below.</p>
          )}
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.sender === "customer" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[88%] rounded-2xl px-3.5 py-2.5 sm:px-4 ${
                  msg.sender === "customer"
                    ? "bg-gold text-black rounded-br-md"
                    : "bg-white text-black border border-border rounded-bl-md shadow-sm"
                }`}
              >
                <p className="text-[10px] font-semibold opacity-70 mb-1">
                  {msg.sender === "customer" ? "You" : (msg.admin_name || "Fine Jewellery Buyers")}
                </p>
                <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">{msg.body}</p>
                <p className="text-[10px] opacity-60 mt-1">{msg.created_at_human}</p>
              </div>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="shrink-0 border-t border-border bg-white safe-bottom">
        <form onSubmit={handleSend} className="max-w-2xl mx-auto px-3 sm:px-4 py-3">
          {error && <p className="text-xs text-red-600 mb-2">{error}</p>}
          <div className="flex gap-2 items-end">
            <textarea
              ref={textareaRef}
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Type your message..."
              rows={1}
              className="flex-1 border border-border rounded-2xl px-4 py-3 text-base sm:text-sm resize-none focus:outline-none focus:ring-2 focus:ring-gold/30 min-h-[44px] max-h-32"
              style={{ fontSize: "16px" }}
            />
            <button
              type="submit"
              disabled={sending || !reply.trim()}
              className="h-11 w-11 flex items-center justify-center bg-black text-white rounded-full hover:bg-black/80 disabled:opacity-40 shrink-0 transition-opacity"
              aria-label="Send message"
            >
              {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
            </button>
          </div>
          <p className="text-center text-[10px] text-muted-foreground mt-2 hidden sm:block">
            Press Enter to send · Shift+Enter for new line
          </p>
        </form>
      </div>
    </div>
  );
}
