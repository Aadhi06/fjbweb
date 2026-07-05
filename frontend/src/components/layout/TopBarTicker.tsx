"use client";

import Link from "next/link";
import { useSettings } from "@/lib/useSettings";
import { parseTopBarTicker, parseTopBarTickerSpeed } from "@/lib/topBarTicker";

export function TopBarTicker() {
  const settings = useSettings();
  const items = parseTopBarTicker(settings.top_bar_ticker);
  const speed = parseTopBarTickerSpeed(settings.top_bar_ticker_speed);

  if (items.length === 0) return null;

  const track = [...items, ...items];

  return (
    <div className="bg-black text-white border-b border-white/10 overflow-hidden">
      <div className="relative h-9 flex items-center">
        <div
          className="flex items-center gap-10 whitespace-nowrap will-change-transform"
          style={{ animation: `topBarMarquee ${speed}s linear infinite` }}
        >
          {track.map((item, index) => (
            <Link
              key={`${item.text}-${index}`}
              href={item.url.startsWith("http") ? item.url : item.url}
              className="group inline-flex items-center gap-3 text-sm font-semibold tracking-wide text-white hover:text-gold-dark transition-colors duration-200 cursor-pointer shrink-0"
              {...(item.url.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}
            >
              <span className="text-gold group-hover:text-gold-light transition-colors duration-200 text-[10px]">●</span>
              {item.text}
            </Link>
          ))}
        </div>
      </div>
      <style>{`
        @keyframes topBarMarquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}
