"use client";

import { useEffect, useRef } from "react";

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

export function TrustindexWidget({
  widgetId = DEFAULT_TRUSTINDEX_WIDGET_ID,
  className,
}: {
  widgetId?: string;
  className?: string;
}) {
  const mountRef = useRef<HTMLDivElement>(null);
  const id = widgetId.trim() || DEFAULT_TRUSTINDEX_WIDGET_ID;
  const src = trustindexLoaderSrc(id);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const slot = document.createElement("div");
    slot.setAttribute("src", src);
    mount.replaceChildren(slot);

    const existing = document.querySelector<HTMLScriptElement>('script[data-trustindex-loader="1"]');
    if (existing) {
      window.renderTrustindexWidgets?.();
      return;
    }

    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.defer = true;
    script.dataset.trustindexLoader = "1";
    document.body.appendChild(script);
  }, [src]);

  return (
    <div
      ref={mountRef}
      className={className}
      aria-label="Verified Google reviews"
    />
  );
}
