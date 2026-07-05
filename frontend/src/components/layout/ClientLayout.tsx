"use client";

import { usePathname } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { WhatsAppButton } from "@/components/ui/WhatsAppButton";
import { IdleHelpAssistant } from "@/components/ui/IdleHelpAssistant";
import { NewsletterPopup } from "@/components/ui/NewsletterPopup";

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");

  if (isAdmin) {
    return <>{children}</>;
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
