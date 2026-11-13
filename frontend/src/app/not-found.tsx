import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false, follow: false, googleBot: { index: false, follow: false } },
};

export default function NotFound() {
  return (
    <main className="min-h-[60vh] flex items-center justify-center px-4 py-24">
      <div className="max-w-lg text-center">
        <p className="text-sm font-semibold tracking-widest uppercase text-gold mb-3">404</p>
        <h1 className="font-playfair text-3xl md:text-4xl text-secondary mb-4">
          Page not found
        </h1>
        <p className="text-muted-foreground mb-8">
          That page doesn&apos;t exist or has moved. Try our live rates or free valuation instead.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-lg bg-gold px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90"
          >
            Home
          </Link>
          <Link
            href="/live-rates"
            className="inline-flex items-center justify-center rounded-lg border border-border px-5 py-2.5 text-sm font-semibold text-secondary hover:bg-muted"
          >
            Live rates
          </Link>
          <Link
            href="/free-valuation"
            className="inline-flex items-center justify-center rounded-lg border border-border px-5 py-2.5 text-sm font-semibold text-secondary hover:bg-muted"
          >
            Free valuation
          </Link>
        </div>
      </div>
    </main>
  );
}
