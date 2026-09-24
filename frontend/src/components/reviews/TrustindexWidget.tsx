"use client";

import { useEffect, useId } from "react";

export const DEFAULT_TRUSTINDEX_WIDGET_ID = "bbaf65d82db81281c8362394a13";
export const DEFAULT_TRUSTINDEX_INBOX_URL = "https://admin.trustindex.io/";

export function trustindexLoaderSrc(widgetId: string) {
  return `https://cdn.trustindex.io/loader.js?${widgetId}`;
}

declare global {
  interface Window {
    renderTrustindexWidgets?: () => void;
  }
}

function isStrayTrustindexWidget(node: Element) {
  if (!(node instanceof HTMLElement)) return false;
  if (node.closest("main, header, footer, [data-trustindex-host], #reviews")) return false;
  const className = node.className.toString();
  return className.includes("ti-widget") || Boolean(node.getAttribute("src")?.includes("trustindex.io"));
}

/** Trustindex appends a second carousel next to a body-level script (after the footer). */
function removeStrayTrustindexWidgets() {
  Array.from(document.body.children).forEach((child) => {
    if (child.tagName === "SCRIPT" || child.tagName === "STYLE" || child.tagName === "NOSCRIPT") return;
    if (isStrayTrustindexWidget(child)) child.remove();
  });
}

export function TrustindexWidget({
  widgetId = DEFAULT_TRUSTINDEX_WIDGET_ID,
  className,
}: {
  widgetId?: string;
  className?: string;
}) {
  const id = widgetId.trim() || DEFAULT_TRUSTINDEX_WIDGET_ID;
  const src = trustindexLoaderSrc(id);
  const reactId = useId().replace(/:/g, "");
  const hostDomId = `trustindex-host-${reactId}`;

  useEffect(() => {
    const host = document.getElementById(hostDomId);
    if (!host) return;

    let cancelled = false;

    const existing = document.querySelector<HTMLScriptElement>('script[data-trustindex-loader="1"]');
    if (!existing) {
      const script = document.createElement("script");
      script.src = src;
      script.async = true;
      script.defer = true;
      script.dataset.trustindexLoader = "1";
      host.appendChild(script);
    } else {
      window.renderTrustindexWidgets?.();
    }

    const confine = () => {
      if (!cancelled) removeStrayTrustindexWidgets();
    };

    const observer = new MutationObserver(confine);
    observer.observe(document.body, { childList: true });
    const timers = [400, 1200, 3000].map((ms) => window.setTimeout(confine, ms));

    return () => {
      cancelled = true;
      observer.disconnect();
      timers.forEach((timer) => window.clearTimeout(timer));
    };
  }, [src, hostDomId]);

  return (
    <div
      id={hostDomId}
      data-trustindex-host=""
      className={className}
      aria-label="Verified Google reviews"
    >
      <div {...{ src }} />
    </div>
  );
}
