"use client";

import { useState, useEffect } from "react";
import { defaultSettings, API_SETTINGS_URL, type SiteSettings } from "./settings";

let clientCache: SiteSettings | null = null;
let clientPromise: Promise<SiteSettings> | null = null;

function fetchSettingsClient(): Promise<SiteSettings> {
  if (clientCache) return Promise.resolve(clientCache);
  if (clientPromise) return clientPromise;
  clientPromise = fetch(API_SETTINGS_URL)
    .then((res) => {
      if (!res.ok) throw new Error("Failed to fetch settings");
      return res.json();
    })
    .then((json) => {
      clientCache = { ...defaultSettings, ...json.data };
      return clientCache!;
    })
    .catch(() => {
      clientPromise = null;
      return defaultSettings;
    });
  return clientPromise;
}

export function useSettings(): SiteSettings {
  const [settings, setSettings] = useState<SiteSettings>(clientCache || defaultSettings);

  useEffect(() => {
    let cancelled = false;
    fetchSettingsClient().then((s) => {
      if (!cancelled) setSettings(s);
    });
    return () => { cancelled = true; };
  }, []);

  return settings;
}
