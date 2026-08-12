"use client";

import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Loader2, MessageSquare, RefreshCw } from "lucide-react";
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

  const pageNumbers = (() => {
    const last = meta.last_page;
    const current = meta.current_page;
    if (last <= 7) return Array.from({ length: last }, (_, i) => i + 1);
    const pages = new Set<number>([1, last, current, current - 1, current + 1]);
    return Array.from(pages)
      .filter((n) => n >= 1 && n <= last)
      .sort((a, b) => a - b);
  })();

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-black mb-1">Form Submissions</h2>
          <p className="text-gray-500">
            View enquiries, photos, and chat with customers by email
            {meta.total > 0 ? ` · ${meta.total} total` : ""}
          </p>
        </div>
        <button
          onClick={() => fetchSubmissions(page)}
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-black"
        >
          <RefreshCw className="w-4 h-4" /> Refresh
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
      ) : submissions.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-500">No submissions yet</div>
      ) : (
        <>
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden overflow-x-auto">
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
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full capitalize ${
                            s.status === "new"
                              ? "bg-amber-50 text-amber-700"
                              : s.status === "replied"
                                ? "bg-green-50 text-green-700"
                                : "bg-gray-50 text-gray-600"
                          }`}
                        >
                          {s.status}
                        </span>
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

          {meta.last_page > 1 && (
            <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <p className="text-sm text-gray-500">
                Showing {meta.from ?? 0}–{meta.to ?? 0} of {meta.total}
              </p>
              <div className="flex items-center gap-1 flex-wrap">
                <button
                  type="button"
                  onClick={() => goToPage(page - 1)}
                  disabled={page <= 1}
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-sm rounded-lg border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-default"
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
                        className={`min-w-9 h-9 px-2 text-sm rounded-lg border ${
                          n === page
                            ? "bg-black text-white border-black"
                            : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
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
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-sm rounded-lg border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-default"
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
