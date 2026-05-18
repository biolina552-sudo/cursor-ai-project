"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "@/i18n/routing";

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
    ttq?: { track?: (...args: unknown[]) => void; page?: () => void };
    gtag?: (...args: unknown[]) => void;
  }
}

export type TrackingPayload = {
  contentId?: string;
  contentName?: string;
  value?: number;
  currency?: string;
  phone?: string;
  city?: string;
};

export function trackEvent(event: "PageView" | "InitiateCheckout" | "Purchase", payload: TrackingPayload = {}) {
  if (typeof window === "undefined") return;

  window.fbq?.("track", event, payload);
  if (event === "PageView") {
    window.ttq?.page?.();
    window.gtag?.("event", "page_view", payload);
    return;
  }

  window.ttq?.track?.(event, payload);
  window.gtag?.("event", event, {
    value: payload.value,
    currency: payload.currency,
    items: payload.contentId ? [{ item_id: payload.contentId, item_name: payload.contentName }] : undefined,
  });
}

export function TrackingEvents() {
  const pathname = usePathname();
  const previousPath = useRef<string | null>(null);

  useEffect(() => {
    if (previousPath.current === pathname) return;
    previousPath.current = pathname;
    trackEvent("PageView");
  }, [pathname]);

  return null;
}
