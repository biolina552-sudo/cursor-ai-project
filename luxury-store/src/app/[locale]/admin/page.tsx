import { AlertTriangle, Package, ShoppingCart, TrendingUp, UsersRound } from "lucide-react";
import { AdminPanel, AdminShell, StatusBadge } from "@/components/admin/admin-shell";
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

  return (
    <AdminShell
      title={copy.overview.title}
      subtitle={copy.overview.subtitle}
      locale={locale}
    >
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
