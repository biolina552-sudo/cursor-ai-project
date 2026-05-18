"use client";

import { NextIntlClientProvider } from "next-intl";
import { Toaster } from "sonner";
import { ThemeProvider } from "./theme-provider";
import { TrackingEvents } from "@/lib/tracking";

export function AppProviders({
  children,
  locale,
  messages,
}: {
  children: React.ReactNode;
  locale: string;
  messages: Record<string, unknown>;
}) {
  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <ThemeProvider>
        <TrackingEvents />
        {children}
        <Toaster richColors position="top-center" />
      </ThemeProvider>
    </NextIntlClientProvider>
  );
}
