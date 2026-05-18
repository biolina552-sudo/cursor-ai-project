import { notFound } from "next/navigation";
import { getMessages } from "next-intl/server";
import { hasLocale } from "next-intl";
import { AppProviders } from "@/components/app-providers";
import { CartDrawer } from "@/components/cart/cart-drawer";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { isRtl, routing } from "@/i18n/routing";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <AppProviders locale={locale} messages={messages}>
      <div dir={isRtl(locale) ? "rtl" : "ltr"} className="min-h-screen">
        <Header locale={locale} />
        <main>{children}</main>
        <Footer locale={locale} />
        <CartDrawer locale={locale} />
      </div>
    </AppProviders>
  );
}
