"use client";

import { useCallback, useEffect, useState } from "react";
import { MessageSquare } from "lucide-react";
import { getAuthHeaders } from "./SubmissionChatPanel";

const API_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8002") + "/api";

export function useAdminUnreadCount(enabled: boolean) {
  const [count, setCount] = useState(0);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/admin/messages/unread-count`, { headers: getAuthHeaders() });
      if (res.ok) {
        const json = await res.json();
        setCount(json.count ?? 0);
      }
    } catch {
      // ignore polling errors
    }
  }, []);

  useEffect(() => {
    if (!enabled) return;
    refresh();
    const id = setInterval(refresh, 30000);
    return () => clearInterval(id);
  }, [enabled, refresh]);

  return { count, refresh };
}

export function AdminMessagesFab({
  count,
  onClick,
}: {
  count: number;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`Messages${count > 0 ? `, ${count} unread` : ""}`}
      className="fixed bottom-6 right-6 z-[80] w-14 h-14 bg-[#D97706] text-white rounded-full shadow-lg hover:bg-[#b45309] transition-all flex items-center justify-center hover:scale-105 active:scale-95"
    >
      <MessageSquare className="w-6 h-6" />
      {count > 0 && (
        <span className="absolute -top-1 -right-1 min-w-[22px] h-[22px] px-1.5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center border-2 border-white animate-pulse">
          {count > 99 ? "99+" : count}
        </span>
      )}
    </button>
  );
}
