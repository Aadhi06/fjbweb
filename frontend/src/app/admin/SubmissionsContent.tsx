"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Loader2, MessageSquare, RefreshCw, Send, X } from "lucide-react";

const API_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8002") + "/api";

function getAuthHeaders(): Record<string, string> {
  const token = typeof window !== "undefined" ? localStorage.getItem("admin_token") : null;
  return {
    Accept: "application/json",
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

type SubmissionFile = {
  id: number;
  original_name: string;
  url: string;
  is_image: boolean;
};

type ChatMessage = {
  id: number;
  sender: "admin" | "customer";
  body: string;
  admin_name?: string | null;
  created_at_human: string;
};

type SubmissionListItem = {
  id: number;
  form_name: string;
  form_slug?: string;
  data: Record<string, string>;
  files?: SubmissionFile[];
  status: string;
  created_at_human: string;
};

type SubmissionDetail = SubmissionListItem & {
  messages: ChatMessage[];
  conversation_url?: string;
  customer_email?: string | null;
  ip_address?: string;
};

const SUMMARY_FIELD_ORDER = ["gold_items", "estimated_total", "items_count", "expected_price", "name", "email", "phone"];

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

function SubmissionChatModal({
  submissionId,
  onClose,
  showToast,
}: {
  submissionId: number;
  onClose: () => void;
  showToast: (msg: string, type: "success" | "error") => void;
}) {
  const [detail, setDetail] = useState<SubmissionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const loadDetail = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/admin/submissions/${submissionId}`, { headers: getAuthHeaders() });
      if (!res.ok) throw new Error();
      const json = await res.json();
      setDetail(json.data);
    } catch {
      showToast("Failed to load enquiry", "error");
      onClose();
    } finally {
      setLoading(false);
    }
  }, [submissionId, onClose, showToast]);

  useEffect(() => {
    loadDetail();
  }, [loadDetail]);

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
      await loadDetail();
      showToast("Reply sent to customer email", "success");
    } catch {
      showToast("Failed to send reply", "error");
    } finally {
      setSending(false);
    }
  }

  const fields = detail ? formatFields(detail.data || {}) : [];

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-gray-200 shrink-0">
          <div>
            <h3 className="text-lg font-semibold text-black">{detail?.form_name || "Enquiry"}</h3>
            <p className="text-sm text-gray-500">
              {detail?.created_at_human}
              {detail?.customer_email && ` · ${detail.customer_email}`}
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-black">
            <X className="w-5 h-5" />
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
          </div>
        ) : detail ? (
          <>
            <div className="flex-1 overflow-y-auto p-5 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                          <img src={file.url} alt={file.original_name} className="w-full h-28 object-cover bg-gray-100" />
                        ) : (
                          <div className="h-28 flex items-center justify-center text-xs text-gray-500 p-2 text-center">{file.original_name}</div>
                        )}
                      </a>
                    ))}
                  </div>
                </div>
              )}

              <div className="border-t border-gray-100 pt-4">
                <p className="text-xs font-semibold text-gray-500 uppercase mb-3 flex items-center gap-1.5">
                  <MessageSquare className="w-4 h-4" /> Conversation
                </p>
                <div className="space-y-3 min-h-[120px]">
                  {detail.messages.length === 0 && (
                    <p className="text-sm text-gray-400 text-center py-6">No messages yet. Type below to email the customer.</p>
                  )}
                  {detail.messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.sender === "admin" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[85%] rounded-2xl px-4 py-2.5 ${
                          msg.sender === "admin"
                            ? "bg-black text-white rounded-br-md"
                            : "bg-gray-100 text-black rounded-bl-md"
                        }`}
                      >
                        <p className="text-[10px] font-semibold opacity-70 mb-1">
                          {msg.sender === "admin" ? (msg.admin_name || "You") : "Customer"}
                        </p>
                        <p className="text-sm whitespace-pre-wrap">{msg.body}</p>
                        <p className="text-[10px] opacity-60 mt-1">{msg.created_at_human}</p>
                      </div>
                    </div>
                  ))}
                  <div ref={chatEndRef} />
                </div>
              </div>
            </div>

            <form onSubmit={sendReply} className="border-t border-gray-200 p-4 bg-gray-50 shrink-0">
              <p className="text-xs text-gray-500 mb-2">Reply goes to customer email + their message page</p>
              <div className="flex gap-2">
                <textarea
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  placeholder="Type your reply..."
                  rows={2}
                  className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-amber-500/30"
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
          </>
        ) : null}
      </div>
    </div>
  );
}

export function SubmissionsContent({
  showToast,
}: {
  showToast: (msg: string, type: "success" | "error") => void;
}) {
  const [submissions, setSubmissions] = useState<SubmissionListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const fetchSubmissions = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/admin/submissions`, { headers: getAuthHeaders() });
      const data = await res.json();
      setSubmissions(data.data || []);
    } catch {
      showToast("Failed to load submissions", "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchSubmissions();
  }, [fetchSubmissions]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-black mb-1">Form Submissions</h2>
          <p className="text-gray-500">View enquiries, photos, and chat with customers by email</p>
        </div>
        <button onClick={() => { setLoading(true); fetchSubmissions(); }} className="flex items-center gap-2 text-sm text-gray-600 hover:text-black">
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {selectedId && (
        <SubmissionChatModal
          submissionId={selectedId}
          onClose={() => { setSelectedId(null); fetchSubmissions(); }}
          showToast={showToast}
        />
      )}

      {submissions.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-500">No submissions yet</div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50/50">
                <th className="text-left px-4 py-3 font-semibold text-gray-600">#</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Form</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Customer</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Status</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Date</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {submissions.map((s) => {
                const name = s.data?.name || s.data?.full_name || "";
                const email = s.data?.email || "";
                const hasPhotos = (s.files?.length || 0) > 0;
                return (
                  <tr key={s.id} className="border-b border-gray-100 hover:bg-gray-50/50">
                    <td className="px-4 py-3 text-gray-500">{s.id}</td>
                    <td className="px-4 py-3 font-medium">{s.form_name}</td>
                    <td className="px-4 py-3 text-gray-600">
                      {name && <div>{name}</div>}
                      <div className="text-xs">{email}</div>
                      {hasPhotos && <span className="text-xs text-amber-600">📷 {s.files!.length} photo(s)</span>}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${
                        s.status === "new" ? "bg-amber-50 text-amber-700" :
                        s.status === "replied" ? "bg-green-50 text-green-700" : "bg-gray-50 text-gray-600"
                      }`}>{s.status}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{s.created_at_human}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => setSelectedId(s.id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-black text-white rounded-lg hover:bg-black/80"
                      >
                        <MessageSquare className="w-3.5 h-3.5" /> Chat
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
