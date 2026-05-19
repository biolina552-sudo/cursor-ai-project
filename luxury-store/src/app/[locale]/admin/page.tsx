import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  Megaphone,
  Package,
  PackageCheck,
  Plane,
  Plus,
  ShoppingCart,
  TrendingUp,
  Truck,
  UsersRound,
  WalletCards,
  type LucideIcon,
} from "lucide-react";
import { AdminActionLink, AdminPanel, AdminShell, StatusBadge } from "@/components/admin/admin-shell";
import { Link } from "@/i18n/routing";
import { RevenueChart } from "@/components/admin/revenue-chart";
import { getAdminDashboardData } from "@/lib/admin-data";
import { getAdminCopy } from "@/lib/admin-i18n";
import { formatMoney } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const copy = getAdminCopy(locale);
  const rtl = locale === "ar";
  const data = await getAdminDashboardData();
  const stats = [
    {
      label: copy.overview.revenue,
      value: formatMoney(data.stats.totalRevenue, "USD", locale),
      icon: TrendingUp,
    },
    {
      label: copy.overview.ordersToday,
      value: data.stats.ordersToday.toLocaleString(locale),
      icon: ShoppingCart,
    },
    {
      label: copy.overview.newCustomers,
      value: data.stats.newCustomers.toLocaleString(locale),
      icon: UsersRound,
    },
    {
      label: copy.overview.productsCount,
      value: data.stats.productsCount.toLocaleString(locale),
      icon: Package,
    },
  ];
  const launchSteps: Array<{
    title: string;
    body: string;
    href: string;
    done: boolean;
  }> = [
    {
      title: rtl ? "أضف أول منتج" : "Add first product",
      body: rtl ? "ارفع الصور والسعر والمخزون" : "Upload images, price and stock",
      href: "/admin/products/new",
      done: true,
    },
    {
      title: rtl ? "أنشئ صفحة هبوط" : "Create landing page",
      body: rtl ? "جهز رابط الحملة للبيكسل" : "Prepare campaign URL for pixels",
      href: "/admin/landing-pages/new",
      done: true,
    },
    {
      title: rtl ? "اضبط الشحن" : "Configure shipping",
      body: "SA / UAE / MA / EG / KW",
      href: "/admin/shipping",
      done: false,
    },
    {
      title: rtl ? "راجع الطلبات" : "Review COD orders",
      body: rtl ? "أكد الطلبات قبل الشحن" : "Confirm orders before shipping",
      href: "/admin/orders",
      done: false,
    },
  ];
  const orderPipeline: Array<{
    label: string;
    count: number;
    icon: LucideIcon;
    className: string;
  }> = [
    {
      label: rtl ? "طلبات جديدة" : "New orders",
      count: 18,
      icon: Clock3,
      className: "bg-blue-50 text-blue-700",
    },
    {
      label: rtl ? "تم التأكيد" : "Confirmed",
      count: 12,
      icon: PackageCheck,
      className: "bg-emerald-50 text-emerald-700",
    },
    {
      label: rtl ? "قيد الشحن" : "Shipping",
      count: 7,
      icon: Truck,
      className: "bg-amber-50 text-amber-700",
    },
    {
      label: rtl ? "تم التسليم" : "Delivered",
      count: 5,
      icon: CheckCircle2,
      className: "bg-slate-50 text-slate-700",
    },
  ];
  const merchantModules: Array<{
    title: string;
    body: string;
    icon: LucideIcon;
  }> = [
    {
      title: rtl ? "الدفع عند الاستلام" : "Cash on delivery",
      body: rtl ? "مفعل لكل الدول" : "Enabled for all markets",
      icon: WalletCards,
    },
    {
      title: rtl ? "صفحات الهبوط" : "Landing pages",
      body: rtl ? "روابط جاهزة للإعلانات" : "Campaign-ready links",
      icon: Megaphone,
    },
    {
      title: rtl ? "شركات الشحن" : "Shipping carriers",
      body: rtl ? "مناطق وأسعار لكل بلد" : "Zones and rates per country",
      icon: Plane,
    },
    {
      title: rtl ? "المنتجات" : "Products",
      body: rtl ? "مخزون ومتغيرات وSEO" : "Stock, variants and SEO",
      icon: Package,
    },
  ];

  return (
    <AdminShell
      title={copy.overview.title}
      subtitle={copy.overview.subtitle}
      locale={locale}
      actions={
        <>
          <AdminActionLink href="/admin/products/new">
            <Plus className="h-4 w-4" />
            {rtl ? "أضف منتج" : "Add product"}
          </AdminActionLink>
          <AdminActionLink href="/admin/landing-pages/new">
            <Megaphone className="h-4 w-4" />
            {rtl ? "صفحة هبوط" : "Landing page"}
          </AdminActionLink>
        </>
      }
    >
      <div className="grid gap-4 xl:grid-cols-[1fr_420px]">
        <AdminPanel title={rtl ? "ابدأ تشغيل متجرك" : "Launch your store"}>
          <div className="grid gap-3 md:grid-cols-2">
            {launchSteps.map((step) => (
              <Link key={step.title} href={step.href} className="rounded-2xl border border-black/10 p-4 transition hover:border-blue-300 hover:bg-blue-50">
                <div className="flex items-start gap-3">
                  <span className={`grid h-9 w-9 place-items-center rounded-xl ${step.done ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>
                    <CheckCircle2 className="h-5 w-5" />
                  </span>
                  <span>
                    <strong className="block">{step.title}</strong>
                    <span className="mt-1 block text-sm text-black/55">{step.body}</span>
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </AdminPanel>

        <AdminPanel title={rtl ? "مسار الطلبات اليوم" : "Today order pipeline"}>
          <div className="grid gap-3">
            {orderPipeline.map((item) => {
              const Icon = item.icon;
              return (
              <div key={item.label} className="flex items-center justify-between rounded-2xl border border-black/10 p-3">
                <div className="flex items-center gap-3">
                  <span className={`grid h-10 w-10 place-items-center rounded-xl ${item.className}`}><Icon className="h-5 w-5" /></span>
                  <strong>{item.label}</strong>
                </div>
                <span className="text-2xl font-black">{item.count}</span>
              </div>
            );
            })}
          </div>
        </AdminPanel>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <AdminPanel key={stat.label}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-black/55">{stat.label}</p>
                  <p className="mt-3 text-3xl font-semibold">{stat.value}</p>
                </div>
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#d9ad51]/15 text-[#9a6a17]">
                  <Icon className="h-5 w-5" />
                </div>
              </div>
            </AdminPanel>
          );
        })}
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {merchantModules.map(({ title, body, icon: Icon }) => (
          <AdminPanel key={title} className="bg-gradient-to-br from-white to-slate-50">
            <Icon className="mb-4 h-7 w-7 text-blue-600" />
            <h3 className="font-bold">{title}</h3>
            <p className="mt-2 text-sm text-black/55">{body}</p>
          </AdminPanel>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_420px]">
        <AdminPanel title={copy.overview.revenueChart}>
          <RevenueChart data={data.revenue} locale={locale} />
        </AdminPanel>

        <AdminPanel title={copy.overview.lowStock}>
          <div className="space-y-3">
            {data.lowStock.map((item) => (
              <div
                key={item.sku}
                className="flex items-center justify-between rounded-2xl bg-amber-50 p-4"
              >
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-5 w-5 text-amber-700" />
                  <div>
                    <p className="font-semibold">{item.name}</p>
                    <p className="text-xs text-black/50">{item.sku}</p>
                  </div>
                </div>
                <span className="rounded-full bg-amber-200 px-3 py-1 text-sm font-bold text-amber-950">
                  {item.stock}
                </span>
              </div>
            ))}
          </div>
        </AdminPanel>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <AdminPanel title={copy.overview.topProducts}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-black/50 rtl:text-right">
                <tr>
                  <th className="py-3">{locale === "ar" ? "المنتج" : "Product"}</th>
                  <th>{locale === "ar" ? "الوحدات" : "Units"}</th>
                  <th>{locale === "ar" ? "الإيرادات" : "Revenue"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/10">
                {data.topProducts.map((product) => (
                  <tr key={product.name}>
                    <td className="py-4 font-semibold">{product.name}</td>
                    <td>{product.units}</td>
                    <td>{formatMoney(product.revenue, "USD", locale)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </AdminPanel>

        <AdminPanel title={copy.overview.recentOrders}>
          <div className="space-y-3">
            {data.recentOrders.map((order) => (
              <div
                key={order.id}
                className="grid gap-3 rounded-2xl border border-black/10 p-4 md:grid-cols-[1fr_auto]"
              >
                <div>
                  <p className="font-semibold">{order.orderNumber}</p>
                  <p className="text-sm text-black/55">
                    {order.customer} · {order.countryCode}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge status={order.status} />
                  <span className="font-semibold">
                    {formatMoney(order.total, order.currency, locale)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </AdminPanel>
      </div>
    </AdminShell>
  );
}
