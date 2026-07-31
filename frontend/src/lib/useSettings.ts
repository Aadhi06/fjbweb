"use client";

import { useState, useEffect } from "react";
import { defaultSettings, API_SETTINGS_URL, type SiteSettings } from "./settings";

let clientCache: SiteSettings | null = null;
let clientPromise: Promise<SiteSettings> | null = null;

/** Seed from SSR so first paint matches server without waiting on /api/settings. */
export function hydrateSettingsCache(settings: SiteSettings) {
  clientCache = settings;
}

function fetchSettingsClient(forceRefresh = false): Promise<SiteSettings> {
  if (!forceRefresh && clientCache) return Promise.resolve(clientCache);
  if (!forceRefresh && clientPromise) return clientPromise;

  const request = fetch(API_SETTINGS_URL)
    .then((res) => {
      if (!res.ok) throw new Error("Failed to fetch settings");
      return res.json();
    })
    .then((json) => {
      clientCache = { ...defaultSettings, ...json.data };
      return clientCache!;
    })
    .catch(() => {
      return clientCache || defaultSettings;
    })
    .finally(() => {
      clientPromise = null;
    });

  clientPromise = request;
  return request;
}

export function useSettings(): SiteSettings {
  const [settings, setSettings] = useState<SiteSettings>(clientCache || defaultSettings);

  useEffect(() => {
    let cancelled = false;
    fetchSettingsClient(true).then((s) => {
      if (!cancelled) setSettings(s);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return settings;
}
