import { AdminShell } from "@/components/admin/admin-shell";

const customers = ["Layla Ahmed", "Omar Nasser", "Nadia El Fassi", "Mariam Al Sabah"];

export default function CustomersPage() {
  return (
    <AdminShell title="Customers">
      <div className="divide-y divide-border">
        {customers.map((customer, index) => (
          <div key={customer} className="grid gap-4 py-4 md:grid-cols-4">
            <strong>{customer}</strong>
            <span>client{index + 1}@example.com</span>
            <span>{index + 2} orders</span>
            <span className="text-muted-foreground">VIP segment</span>
          </div>
        ))}
      </div>
    </AdminShell>
  );
}
