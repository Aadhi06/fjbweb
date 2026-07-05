"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { MaintenancePage } from "@/components/layout/MaintenancePage";
import { WhatsAppButton } from "@/components/ui/WhatsAppButton";
import { IdleHelpAssistant } from "@/components/ui/IdleHelpAssistant";
import { NewsletterPopup } from "@/components/ui/NewsletterPopup";
import { API_SETTINGS_URL, defaultSettings, type SiteSettings } from "@/lib/settings";

function isMaintenanceEnabled(settings: SiteSettings): boolean {
  const value = settings.maintenance_mode as boolean | string | undefined;
  return value === true || value === "1" || value === "true";
}

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings);
  const [settingsReady, setSettingsReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch(API_SETTINGS_URL)
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (!cancelled && json?.data) {
          setSettings({ ...defaultSettings, ...json.data });
        }
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setSettingsReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (isAdmin) {
    return <>{children}</>;
  }

  if (!settingsReady) {
    return <div className="min-h-screen hero-gradient" aria-hidden="true" />;
  }

  if (isMaintenanceEnabled(settings)) {
    return <MaintenancePage settings={settings} />;
  }

  return (
    <>
      <Header />
      <main className="flex-1" suppressHydrationWarning>{children}</main>
      <Footer />
      <WhatsAppButton />
      <NewsletterPopup />
      <IdleHelpAssistant />
    </>
  );
}
