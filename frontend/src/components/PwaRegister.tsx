"use client";

import { useEffect } from "react";
import { playAlertSound } from "@/lib/alertSound";

export function PwaRegister() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    const register = () => {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    };
    if (document.readyState === "complete") register();
    else window.addEventListener("load", register, { once: true });

    const onMessage = (event: MessageEvent) => {
      if (event.data?.type === "FJB_PUSH_ALERT") playAlertSound();
    };
    navigator.serviceWorker.addEventListener("message", onMessage);
    return () => navigator.serviceWorker.removeEventListener("message", onMessage);
  }, []);

  return null;
}
