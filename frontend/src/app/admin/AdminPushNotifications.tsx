"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Bell, BellOff, BellRing } from "lucide-react";
import { getAuthHeaders } from "./SubmissionChatPanel";

const API_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8002") + "/api";

function urlBase64ToUint8Array(base64: string) {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const raw = atob((base64 + padding).replace(/-/g, "+").replace(/_/g, "/"));
  const output = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i += 1) output[i] = raw.charCodeAt(i);
  return output;
}

async function currentSubscription() {
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) return null;
  const registration = await navigator.serviceWorker.ready;
  return registration.pushManager.getSubscription();
}

export function AdminPushNotifications({
  compact = false,
  showTest = false,
}: {
  compact?: boolean;
  showTest?: boolean;
}) {
  const [status, setStatus] = useState<"loading" | "unsupported" | "off" | "on" | "blocked">("loading");
  const [busy, setBusy] = useState(false);
  const lastUnread = useRef<number | null>(null);
  const autoTried = useRef(false);

  const syncStatus = useCallback(async () => {
    if (!("Notification" in window) || !("serviceWorker" in navigator) || !("PushManager" in window)) {
      setStatus("unsupported");
      return;
    }
    if (Notification.permission === "denied") {
      setStatus("blocked");
      return;
    }
    const subscription = await currentSubscription();
    setStatus(Notification.permission === "granted" && subscription ? "on" : "off");
  }, []);

  const subscribe = useCallback(async () => {
    if (!("Notification" in window) || !("serviceWorker" in navigator)) return false;
    setBusy(true);
    try {
      const permission = Notification.permission === "granted"
        ? "granted"
        : await Notification.requestPermission();
      if (permission !== "granted") {
        setStatus(permission === "denied" ? "blocked" : "off");
        return false;
      }

      const keyRes = await fetch(`${API_URL}/admin/push/vapid-key`, { headers: getAuthHeaders() });
      if (!keyRes.ok) throw new Error("Could not load push key");
      const { public_key: publicKey } = await keyRes.json();
      const registration = await navigator.serviceWorker.ready;
      const existing = await registration.pushManager.getSubscription();
      const subscription = existing || await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      });

      const res = await fetch(`${API_URL}/admin/push/subscribe`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(subscription.toJSON()),
      });
      if (!res.ok) throw new Error("Could not save push subscription");
      setStatus("on");
      return true;
    } catch {
      setStatus("off");
      return false;
    } finally {
      setBusy(false);
    }
  }, []);

  useEffect(() => {
    syncStatus();
  }, [syncStatus]);

  useEffect(() => {
    if (autoTried.current) return;
    if (status !== "off") return;
    if (Notification.permission !== "granted") return;
    autoTried.current = true;
    subscribe();
  }, [status, subscribe]);

  useEffect(() => {
    if (showTest) return;
    let cancelled = false;
    const poll = async () => {
      try {
        const res = await fetch(`${API_URL}/admin/messages/unread-count`, { headers: getAuthHeaders() });
        if (!res.ok || cancelled) return;
        const json = await res.json();
        const count = Number(json.count || 0);
        if (lastUnread.current !== null && count > lastUnread.current && document.hidden && Notification.permission === "granted") {
          const registration = "serviceWorker" in navigator ? await navigator.serviceWorker.ready : null;
          const body = count === 1 ? "1 unread enquiry or message" : `${count} unread enquiries or messages`;
          if (registration) {
            registration.showNotification("New FJB message", {
              body,
              icon: "/icon-192.png",
              badge: "/favicon-48.png",
              tag: "fjb-unread",
              data: { url: "/admin?tab=messages" },
            });
          } else {
            new Notification("New FJB message", { body, icon: "/icon-192.png" });
          }
        }
        lastUnread.current = count;
      } catch {
        // ignore
      }
    };
    poll();
    const id = window.setInterval(poll, 15000);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, [showTest]);

  async function sendTest() {
    setBusy(true);
    try {
      await subscribe();
      await fetch(`${API_URL}/admin/push/test`, { method: "POST", headers: getAuthHeaders() });
    } finally {
      setBusy(false);
    }
  }

  if (status === "loading" || status === "unsupported") return null;

  if (status === "on") {
    if (showTest) {
      return (
        <div className="flex flex-wrap items-center gap-3">
          <span className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-700">
            <BellRing className="w-4 h-4" />
            Phone alerts are on
          </span>
          <button
            type="button"
            onClick={sendTest}
            disabled={busy}
            className="px-3 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Send test alert
          </button>
        </div>
      );
    }
    if (!compact) return null;
    return (
      <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700" title="Phone alerts are on">
        <BellRing className="w-3.5 h-3.5" />
        Alerts on
      </span>
    );
  }

  if (status === "blocked") {
    if (showTest) {
      return (
        <p className="text-sm text-red-700">
          Notifications are blocked for this browser. Open the site settings and allow alerts, then reload.
        </p>
      );
    }
    return compact ? (
      <span title="Notifications are blocked in the browser" className="text-gray-400">
        <BellOff className="w-5 h-5" />
      </span>
    ) : null;
  }

  return (
    <button
      type="button"
      onClick={() => subscribe()}
      disabled={busy}
      className={
        compact
          ? "inline-flex items-center justify-center w-9 h-9 rounded-full bg-amber-50 text-[#D97706] border border-amber-200"
          : "inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-[#D97706] text-white text-sm font-semibold"
      }
    >
      <Bell className="w-4 h-4" />
      {!compact && (busy ? "Turning on…" : "Turn on alerts")}
    </button>
  );
}
