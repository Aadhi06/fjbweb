"use client";

import { FormEvent, useState } from "react";

const TRACK_URL = "https://www.royalmail.com/track-your-item";
const HELP_URL = "https://www.royalmail.com/track-your-item";

export function RoyalMailTracker() {
  const [reference, setReference] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    const value = reference.replace(/\s+/g, "").toUpperCase();
    if (!value) {
      event.preventDefault();
      return;
    }
    setReference(value);
    const input = event.currentTarget.elements.namedItem("trackNumber");
    if (input instanceof HTMLInputElement) input.value = value;
  }

  return (
    <section id="track-your-item" className="bg-white scroll-mt-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 md:py-20">
        <div className="grid lg:grid-cols-[1fr_minmax(280px,42%)] gap-10 lg:gap-16 items-center">
          <div>
            <h2 className="text-3xl md:text-5xl font-serif font-bold text-black mb-8">Track your item</h2>
            <form onSubmit={handleSubmit} action={TRACK_URL} method="get" target="_blank" className="max-w-xl">
              <label htmlFor="royal-mail-reference" className="block text-sm font-semibold text-black mb-2">
                Your reference number <span className="text-[#E01A22]">*</span>
              </label>
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  id="royal-mail-reference"
                  name="trackNumber"
                  type="text"
                  required
                  autoComplete="off"
                  spellCheck={false}
                  value={reference}
                  onChange={(e) => setReference(e.target.value.toUpperCase())}
                  placeholder="e.g. AA123456789GB"
                  className="flex-1 min-h-14 px-4 border border-black/25 text-black placeholder:text-black/40 focus:outline-none focus:ring-2 focus:ring-[#E01A22] focus:border-[#E01A22]"
                />
                <button
                  type="submit"
                  className="min-h-14 px-8 bg-[#E01A22] text-white font-semibold whitespace-nowrap hover:bg-[#c4161d] focus:outline-none focus:ring-2 focus:ring-[#E01A22] focus:ring-offset-2"
                >
                  Track your delivery
                </button>
              </div>
              <p className="mt-5">
                <a
                  href={HELP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-black underline underline-offset-4 hover:text-[#E01A22]"
                >
                  Need help with your reference number?
                </a>
              </p>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                Use the tracking number from your proof of postage or prepaid label. This opens Royal Mail Track and
                Trace.
              </p>
            </form>
          </div>
          <div className="relative min-h-[200px] lg:min-h-[280px] -mx-4 sm:mx-0 lg:-mr-8 overflow-hidden bg-[#E01A22]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/royal-mail-track-van.jpg"
              alt="Red Royal Mail style delivery van"
              className="w-full h-full object-cover min-h-[200px] lg:min-h-[280px]"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
