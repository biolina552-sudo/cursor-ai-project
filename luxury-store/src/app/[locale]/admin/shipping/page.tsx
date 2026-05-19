import { AdminShell } from "@/components/admin/admin-shell";
import { AdminPanel } from "@/components/admin/admin-shell";
import { supportedCountries } from "@/lib/regions";
import { getAdminCopy } from "@/lib/admin-i18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default async function ShippingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const copy = getAdminCopy(locale);

  return (
    <AdminShell title={copy.nav.shipping} locale={locale}>
      <AdminPanel>
        <div className="space-y-4">
        {supportedCountries.map((country) => (
          <div key={country.code} className="grid gap-4 rounded-3xl border border-black/10 p-4 md:grid-cols-6">
            <strong>{locale === "ar" ? country.nameAr : country.name}</strong>
            <span>{country.currency}</span>
            <span>Tax {(country.taxRate * 100).toFixed(0)}%</span>
            <Input type="number" defaultValue={country.shippingFrom} />
            <Input type="number" defaultValue={country.shippingFrom * 2} />
            <Button size="sm" variant="gold">{copy.save}</Button>
          </div>
        ))}
        </div>
      </AdminPanel>
    </AdminShell>
  );
}
