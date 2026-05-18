"use client";

import { Menu, ShoppingBag, UserRound } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link, usePathname, useRouter } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { useCartStore } from "@/lib/cart-store";

export function Header({ locale }: { locale: string }) {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const router = useRouter();
  const items = useCartStore((state) => state.items);
  const openCart = useCartStore((state) => state.openCart);
  const count = items.reduce((sum, item) => sum + item.quantity, 0);
  const targetLocale = locale === "ar" ? "en" : "ar";

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/80 backdrop-blur-xl">
      <div className="container-shell flex h-20 items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-full bg-primary text-sm font-black text-primary-foreground">
            A
          </span>
          <span>
            <span className="block font-serif text-xl font-semibold tracking-[0.22em]">
              AURUM
            </span>
            <span className="block text-xs text-muted-foreground">
              Luxury Store
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-medium md:flex">
          <Link href="/">{t("home")}</Link>
          <Link href="/products">{t("products")}</Link>
          <Link href="/dashboard">{t("dashboard")}</Link>
          <Link href="/admin">{t("admin")}</Link>
        </nav>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.replace(pathname, { locale: targetLocale })}
          >
            {targetLocale.toUpperCase()}
          </Button>
          <ThemeToggle />
          <Link href="/auth/login" className="hidden md:inline-flex">
            <Button variant="outline" size="sm">
              <UserRound className="h-4 w-4" />
              {t("login")}
            </Button>
          </Link>
          <Button variant="gold" size="sm" onClick={openCart}>
            <ShoppingBag className="h-4 w-4" />
            {t("cart")} ({count})
          </Button>
          <Button variant="ghost" size="sm" className="md:hidden">
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}
