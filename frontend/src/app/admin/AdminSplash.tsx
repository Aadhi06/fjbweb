"use client";

const LOGO = "/images/logo.png";

export function AdminSplash() {
  return (
    <div
      className="fixed inset-0 z-[200] bg-white flex flex-col items-center justify-center px-8"
      role="status"
      aria-label="Loading Fine Jewellery Buyers admin"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={LOGO} alt="Fine Jewellery Buyers" className="w-[min(78vw,300px)] h-auto" />
    </div>
  );
}
