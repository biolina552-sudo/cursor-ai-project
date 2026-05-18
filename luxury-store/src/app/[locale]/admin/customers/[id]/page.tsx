import { AdminPanel, AdminShell, StatusBadge } from "@/components/admin/admin-shell";
import { getAdminCustomer } from "@/lib/admin-data";
import { getAdminCopy } from "@/lib/admin-i18n";
import { formatMoney } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function CustomerProfilePage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  const copy = getAdminCopy(locale);
  const customer = await getAdminCustomer(id);

  return (
    <AdminShell title={copy.customers.profile} locale={locale}>
      <div className="grid gap-6 xl:grid-cols-[360px_1fr]">
        <AdminPanel>
          <h2 className="text-2xl font-semibold">{customer.name}</h2>
          <p className="mt-2 text-black/55">{customer.email}</p>
          <div className="mt-6 space-y-3">
            <div className="flex justify-between">
              <span>{copy.customers.totalSpent}</span>
              <strong>{formatMoney(customer.totalSpent, "USD", locale)}</strong>
            </div>
            <div className="flex justify-between">
              <span>{copy.customers.ordersHistory}</span>
              <strong>{customer.orders}</strong>
            </div>
            <StatusBadge status={customer.blocked ? "blocked" : "active"} />
          </div>
          <Button className="mt-6 w-full" variant={customer.blocked ? "gold" : "outline"}>
            {customer.blocked ? copy.customers.unblock : copy.customers.block}
          </Button>
        </AdminPanel>
        <AdminPanel title={copy.customers.addresses}>
          <div className="grid gap-4 md:grid-cols-2">
            {customer.addresses.map((address) => (
              <div key={address} className="rounded-2xl bg-[#f7f4ed] p-4">
                {address}
              </div>
            ))}
          </div>
        </AdminPanel>
      </div>
    </AdminShell>
  );
}
