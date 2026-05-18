import { AdminShell } from "@/components/admin/admin-shell";

export default function AdminOrdersPage() {
  return (
    <AdminShell title="Orders management">
      {["AUR-10024", "AUR-10018", "AUR-09991"].map((order, index) => (
        <div key={order} className="grid gap-4 border-b border-border py-4 md:grid-cols-4">
          <strong>{order}</strong>
          <span>{["Paid", "Processing", "Shipped"][index]}</span>
          <span>${[845, 185, 620][index]}.00</span>
          <select className="rounded-2xl border border-border bg-card px-3 py-2">
            <option>Paid</option>
            <option>Processing</option>
            <option>Shipped</option>
            <option>Delivered</option>
          </select>
        </div>
      ))}
    </AdminShell>
  );
}
