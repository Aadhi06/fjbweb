"use client";

import { useEffect, useId, useRef } from "react";

export const DEFAULT_TRUSTINDEX_WIDGET_ID = "afd8ae0821ce80637d262599f2e";
export const DEFAULT_TRUSTINDEX_INBOX_URL = "https://admin.trustindex.io/";

export function trustindexLoaderSrc(widgetId: string) {
  return `https://cdn.trustindex.io/loader.js?${widgetId}`;
}

declare global {
  interface Window {
    renderTrustindexWidgets?: () => void;
    TrustindexWidget?: new (widgets: unknown, placeholder?: Element) => unknown;
    tiElementToWaitForActivity?: Element[];
    tiElementToWaitForVisibility?: Element[];
  }
}

function hasTrustindexReviews(root: ParentNode) {
  return Boolean(root.querySelector(".ti-review-item, .ti-widget-container, .ti-widget"));
}

function paintPendingTrustindex() {
  const flush = (list?: Element[]) => {
    if (!list?.length || !window.TrustindexWidget) return;
    list.splice(0).forEach((el) => {
      try {
        new window.TrustindexWidget!(null, el);
      } catch {
        /* Trustindex may already own this node */
      }
    });
  };
  flush(window.tiElementToWaitForActivity);
  flush(window.tiElementToWaitForVisibility);
  window.renderTrustindexWidgets?.();
  window.dispatchEvent(new MouseEvent("mousemove"));
}

export function TrustindexWidget({
  widgetId = DEFAULT_TRUSTINDEX_WIDGET_ID,
  className,
  onStatus,
}: {
  widgetId?: string;
  className?: string;
  onStatus?: (ok: boolean) => void;
}) {
  const id = widgetId.trim() || DEFAULT_TRUSTINDEX_WIDGET_ID;
  const src = trustindexLoaderSrc(id);
  const reactId = useId().replace(/:/g, "");
  const hostDomId = `trustindex-host-${reactId}`;
  const onStatusRef = useRef(onStatus);
  onStatusRef.current = onStatus;

  useEffect(() => {
    const host = document.getElementById(hostDomId);
    if (!host) return;

    let cancelled = false;

    document.querySelectorAll<HTMLScriptElement>('script[data-trustindex-loader="1"]').forEach((script) => {
      if (!script.src.includes(id)) script.remove();
    });

    if (!host.querySelector(`[src*="${id}"]`) && !hasTrustindexReviews(host)) {
      const placeholder = document.createElement("div");
      placeholder.setAttribute("src", src);
      host.appendChild(placeholder);
    }

    if (!document.querySelector('script[data-trustindex-loader="1"]')) {
      const script = document.createElement("script");
      script.src = src;
      script.async = true;
      script.dataset.trustindexLoader = "1";
      script.dataset.skipInit = "1";
      script.onload = () => paintPendingTrustindex();
      document.head.appendChild(script);
    } else {
      paintPendingTrustindex();
    }

    const check = () => {
      if (cancelled) return;
      if (hasTrustindexReviews(host) || hasTrustindexReviews(document)) {
        onStatusRef.current?.(true);
        return;
      }
      paintPendingTrustindex();
    };

    const observer = new MutationObserver(check);
    observer.observe(document.body, { childList: true, subtree: true });
    const timers = [400, 1000, 2000, 4000].map((ms) => window.setTimeout(check, ms));
    const failTimer = window.setTimeout(() => {
      if (!cancelled && !hasTrustindexReviews(host) && !hasTrustindexReviews(document)) {
        onStatusRef.current?.(false);
      }
    }, 7000);

    return () => {
      cancelled = true;
      observer.disconnect();
      timers.forEach((timer) => window.clearTimeout(timer));
      window.clearTimeout(failTimer);
    };
  }, [src, hostDomId, id]);

  return (
    <div
      id={hostDomId}
      data-trustindex-host=""
      className={className}
      aria-label="Verified Google reviews"
    />
  );
}
