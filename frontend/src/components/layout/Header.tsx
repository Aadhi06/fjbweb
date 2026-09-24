"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef, useCallback } from "react";
import { Menu, X, Phone, ChevronDown, Star, TrendingUp, TrendingDown } from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";
import { useSettings } from "@/lib/useSettings";
import { TopBarTicker } from "@/components/layout/TopBarTicker";

const services = [
  { name: "Sell Gold in London", href: "/sell-gold-london" },
  { name: "Sell Jewellery in Hatton Garden", href: "/sell-jewellery-hatton-garden" },
  { name: "Sell Gold", href: "/sell-gold" },
  { name: "Sell Gold Bars", href: "/sell-gold-bars" },
  { name: "Sell Gold Coins", href: "/sell-gold-coins" },
  { name: "Sell Inherited Gold", href: "/sell-inherited-gold" },
  { name: "Sell Diamonds", href: "/services/sell-diamonds" },
  { name: "Sell Gemstones", href: "/services/sell-gemstones" },
  { name: "Sell Watches", href: "/services/sell-watches" },
  { name: "Sell Jewellery", href: "/services/sell-jewellery" },
  { name: "Sell Silver", href: "/services/sell-silver" },
];

const navigation = [
  { name: "Home", href: "/" },
  { name: "How It Works", href: "/how-it-works" },
  { name: "Gold Calculator", href: "/gold-calculator" },
  { name: "Book Appointment", href: "/book-appointment" },
  { name: "About", href: "/about" },
  { name: "Blog", href: "/blog" },
  { name: "Contact", href: "/contact" },
];

interface RateData {
  metal: string;
  price_per_oz: number;
  price_per_gram: number;
  buying_price_per_gram: number;
  change_percent?: number;
  change_24h?: number;
}

function TickerPrice({
  value,
  direction,
  className,
}: {
  value: string;
  direction: "up" | "down" | "none";
  className?: string;
}) {
  return (
    <span
      className={cn("inline-block font-mono tabular-nums", className)}
      style={
        direction !== "none"
          ? {
              animation: `tickSlide${direction === "up" ? "Up" : "Down"} 0.45s cubic-bezier(0.22,1,0.36,1), tickFlash${direction === "up" ? "Green" : "Red"} 0.8s ease-out`,
            }
          : undefined
      }
    >
      {value}
    </span>
  );
}

function TickerArrow({
  isUp,
  size,
  animate,
}: {
  isUp: boolean;
  size: string;
  animate: boolean;
}) {
  const props = {
    className: cn(size, isUp ? "text-red-500" : "text-green-600"),
    style: animate ? { animation: "bounceArrow 0.5s ease-out" } as React.CSSProperties : undefined,
  };
  return isUp ? <TrendingUp {...props} /> : <TrendingDown {...props} />;
}

export function Header() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const settings = useSettings();
  const [rates, setRates] = useState<{ gold: RateData | null; silver: RateData | null }>({ gold: null, silver: null });
  const [tickDirections, setTickDirections] = useState<Record<string, "up" | "down" | "none">>({
    goldOz: "none", goldGm: "none", silverOz: "none", silverGm: "none",
  });
  const [flashKey, setFlashKey] = useState(0);
  const [goldLiveUp, setGoldLiveUp] = useState(true);
  const [silverLiveUp, setSilverLiveUp] = useState(true);
  const prevPricesRef = useRef<{ goldOz: number; goldGm: number; silverOz: number; silverGm: number } | null>(null);

  useEffect(() => {
    async function fetchRates() {
      try {
        const ratesRes = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8002"}/api/rates?_=${Date.now()}`,
          { cache: "no-store" }
        );
        if (ratesRes.ok) {
          const data = await ratesRes.json();
          if (data.data) {
            const gold24 = data.data.find((m: RateData) => m.metal === "Gold 24ct");
            const silver = data.data.find((m: RateData) => m.metal === "Silver");

            const newGoldGm = gold24?.price_per_gram ?? 0;
            const newGoldOz = gold24?.price_per_oz ?? newGoldGm * 31.1035;
            const newSilverGm = silver?.price_per_gram ?? 0;
            const newSilverOz = silver?.price_per_oz ?? newSilverGm * 31.1035;

            if (prevPricesRef.current) {
              const p = prevPricesRef.current;
              const cmp = (a: number, b: number): "up" | "down" | "none" =>
                a > b ? "up" : a < b ? "down" : "none";
              const newDirs = {
                goldOz: cmp(newGoldOz, p.goldOz),
                goldGm: cmp(newGoldGm, p.goldGm),
                silverOz: cmp(newSilverOz, p.silverOz),
                silverGm: cmp(newSilverGm, p.silverGm),
              };
              setTickDirections(newDirs);
              if (newDirs.goldOz !== "none") setGoldLiveUp(newDirs.goldOz === "up");
              if (newDirs.silverOz !== "none") setSilverLiveUp(newDirs.silverOz === "up");
              if (Object.values(newDirs).some((d) => d !== "none")) {
                setFlashKey((k) => k + 1);
              }
            }

            prevPricesRef.current = {
              goldOz: newGoldOz, goldGm: newGoldGm,
              silverOz: newSilverOz, silverGm: newSilverGm,
            };

            setRates({
              gold: gold24 ? { metal: "Gold", price_per_oz: gold24.price_per_oz, price_per_gram: gold24.price_per_gram, buying_price_per_gram: gold24.buying_price_per_gram, change_percent: gold24.change_24h ?? 0 } : null,
              silver: silver ? { metal: "Silver", price_per_oz: silver.price_per_oz, price_per_gram: silver.price_per_gram, buying_price_per_gram: silver.buying_price_per_gram, change_percent: silver.change_24h ?? 0 } : null,
            });
          }
        }
      } catch {}
    }
    fetchRates();
    const interval = setInterval(fetchRates, 30 * 1000);

    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      clearInterval(interval);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  const phone = settings.phone;
  const logoUrl = settings.logo_url;
  const rating = settings.google_rating;

  const goldGm = rates.gold?.price_per_gram || 100.45;
  const goldOz = rates.gold?.price_per_oz || goldGm * 31.1035;
  const silverGm = rates.silver?.price_per_gram || 1.50;
  const silverOz = rates.silver?.price_per_oz || silverGm * 31.1035;

  const dirUp = (d: "up" | "down" | "none", fallback: boolean) =>
    d === "up" ? true : d === "down" ? false : fallback;

  const goHome = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>) => {
      setMobileOpen(false);
      setServicesOpen(false);
      if (pathname === "/") {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: "instant" });
        window.location.href = "/";
      }
    },
    [pathname]
  );

  return (
    <>
      {/* Ticker Animations */}
      <style>{`
        @keyframes tickSlideUp {
          0% { transform: translateY(70%); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }
        @keyframes tickSlideDown {
          0% { transform: translateY(-70%); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }
        @keyframes tickFlashGreen {
          0%, 12% { color: #4ade80; text-shadow: 0 0 12px rgba(74,222,128,0.7); }
          100% { color: inherit; text-shadow: none; }
        }
        @keyframes tickFlashRed {
          0%, 12% { color: #f87171; text-shadow: 0 0 12px rgba(248,113,113,0.7); }
          100% { color: inherit; text-shadow: none; }
        }
        @keyframes bounceArrow {
          0% { transform: scale(1.6); opacity: 0.5; }
          40% { transform: scale(0.85); }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes glowPulse {
          0%, 100% { filter: drop-shadow(0 0 2px rgba(212,175,55,0.15)); }
          50% { filter: drop-shadow(0 0 8px rgba(212,175,55,0.45)); }
        }
      `}</style>

      <TopBarTicker />

      {/* Live market rates ticker — matches market rate display (O/Z + per gram) */}
      <div className="bg-white text-black border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5">
          <div className="flex items-center justify-center gap-4 sm:gap-8 flex-wrap">
            {/* Live pulse */}
            <div className="hidden lg:flex items-center gap-1.5 mr-1">
              <span className="relative flex h-2 w-2">
                <span className={cn("animate-ping absolute inline-flex h-full w-full rounded-full opacity-75", goldLiveUp ? "bg-green-500" : "bg-red-500")} />
                <span className={cn("relative inline-flex rounded-full h-2 w-2", goldLiveUp ? "bg-green-600" : "bg-red-600")} />
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Live Market</span>
            </div>

            {/* Gold */}
            <Link href="/live-rates" className="flex items-center gap-2 sm:gap-3 cursor-pointer group">
              <img src="/images/gold-bar-icon.png" alt="" className="h-7 w-7 sm:h-8 sm:w-8 object-contain shrink-0" aria-hidden />
              <span className="text-xs sm:text-sm font-extrabold tracking-[0.12em] text-black">GOLD</span>
              <span className="text-border hidden sm:inline">|</span>
              <div className="flex items-center gap-1">
                <TickerPrice
                  key={`gOz-${flashKey}`}
                  value={formatCurrency(goldOz)}
                  direction={tickDirections.goldOz}
                  className="text-xs sm:text-sm font-bold text-black tabular-nums"
                />
                <span className="text-[10px] font-semibold text-muted-foreground uppercase">O/Z</span>
                <TickerArrow key={`gOzA-${flashKey}`} isUp={dirUp(tickDirections.goldOz, goldLiveUp)} size="w-3 h-3" animate={tickDirections.goldOz !== "none"} />
              </div>
              <span className="text-border hidden sm:inline">|</span>
              <div className="hidden sm:flex items-center gap-1">
                <TickerPrice
                  key={`gGm-${flashKey}`}
                  value={formatCurrency(goldGm)}
                  direction={tickDirections.goldGm}
                  className="text-xs font-bold text-black tabular-nums"
                />
                <span className="text-[10px] font-semibold text-muted-foreground uppercase">GM</span>
                <TickerArrow key={`gGmA-${flashKey}`} isUp={dirUp(tickDirections.goldGm, goldLiveUp)} size="w-3 h-3" animate={tickDirections.goldGm !== "none"} />
              </div>
            </Link>

            <span className="text-border hidden md:inline text-lg font-thin">|</span>

            {/* Silver */}
            <Link href="/live-rates" className="flex items-center gap-2 sm:gap-3 cursor-pointer group">
              <img src="/images/silver-bar-icon.png" alt="" className="h-7 w-7 sm:h-8 sm:w-8 object-contain shrink-0" aria-hidden />
              <span className="text-xs sm:text-sm font-extrabold tracking-[0.12em] text-black">SILVER</span>
              <span className="text-border hidden sm:inline">|</span>
              <div className="flex items-center gap-1">
                <TickerPrice
                  key={`sOz-${flashKey}`}
                  value={formatCurrency(silverOz)}
                  direction={tickDirections.silverOz}
                  className="text-xs sm:text-sm font-bold text-black tabular-nums"
                />
                <span className="text-[10px] font-semibold text-muted-foreground uppercase">O/Z</span>
                <TickerArrow key={`sOzA-${flashKey}`} isUp={dirUp(tickDirections.silverOz, silverLiveUp)} size="w-3 h-3" animate={tickDirections.silverOz !== "none"} />
              </div>
              <span className="text-border hidden sm:inline">|</span>
              <div className="hidden sm:flex items-center gap-1">
                <TickerPrice
                  key={`sGm-${flashKey}`}
                  value={formatCurrency(silverGm)}
                  direction={tickDirections.silverGm}
                  className="text-xs font-bold text-black tabular-nums"
                />
                <span className="text-[10px] font-semibold text-muted-foreground uppercase">GM</span>
                <TickerArrow key={`sGmA-${flashKey}`} isUp={dirUp(tickDirections.silverGm, silverLiveUp)} size="w-3 h-3" animate={tickDirections.silverGm !== "none"} />
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* Main header */}
      <header className={cn(
        "bg-white border-b border-border sticky top-0 z-50 transition-shadow duration-200",
        scrolled && "shadow-md"
      )}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link href="/" onClick={goHome} scroll className="flex items-center gap-3 shrink-0 cursor-pointer">
              {logoUrl ? (
                <img src={logoUrl} alt="Fine Jewellery Buyers" style={{ height: `${settings.logo_size || 48}px`, width: 'auto' }} />
              ) : (
                <div className="w-11 h-11 bg-black rounded-lg flex items-center justify-center">
                  <span className="text-gold font-bold text-lg font-serif">FJ</span>
                </div>
              )}
              <div className="hidden sm:block">
                <p className="text-lg font-serif font-bold text-black leading-tight">Fine Jewellery</p>
                <p className="text-xs text-gold-dark font-semibold tracking-wider uppercase">Buyers</p>
              </div>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden lg:flex items-center gap-1">
              <Link href="/" onClick={goHome} scroll className="px-3 py-2 text-sm font-medium text-black/70 hover:text-gold-dark transition-colors cursor-pointer">Home</Link>
              <div className="relative" onMouseEnter={() => setServicesOpen(true)} onMouseLeave={() => setServicesOpen(false)}>
                <button className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-black/70 hover:text-gold-dark transition-colors cursor-pointer">
                  Services <ChevronDown className={cn("w-4 h-4 transition-transform duration-200", servicesOpen && "rotate-180")} />
                </button>
                {servicesOpen && (
                  <div className="absolute top-full left-0 w-72 bg-white rounded-xl shadow-xl border border-border py-2 fade-in">
                    {services.map((s) => (
                      <Link key={s.href} href={s.href} className="block px-4 py-2.5 text-sm text-black/70 hover:bg-muted hover:text-gold-dark transition-colors cursor-pointer">{s.name}</Link>
                    ))}
                  </div>
                )}
              </div>
              {navigation.slice(1).map((item) => (
                <Link key={item.href} href={item.href} className="px-3 py-2 text-sm font-medium text-black/70 hover:text-gold-dark transition-colors cursor-pointer">{item.name}</Link>
              ))}
            </nav>

            {/* Right side: rating + phone */}
            <div className="flex items-center gap-3">
              <span className="hidden xl:flex items-center gap-1 text-xs text-gold-dark font-semibold">
                <Star className="w-3.5 h-3.5 fill-gold text-gold" /> {rating}
              </span>
              <a href={`tel:${phone.replace(/\s/g, "")}`} className="hidden md:inline-flex items-center gap-2 px-5 py-2.5 bg-black text-white text-sm font-bold rounded-full hover:bg-black/80 transition-colors cursor-pointer">
                <Phone className="w-4 h-4" /> {phone}
              </a>
              <button className="lg:hidden p-2 text-black cursor-pointer" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Toggle menu">
                {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="lg:hidden border-t border-border bg-white fade-in">
            <div className="px-4 py-4 space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={item.href === "/" ? goHome : () => setMobileOpen(false)}
                  scroll
                  className="block px-4 py-3 text-base font-medium text-black/70 hover:bg-muted hover:text-gold-dark rounded-lg transition-colors cursor-pointer"
                >
                  {item.name}
                </Link>
              ))}
              <div className="pt-2 border-t border-border mt-2">
                <p className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Our Services</p>
                {services.map((s) => (
                  <Link key={s.href} href={s.href} className="block px-4 py-3 text-base text-black/70 hover:bg-muted hover:text-gold-dark rounded-lg transition-colors cursor-pointer" onClick={() => setMobileOpen(false)}>{s.name}</Link>
                ))}
              </div>
              <a href={`tel:${phone.replace(/\s/g, "")}`} className="block mx-4 mt-4 py-3 text-center bg-black text-white font-bold rounded-full cursor-pointer">
                <Phone className="w-4 h-4 inline mr-2" />{phone}
              </a>
            </div>
          </div>
        )}
      </header>
    </>
  );
}
