import { Printer, RefreshCcw } from "lucide-react";
import { AdminPanel, AdminShell, StatusBadge } from "@/components/admin/admin-shell";
import { getAdminOrder } from "@/lib/admin-data";
import { getAdminCopy } from "@/lib/admin-i18n";
import { formatMoney } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  const copy = getAdminCopy(locale);
  const order = await getAdminOrder(id);

  return (
    <AdminShell title={`${copy.orders.detailTitle} ${order.orderNumber}`} locale={locale}>
      <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
        <AdminPanel title={copy.orders.items}>
          <div className="space-y-4">
            {order.items.map((item) => (
              <div key={item.name} className="flex justify-between rounded-2xl bg-[#f7f4ed] p-4">
                <div>
                  <p className="font-semibold">{item.name}</p>
                  <p className="text-sm text-black/50">Qty {item.quantity}</p>
                </div>
                <strong>{formatMoney(item.price, order.currency, locale)}</strong>
              </div>
            ))}
          </div>
        </AdminPanel>

        <div className="space-y-6">
          <AdminPanel title={copy.orders.customer}>
            <p className="font-semibold">{order.customer}</p>
            <p className="text-sm text-black/55">{order.email}</p>
            <p className="mt-4 text-sm">{order.shippingAddress}</p>
          </AdminPanel>
          <AdminPanel title={copy.orders.payment}>
            <div className="mb-3 flex justify-between">
              <span>{copy.status}</span>
              <StatusBadge status={order.paymentStatus} />
            </div>
            <div className="flex justify-between font-semibold">
              <span>Total</span>
              <span>{formatMoney(order.total, order.currency, locale)}</span>
            </div>
          </AdminPanel>
          <AdminPanel>
            <select className="mb-3 h-11 w-full rounded-2xl border border-black/10 bg-white px-4">
              <option>{copy.orders.pending}</option>
              <option>{copy.orders.processing}</option>
              <option>{copy.orders.shipped}</option>
              <option>{copy.orders.delivered}</option>
              <option>{copy.orders.cancelled}</option>
            </select>
            <div className="grid gap-3">
              <Button variant="gold">{copy.save}</Button>
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
        </div>
      </div>
    </AdminShell>
  );
}
