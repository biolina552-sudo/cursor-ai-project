"use client";

import {
  BadgePercent,
  Bell,
  Boxes,
  ChartNoAxesCombined,
  ChevronLeft,
  ChevronRight,
  CircleUserRound,
  ClipboardList,
  Coins,
  FolderTree,
  Globe2,
  LayoutDashboard,
  LogOut,
  MessageSquareText,
  Package,
  Settings,
  Star,
  Store,
  Truck,
  UsersRound,
} from "lucide-react";
import { useState } from "react";
import { Link, usePathname, useRouter } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { getAdminCopy } from "@/lib/admin-i18n";
import { cn } from "@/lib/utils";

export function AdminShell({
  title,
  subtitle,
  locale,
  actions,
  children,
}: {
  title: string;
  subtitle?: string;
  locale: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const copy = getAdminCopy(locale);
  const rtl = locale === "ar";
  const targetLocale = rtl ? "en" : "ar";

  const navItems = [
    { label: copy.nav.overview, href: "/admin", icon: LayoutDashboard },
    { label: copy.nav.products, href: "/admin/products", icon: Package },
    { label: copy.nav.orders, href: "/admin/orders", icon: ClipboardList },
    { label: copy.nav.customers, href: "/admin/customers", icon: UsersRound },
    { label: copy.nav.categories, href: "/admin/categories", icon: FolderTree },
    { label: copy.nav.coupons, href: "/admin/coupons", icon: BadgePercent },
    { label: copy.nav.shipping, href: "/admin/shipping", icon: Truck },
    { label: copy.nav.countries, href: "/admin/countries", icon: Coins },
    { label: copy.nav.settings, href: "/admin/settings", icon: Settings },
    { label: copy.nav.pages, href: "/admin/pages", icon: Boxes },
    { label: copy.nav.reviews, href: "/admin/reviews", icon: Star },
    { label: copy.nav.notifications, href: "/admin/notifications", icon: Bell },
    { label: copy.nav.profile, href: "/admin/profile", icon: CircleUserRound },
  ];

  return (
    <section
      dir={rtl ? "rtl" : "ltr"}
      className="admin-surface min-h-screen bg-[#f7f4ed] text-[#17130c] dark:bg-[#f7f4ed] dark:text-[#17130c]"
    >
      <div className="flex">
        <aside
          className={cn(
            "sticky top-0 hidden h-screen shrink-0 overflow-y-auto border-white/10 bg-[#0b0906] p-4 text-white shadow-2xl lg:block",
            collapsed ? "w-[92px]" : "w-[310px]",
          )}
        >
          <div className="mb-6 flex items-center justify-between gap-3">
            <Link href="/admin" className="flex items-center gap-3">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-[#d9ad51] font-black text-black">
                A
              </span>
              {!collapsed ? (
                <span>
                  <span className="block font-serif text-xl tracking-[0.22em]">
                    AURUM
                  </span>
                  <span className="text-xs text-white/50">Admin Control</span>
                </span>
              ) : null}
            </Link>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/10"
              onClick={() => setCollapsed((value) => !value)}
            >
              {collapsed === rtl ? (
                <ChevronLeft className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </Button>
          </div>

          <nav className="space-y-1">
            {navItems.map((item) => {
              const active =
                pathname === item.href ||
                (item.href !== "/admin" && pathname.startsWith(item.href));
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={item.label}
                  className={cn(
                    "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition",
                    active
                      ? "bg-[#d9ad51] text-black"
                      : "text-white/70 hover:bg-white/10 hover:text-white",
                    collapsed && "justify-center px-2",
                  )}
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  {!collapsed ? <span>{item.label}</span> : null}
                </Link>
              );
            })}
          </nav>
        </aside>

        <div className="min-w-0 flex-1">
          <header className="sticky top-0 z-30 border-b border-black/10 bg-white/90 backdrop-blur-xl">
            <div className="flex min-h-20 flex-wrap items-center justify-between gap-4 px-4 py-4 lg:px-8">
              <div>
                <div className="flex items-center gap-2 text-sm text-[#8a6a23]">
                  <ChartNoAxesCombined className="h-4 w-4" />
                  <span>Admin / {title}</span>
                </div>
                <h1 className="mt-1 text-2xl font-semibold tracking-tight md:text-4xl">
                  {title}
                </h1>
                {subtitle ? (
                  <p className="mt-2 max-w-2xl text-sm text-black/55">{subtitle}</p>
                ) : null}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {actions}
                <Link href="/">
                  <Button variant="gold">
                    <Store className="h-4 w-4" />
                    {copy.viewStore}
                  </Button>
                </Link>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.replace(pathname, { locale: targetLocale })}
                >
                  <Globe2 className="h-4 w-4" />
                  {copy.language}
                </Button>
                <Link href="/admin/profile">
                  <Button variant="outline">
                    <CircleUserRound className="h-4 w-4" />
                    {copy.profile}
                  </Button>
                </Link>
                <Button variant="gold">
                  <LogOut className="h-4 w-4" />
                  {copy.logout}
                </Button>
              </div>
            </div>
          </header>

          <div className="grid gap-6 p-4 lg:p-8">{children}</div>
        </div>
      </div>
    </section>
  );
}

export function AdminPanel({
  title,
  children,
  className,
}: {
  title?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "rounded-[2rem] border border-black/10 bg-white p-5 shadow-sm",
        className,
      )}
    >
      {title ? <h2 className="mb-5 text-xl font-semibold">{title}</h2> : null}
      {children}
    </section>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const normalized = status.toLowerCase();
  const color =
    normalized.includes("paid") ||
    normalized.includes("active") ||
    normalized.includes("delivered")
      ? "bg-emerald-100 text-emerald-800"
      : normalized.includes("pending") ||
          normalized.includes("processing") ||
          normalized.includes("draft")
        ? "bg-amber-100 text-amber-900"
        : normalized.includes("cancel") ||
            normalized.includes("archived") ||
            normalized.includes("blocked")
          ? "bg-rose-100 text-rose-800"
          : "bg-slate-100 text-slate-700";

  return (
    <span className={cn("rounded-full px-3 py-1 text-xs font-bold", color)}>
      {status}
    </span>
  );
}

export function EmptyAction({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-[2rem] border border-dashed border-black/15 bg-[#fbfaf7] p-8 text-center text-sm text-black/55">
      <MessageSquareText className="mx-auto mb-3 h-7 w-7 text-[#b9872b]" />
      {children}
    </div>
  );
}

export function AdminActionLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="inline-flex h-11 items-center justify-center rounded-full bg-[#d9ad51] px-5 font-semibold text-black shadow-lg shadow-[#d9ad51]/20 transition hover:brightness-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d9ad51]"
    >
      {children}
    </Link>
  );
}
