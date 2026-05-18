import { AdminShell } from "@/components/admin/admin-shell";

export default function AdminPage() {
  return (
    <AdminShell title="Admin dashboard">
      <div className="grid gap-5 md:grid-cols-4">
        {[
          ["Revenue", "$128.4k"],
          ["Orders", "1,248"],
          ["Customers", "8,410"],
          ["Conversion", "4.8%"],
        ].map(([label, value]) => (
          <div key={label} className="rounded-3xl bg-muted p-5">
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="mt-3 text-3xl font-semibold">{value}</p>
          </div>
        ))}
      </div>
    </AdminShell>
  );
}
