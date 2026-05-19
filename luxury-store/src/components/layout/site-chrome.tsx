"use client";

import { usePathname } from "@/i18n/routing";
import { CartDrawer } from "@/components/cart/cart-drawer";
import { FloatingSupport } from "@/components/layout/floating-support";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";

export function SiteChrome({
  children,
  locale,
}: {
  children: React.ReactNode;
  locale: string;
}) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");

  if (isAdmin) {
    return <main>{children}</main>;
  }

  return (
    <>
      <Header locale={locale} />
      <main>{children}</main>
      <Footer locale={locale} />
      <CartDrawer locale={locale} />
      <FloatingSupport locale={locale} />
    </>
  );
}
