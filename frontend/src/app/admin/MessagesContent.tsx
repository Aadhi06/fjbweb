"use client";

import { useCallback, useEffect, useState } from "react";
import { ArrowLeft, Loader2, MessageSquare, RefreshCw } from "lucide-react";
import { getAuthHeaders, SubmissionChatPanel } from "./SubmissionChatPanel";

const API_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8002") + "/api";

type ConversationItem = {
  id: number;
  form_name: string;
  customer_name: string;
  customer_email?: string | null;
  status: string;
  unread: boolean;
  last_message?: {
    sender: string;
    body: string;
    created_at_human: string;
  } | null;
  message_count: number;
  created_at_human: string;
};

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
  }, [fetchMessages]);

  useEffect(() => {
    if (initialSelectedId) setSelectedId(initialSelectedId);
  }, [initialSelectedId]);

  function handleRead() {
    onUnreadChange?.();
    fetchMessages();
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
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-black mb-1">Messages</h2>
          <p className="text-sm text-gray-500">Chat with customers who replied to enquiries</p>
        </div>
        <button
          onClick={() => { setLoading(true); fetchMessages(); onUnreadChange?.(); }}
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-black"
        >
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {conversations.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No conversations yet. Messages appear when you or a customer reply to an enquiry.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden h-[calc(100dvh-10rem)] sm:h-[calc(100vh-12rem)] min-h-[420px] flex">
          {/* Conversation list */}
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
                      <p className="text-xs text-gray-500 truncate">{c.form_name}</p>
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

          {/* Chat panel */}
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
                  compact
                />
              </>
            ) : (
              <div className="hidden md:flex flex-1 items-center justify-center text-gray-400 text-sm p-8 text-center">
                <div>
                  <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  Select a conversation to view and reply
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
