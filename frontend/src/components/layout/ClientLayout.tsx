"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { MaintenancePage } from "@/components/layout/MaintenancePage";
import { WhatsAppButton } from "@/components/ui/WhatsAppButton";
import { IdleHelpAssistant } from "@/components/ui/IdleHelpAssistant";
import { NewsletterPopup } from "@/components/ui/NewsletterPopup";
import {
  API_SETTINGS_URL,
  defaultSettings,
  type SiteSettings,
} from "@/lib/settings";
import { hydrateSettingsCache } from "@/lib/useSettings";

function isMaintenanceEnabled(settings: SiteSettings): boolean {
  const value = settings.maintenance_mode as boolean | string | undefined;
  return value === true || value === "1" || value === "true";
}

export function ClientLayout({
  children,
  initialSettings,
}: {
  children: React.ReactNode;
  initialSettings?: SiteSettings;
}) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");
  const [settings, setSettings] = useState<SiteSettings>(() => {
    const seed = initialSettings ?? defaultSettings;
    if (typeof window !== "undefined") {
      hydrateSettingsCache(seed);
    }
    return seed;
  });

  useEffect(() => {
    let cancelled = false;
    fetch(API_SETTINGS_URL)
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (!cancelled && json?.data) {
          const next = { ...defaultSettings, ...json.data };
          hydrateSettingsCache(next);
          setSettings(next);
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  if (isAdmin) {
    return <>{children}</>;
  }

  if (isMaintenanceEnabled(settings)) {
    return <MaintenancePage settings={settings} />;
  }

  return (
    <>
      <Header />
      <main className="flex-1" suppressHydrationWarning>
        {children}
      </main>
      <Footer />
      <WhatsAppButton />
      <NewsletterPopup />
      <IdleHelpAssistant />
    </>
  );
}
