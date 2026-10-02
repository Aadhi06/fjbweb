"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Loader2, MessageSquare, RefreshCw, Search } from "lucide-react";
import { getAuthHeaders, SubmissionChatModal } from "./SubmissionChatPanel";

const API_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8002") + "/api";
const PER_PAGE = 20;

type SubmissionListItem = {
  id: number;
  form_name: string;
  form_slug?: string;
  data: Record<string, string>;
  files?: { id: number; original_name: string; url: string; is_image: boolean }[];
  status: string;
  created_at_human: string;
};

type PaginationMeta = {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number | null;
  to: number | null;
};

function customerName(data: Record<string, string>) {
  return data?.name || data?.full_name || data?.first_name || "Customer";
}

function customerEmail(data: Record<string, string>) {
  return data?.email || "";
}

export function SubmissionsContent({
  showToast,
  onUnreadChange,
}: {
  showToast: (msg: string, type: "success" | "error") => void;
  onUnreadChange?: () => void;
}) {
  const [submissions, setSubmissions] = useState<SubmissionListItem[]>([]);
  const [meta, setMeta] = useState<PaginationMeta>({
    current_page: 1,
    last_page: 1,
    per_page: PER_PAGE,
    total: 0,
    from: null,
    to: null,
  });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [query, setQuery] = useState("");

  const fetchSubmissions = useCallback(async (pageNum: number) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/admin/submissions?page=${pageNum}&per_page=${PER_PAGE}`, {
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      setSubmissions(data.data || []);
      setMeta({
        current_page: data.current_page ?? pageNum,
        last_page: data.last_page ?? 1,
        per_page: data.per_page ?? PER_PAGE,
        total: data.total ?? (data.data?.length || 0),
        from: data.from ?? null,
        to: data.to ?? null,
      });
      setPage(data.current_page ?? pageNum);
    } catch {
      showToast("Failed to load submissions", "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchSubmissions(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  function goToPage(next: number) {
    if (next < 1 || next > meta.last_page || next === page) return;
    setPage(next);
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return submissions;
    return submissions.filter((s) => {
      const name = customerName(s.data).toLowerCase();
      const email = customerEmail(s.data).toLowerCase();
      return name.includes(q) || email.includes(q) || s.form_name.toLowerCase().includes(q);
    });
  }, [submissions, query]);

  const pageNumbers = (() => {
    const last = meta.last_page;
    const current = meta.current_page;
    if (last <= 7) return Array.from({ length: last }, (_, i) => i + 1);
    const pages = new Set<number>([1, last, current, current - 1, current + 1]);
    return Array.from(pages)
      .filter((n) => n >= 1 && n <= last)
      .sort((a, b) => a - b);
  })();

  function statusClass(status: string) {
    if (status === "new") return "bg-amber-50 text-amber-700";
    if (status === "replied") return "bg-green-50 text-green-700";
    return "bg-gray-50 text-gray-600";
  }

  return (
    <div>
      <div className="hidden sm:flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-black mb-1">Enquiries</h2>
          <p className="text-gray-500">
            Open a chat like WhatsApp — photos, replies and the same thread
            {meta.total > 0 ? ` · ${meta.total} total` : ""}
          </p>
        </div>
        <button
          type="button"
          onClick={() => fetchSubmissions(page)}
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-black min-h-11"
        >
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      <div className="px-3 sm:px-0 mb-3 flex items-center gap-2">
        <label className="sr-only" htmlFor="enquiry-search">Search enquiries</label>
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            id="enquiry-search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name, email or form"
            className="w-full min-h-11 rounded-full border border-gray-200 bg-white pl-10 pr-4 text-base sm:text-sm"
          />
        </div>
        <button
          type="button"
          onClick={() => fetchSubmissions(page)}
          className="sm:hidden min-h-11 min-w-11 rounded-full border border-gray-200 bg-white text-gray-600"
          aria-label="Refresh enquiries"
        >
          <RefreshCw className="w-4 h-4 mx-auto" />
        </button>
      </div>

      {selectedId && (
        <SubmissionChatModal
          submissionId={selectedId}
          onClose={() => {
            setSelectedId(null);
            fetchSubmissions(page);
            onUnreadChange?.();
          }}
          showToast={showToast}
          onRead={onUnreadChange}
        />
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-500 mx-3 sm:mx-0">
          No enquiries yet
        </div>
      ) : (
        <>
          <div className="md:hidden bg-white border-y border-gray-100">
            {filtered.map((s) => {
              const name = customerName(s.data);
              const email = customerEmail(s.data);
              const photos = s.files?.length || 0;
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setSelectedId(s.id)}
                  className="w-full flex items-center gap-3 px-3 py-3 border-b border-gray-100 text-left active:bg-gray-50"
                >
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold shrink-0 ${s.status === "new" ? "bg-[#D97706]" : "bg-black"}`}>
                    {name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-semibold text-[15px] text-black truncate">{name}</p>
                      <span className="text-[11px] text-gray-400 shrink-0">{s.created_at_human}</span>
                    </div>
                    <p className="text-xs text-gray-500 truncate">{s.form_name}{email ? ` · ${email}` : ""}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full capitalize ${statusClass(s.status)}`}>
                        {s.status}
                      </span>
                      {photos > 0 && <span className="text-[11px] text-amber-700">{photos} photo{photos === 1 ? "" : "s"}</span>}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="hidden md:block bg-white rounded-xl border border-gray-200 overflow-hidden overflow-x-auto">
            <table className="w-full text-sm min-w-[640px]">
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
                {filtered.map((s) => {
                  const name = customerName(s.data);
                  const email = customerEmail(s.data);
                  const hasPhotos = (s.files?.length || 0) > 0;
                  return (
                    <tr key={s.id} className="border-b border-gray-100 hover:bg-gray-50/50">
                      <td className="px-4 py-3 text-gray-500">{s.id}</td>
                      <td className="px-4 py-3 font-medium">{s.form_name}</td>
                      <td className="px-4 py-3 text-gray-600">
                        {name && <div>{name}</div>}
                        <div className="text-xs">{email}</div>
                        {hasPhotos && <span className="text-xs text-amber-600">{s.files!.length} photo(s)</span>}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${statusClass(s.status)}`}>
                          {s.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-500">{s.created_at_human}</td>
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          onClick={() => setSelectedId(s.id)}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-black text-white rounded-lg hover:bg-black/80 min-h-9"
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

          {meta.last_page > 1 && (
            <div className="mt-4 px-3 sm:px-0 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4">
              <p className="text-sm text-gray-500">
                Showing {meta.from ?? 0}–{meta.to ?? 0} of {meta.total}
              </p>
              <div className="flex items-center gap-1 flex-wrap">
                <button
                  type="button"
                  onClick={() => goToPage(page - 1)}
                  disabled={page <= 1}
                  className="inline-flex items-center gap-1 px-3 min-h-11 text-sm rounded-lg border border-gray-200 bg-white text-gray-700 disabled:opacity-40"
                >
                  <ChevronLeft className="w-4 h-4" /> Prev
                </button>
                {pageNumbers.map((n, i) => {
                  const prev = pageNumbers[i - 1];
                  const showEllipsis = prev !== undefined && n - prev > 1;
                  return (
                    <span key={n} className="inline-flex items-center gap-1">
                      {showEllipsis ? <span className="px-1 text-gray-400">…</span> : null}
                      <button
                        type="button"
                        onClick={() => goToPage(n)}
                        className={`min-w-11 h-11 px-2 text-sm rounded-lg border ${
                          n === page
                            ? "bg-black text-white border-black"
                            : "bg-white text-gray-700 border-gray-200"
                        }`}
                      >
                        {n}
                      </button>
                    </span>
                  );
                })}
                <button
                  type="button"
                  onClick={() => goToPage(page + 1)}
                  disabled={page >= meta.last_page}
                  className="inline-flex items-center gap-1 px-3 min-h-11 text-sm rounded-lg border border-gray-200 bg-white text-gray-700 disabled:opacity-40"
                >
                  Next <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
