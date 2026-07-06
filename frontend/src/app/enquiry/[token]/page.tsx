"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, MessageSquare, Send } from "lucide-react";
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

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!token || !reply.trim() || sending) return;
    setSending(true);
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
    } catch {
      setError("Failed to send message. Please try again.");
    } finally {
      setSending(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface px-4">
        <div className="text-center max-w-md">
          <p className="text-red-600 mb-4">{error}</p>
          <Link href="/" className="text-amber-700 font-medium hover:underline">Back to home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface">
      <section className="bg-black py-12">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <MessageSquare className="w-10 h-10 text-gold mx-auto mb-3" />
          <h1 className="text-2xl font-serif font-bold text-white">{formName}</h1>
          <p className="text-white/70 mt-2">Hi {customerName} — message our team below</p>
        </div>
      </section>

      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl border border-border shadow-sm min-h-[400px] flex flex-col">
          <div className="flex-1 p-5 space-y-3 overflow-y-auto max-h-[50vh]">
            {messages.length === 0 && (
              <p className="text-center text-muted-foreground text-sm py-8">No messages yet. Send us a message below.</p>
            )}
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.sender === "customer" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 ${
                    msg.sender === "customer"
                      ? "bg-gold text-black rounded-br-md"
                      : "bg-gray-100 text-black rounded-bl-md"
                  }`}
                >
                  <p className="text-[10px] font-semibold opacity-70 mb-1">
                    {msg.sender === "customer" ? "You" : (msg.admin_name || "Fine Jewellery Buyers")}
                  </p>
                  <p className="text-sm whitespace-pre-wrap">{msg.body}</p>
                  <p className="text-[10px] opacity-60 mt-1">{msg.created_at_human}</p>
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          <form onSubmit={handleSend} className="border-t border-border p-4">
            <div className="flex gap-2">
              <textarea
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                placeholder="Type your message..."
                rows={2}
                className="flex-1 border border-border rounded-xl px-4 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-gold/30"
              />
              <button
                type="submit"
                disabled={sending || !reply.trim()}
                className="px-4 bg-black text-white rounded-xl hover:bg-black/80 disabled:opacity-50 self-end"
              >
                {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
              </button>
            </div>
          </form>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          <Link href="/" className="hover:underline">finejewellerybuyers.co.uk</Link>
        </p>
      </div>
    </div>
  );
}
