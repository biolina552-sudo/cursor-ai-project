import { Search } from "lucide-react";
import { AdminPanel, AdminShell, StatusBadge } from "@/components/admin/admin-shell";
import { Link } from "@/i18n/routing";
import { getAdminDashboardData } from "@/lib/admin-data";
import { getAdminCopy } from "@/lib/admin-i18n";
import { formatMoney } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const dynamic = "force-dynamic";

export default async function CustomersPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const copy = getAdminCopy(locale);
  const data = await getAdminDashboardData();

  return (
    <AdminShell title={copy.customers.title} locale={locale}>
      <AdminPanel>
        <div className="relative mb-6 max-w-md">
          <Search className="absolute start-4 top-3 h-4 w-4 text-black/40" />
          <Input className="ps-10" placeholder={`${copy.search}...`} />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead className="text-left text-black/50 rtl:text-right">
              <tr>
                <th className="py-3">{copy.orders.customer}</th>
                <th>{copy.orders.country}</th>
                <th>{copy.customers.ordersHistory}</th>
                <th>{copy.customers.totalSpent}</th>
                <th>{copy.status}</th>
                <th>{copy.viewDetails}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/10">
              {data.customers.map((customer) => (
                <tr key={customer.id}>
                  <td className="py-4">
                    <p className="font-semibold">{customer.name}</p>
                    <p className="text-xs text-black/50">{customer.email}</p>
                  </td>
                  <td>{customer.countryCode}</td>
                  <td>{customer.orders}</td>
                  <td>{formatMoney(customer.totalSpent, "USD", locale)}</td>
                  <td>
                    <StatusBadge status={customer.blocked ? "blocked" : "active"} />
                  </td>
                  <td>
                    <Link href={`/admin/customers/${customer.id}`}>
                      <Button size="sm" variant="outline">{copy.viewDetails}</Button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </AdminPanel>
    </AdminShell>
  );
}
