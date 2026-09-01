"use client";

import Link from "next/link";

import { Phone, Mail, MapPin, Clock } from "lucide-react";
import { useSettings } from "@/lib/useSettings";

const footerLinks = {
  services: [
    { name: "Sell Gold", href: "/services/sell-gold" },
    { name: "Sell Diamonds", href: "/services/sell-diamonds" },
    { name: "Sell Gemstones", href: "/services/sell-gemstones" },
    { name: "Sell Watches", href: "/services/sell-watches" },
    { name: "Sell Jewellery", href: "/services/sell-jewellery" },
    { name: "Sell Silver", href: "/services/sell-silver" },
    { name: "Sell Platinum", href: "/services/sell-platinum" },
  ],
  company: [
    { name: "About Us", href: "/about" },
    { name: "How It Works", href: "/how-it-works" },
    { name: "Sell Gold in London", href: "/sell-gold-london" },
    { name: "Sell Jewellery in Hatton Garden", href: "/sell-jewellery-hatton-garden" },
    { name: "Blog", href: "/blog" },
    { name: "FAQ", href: "/faq" },
    { name: "Contact Us", href: "/contact" },
  ],
  tools: [
    { name: "Live Rates", href: "/live-rates" },
    { name: "Gold Calculator", href: "/gold-calculator" },
    { name: "Free Valuation", href: "/free-valuation" },
  ],
};

export function Footer() {
  const s = useSettings();

  const phone = s.phone;
  const email = s.email;
  const address = s.address;
  const hours = s.opening_hours;

  return (
    <footer className="bg-black text-white/70">

      {/* Main footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          <div>
            <div className="mb-6">
              <h3 className="text-lg font-serif font-bold text-white leading-tight">Fine Jewellery</h3>
              <p className="text-xs text-gold font-semibold tracking-wider uppercase">Buyers</p>
            </div>
            <p className="text-white/50 text-sm leading-relaxed mb-6">UK&apos;s leading gold buyer. We also buy diamonds, gemstones, watches &amp; fine jewellery.</p>
            <div className="space-y-3">
              <a href={`tel:${phone.replace(/\s/g, "")}`} className="flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors cursor-pointer"><Phone className="w-4 h-4 text-gold" />{phone}</a>
              <a href={`mailto:${email}`} className="flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors cursor-pointer"><Mail className="w-4 h-4 text-gold" />{email}</a>
              <div className="flex items-start gap-2 text-sm text-white/60"><MapPin className="w-4 h-4 text-gold mt-0.5 shrink-0" /><span>{address}</span></div>
              <div className="flex items-start gap-2 text-sm text-white/60"><Clock className="w-4 h-4 text-gold mt-0.5 shrink-0" /><span>{hours}</span></div>
            </div>
          </div>
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white mb-6">Our Services</h4>
            <ul className="space-y-3">{footerLinks.services.map((l) => (<li key={l.href}><Link href={l.href} className="text-sm text-white/50 hover:text-white transition-colors cursor-pointer">{l.name}</Link></li>))}</ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white mb-6">Company</h4>
            <ul className="space-y-3">{footerLinks.company.map((l) => (<li key={l.href}><Link href={l.href} className="text-sm text-white/50 hover:text-white transition-colors cursor-pointer">{l.name}</Link></li>))}</ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white mb-6">Tools</h4>
            <ul className="space-y-3">{footerLinks.tools.map((l) => (<li key={l.href}><Link href={l.href} className="text-sm text-white/50 hover:text-white transition-colors cursor-pointer">{l.name}</Link></li>))}</ul>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-white/40 text-center md:text-left">
          <div className="space-y-1">
            <p>&copy; {new Date().getFullYear()} Fine Jewellery Buyers. All rights reserved.</p>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="hover:text-white/70 transition-colors cursor-pointer">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-white/70 transition-colors cursor-pointer">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
