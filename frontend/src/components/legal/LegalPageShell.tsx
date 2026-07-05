import type { ReactNode } from "react";

export function LegalSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mb-10 last:mb-0">
      <h2 className="text-xl font-serif font-bold text-black mb-4">{title}</h2>
      <div className="space-y-4 text-secondary-light leading-relaxed">{children}</div>
    </section>
  );
}

export function LegalPageShell({
  title,
  subtitle,
  lastUpdated,
  children,
}: {
  title: string;
  subtitle: string;
  lastUpdated: string;
  children: ReactNode;
}) {
  return (
    <>
      <section className="bg-black py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl md:text-5xl font-serif font-bold text-white mb-4">{title}</h1>
          <p className="text-white/70 text-lg">{subtitle}</p>
          <p className="text-white/40 text-sm mt-4">Last updated: {lastUpdated}</p>
        </div>
      </section>
      <section className="py-16 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">{children}</div>
      </section>
    </>
  );
}
