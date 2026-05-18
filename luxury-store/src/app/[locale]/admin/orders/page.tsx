import { Filter, Printer, RefreshCcw, Search } from "lucide-react";
import { AdminPanel, AdminShell, StatusBadge } from "@/components/admin/admin-shell";
import { Link } from "@/i18n/routing";
import { getAdminDashboardData } from "@/lib/admin-data";
import { getAdminCopy } from "@/lib/admin-i18n";
import { formatMoney } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const copy = getAdminCopy(locale);
  const data = await getAdminDashboardData();

  return (
    <AdminShell title={copy.orders.title} locale={locale}>
      <AdminPanel title={copy.orders.filters}>
        <div className="grid gap-3 md:grid-cols-4">
          <div className="relative">
            <Search className="absolute start-4 top-3 h-4 w-4 text-black/40" />
            <Input className="ps-10" placeholder={`${copy.search}...`} />
          </div>
          <select className="h-11 rounded-2xl border border-black/10 bg-white px-4">
            <option>{copy.status}</option>
            <option>{copy.orders.pending}</option>
            <option>{copy.orders.processing}</option>
            <option>{copy.orders.shipped}</option>
            <option>{copy.orders.delivered}</option>
            <option>{copy.orders.cancelled}</option>
          </select>
          <Input type="date" />
          <Button variant="outline">
            <Filter className="h-4 w-4" />
            {copy.orders.country}
          </Button>
        </div>
      </AdminPanel>

      <AdminPanel>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[920px] text-sm">
            <thead className="text-left text-black/50 rtl:text-right">
              <tr>
                <th className="py-3">#</th>
                <th>{copy.orders.customer}</th>
                <th>{copy.orders.country}</th>
                <th>{copy.status}</th>
                <th>{copy.orders.payment}</th>
                <th>Total</th>
                <th>{locale === "ar" ? "تحديث الحالة" : "Update status"}</th>
                <th>{copy.viewDetails}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/10">
              {data.recentOrders.map((order) => (
                <tr key={order.id}>
                  <td className="py-4 font-semibold">{order.orderNumber}</td>
                  <td>
                    <p>{order.customer}</p>
                    <p className="text-xs text-black/45">{order.email}</p>
                  </td>
                  <td>{order.countryCode}</td>
                  <td><StatusBadge status={order.status} /></td>
                  <td><StatusBadge status={order.paymentStatus} /></td>
                  <td>{formatMoney(order.total, order.currency, locale)}</td>
                  <td>
                    <select className="rounded-2xl border border-black/10 bg-white px-3 py-2">
                      <option>{copy.orders.pending}</option>
                      <option>{copy.orders.processing}</option>
                      <option>{copy.orders.shipped}</option>
                      <option>{copy.orders.delivered}</option>
                      <option>{copy.orders.cancelled}</option>
                    </select>
                  </td>
                  <td>
                    <Link href={`/admin/orders/${order.id}`}>
                      <Button size="sm" variant="outline">{copy.viewDetails}</Button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </AdminPanel>

      <AdminPanel title={locale === "ar" ? "إجراءات الطلبات" : "Order actions"}>
        <div className="flex flex-wrap gap-3">
          <Button variant="outline">
            <Printer className="h-4 w-4" />
            {copy.printInvoice}
          </Button>
          <Button variant="outline">
            <RefreshCcw className="h-4 w-4" />
            {copy.refund}
          </Button>
        </div>
      </AdminPanel>
    </AdminShell>
  );
}
