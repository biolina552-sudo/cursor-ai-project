"use client";

import { MessageCircle, Phone } from "lucide-react";
import { usePathname } from "@/i18n/routing";

export function FloatingSupport({ locale }: { locale: string }) {
  const pathname = usePathname();
  if (pathname.startsWith("/admin")) return null;

  const rtl = locale === "ar";
  return (
    <div className={`fixed bottom-5 z-50 flex flex-col gap-3 ${rtl ? "left-5" : "right-5"}`}>
      <a
        href="https://wa.me/966500000000"
        target="_blank"
        rel="noopener noreferrer"
        className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500 text-white shadow-2xl shadow-emerald-500/30 transition hover:scale-105"
        aria-label={rtl ? "تواصل عبر واتساب" : "Contact on WhatsApp"}
      >
        <MessageCircle className="h-6 w-6" />
      </a>
      <a
        href="tel:+966500000000"
        className="flex h-14 w-14 items-center justify-center rounded-full bg-orange-500 text-white shadow-2xl shadow-orange-500/30 transition hover:scale-105"
        aria-label={rtl ? "اتصال سريع" : "Quick call"}
      >
        <Phone className="h-6 w-6" />
      </a>
    </div>
  );
}
