"use client";

import { useEffect, useId, useState } from "react";

export const DEFAULT_TRUSTINDEX_WIDGET_ID = "afd8ae0821ce80637d262599f2e";
export const DEFAULT_TRUSTINDEX_INBOX_URL = "https://admin.trustindex.io/";

export function trustindexLoaderSrc(widgetId: string) {
  return `https://cdn.trustindex.io/loader.js?${widgetId}`;
}

declare global {
  interface Window {
    renderTrustindexWidgets?: () => void;
  }
}

function isTrialExpiredBanner(node: Element) {
  const text = (node.textContent || "").toLowerCase();
  return text.includes("trial period has expired") || text.includes("subscription plans");
}

function confineTrustindex(host: HTMLElement) {
  const widgets = Array.from(host.querySelectorAll(".ti-widget, [class*='ti-widget']"));
  widgets.slice(1).forEach((extra) => extra.remove());

  Array.from(host.querySelectorAll("*")).forEach((node) => {
    if (isTrialExpiredBanner(node) && node instanceof HTMLElement) {
      node.style.display = "none";
    }
  });

  Array.from(document.body.children).forEach((child) => {
    if (!(child instanceof HTMLElement)) return;
    if (child.tagName === "SCRIPT" || child.tagName === "STYLE") return;
    if (host.contains(child)) return;
    const className = child.className?.toString?.() || "";
    if (className.includes("ti-widget") || isTrialExpiredBanner(child)) {
      child.remove();
    }
  });
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
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const host = document.getElementById(hostDomId);
    if (!host) return;

    let cancelled = false;

    document.querySelectorAll<HTMLScriptElement>('script[data-trustindex-loader="1"]').forEach((script) => {
      if (!script.src.includes(id)) script.remove();
    });

    if (!document.querySelector('script[data-trustindex-loader="1"]')) {
      const script = document.createElement("script");
      script.src = src;
      script.async = true;
      script.defer = true;
      script.dataset.trustindexLoader = "1";
      host.appendChild(script);
    } else {
      window.renderTrustindexWidgets?.();
    }

    const check = () => {
      if (cancelled) return;
      confineTrustindex(host);
      const expired = isTrialExpiredBanner(host) || Array.from(document.body.children).some(isTrialExpiredBanner);
      const hasReviews = Boolean(host.querySelector(".ti-review-item, .ti-widget-container, [class*='ti-review']"));
      if (expired && !hasReviews) {
        setFailed(true);
        onStatus?.(false);
        host.replaceChildren();
      } else if (hasReviews) {
        setFailed(false);
        onStatus?.(true);
      }
    };

    const observer = new MutationObserver(check);
    observer.observe(document.body, { childList: true, subtree: true });
    const timers = [600, 1600, 3500, 7000].map((ms) => window.setTimeout(check, ms));

    return () => {
      cancelled = true;
      observer.disconnect();
      timers.forEach((timer) => window.clearTimeout(timer));
    };
  }, [src, hostDomId, id, onStatus]);

  if (failed) return null;

  return (
    <div
      id={hostDomId}
      data-trustindex-host=""
      className={className}
      aria-label="Verified Google reviews"
    >
      <div
        ref={(node) => {
          if (node) node.setAttribute("src", src);
        }}
      />
    </div>
  );
}
