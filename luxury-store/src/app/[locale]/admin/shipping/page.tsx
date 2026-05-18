import { AdminShell } from "@/components/admin/admin-shell";
import { supportedCountries } from "@/lib/regions";

export default function ShippingPage() {
  return (
    <AdminShell title="Countries & shipping zones">
      <div className="space-y-4">
        {supportedCountries.map((country) => (
          <div key={country.code} className="grid gap-4 rounded-3xl border border-border p-4 md:grid-cols-5">
            <strong>{country.name}</strong>
            <span>{country.currency}</span>
            <span>Tax {(country.taxRate * 100).toFixed(0)}%</span>
            <span>Shipping from {country.shippingFrom}</span>
            <button className="text-sm font-semibold text-accent">Edit rules</button>
          </div>
        ))}
      </div>
    </AdminShell>
  );
}
