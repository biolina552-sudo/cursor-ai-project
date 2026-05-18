import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/card";

const orders = [
  ["AUR-10024", "Paid", "$845.00", "May 18, 2026"],
  ["AUR-10018", "Shipped", "$185.00", "May 10, 2026"],
  ["AUR-09991", "Delivered", "$620.00", "Apr 28, 2026"],
];

export default function OrdersPage() {
  return (
    <section className="container-shell py-10">
      <h1 className="text-4xl font-semibold">Order history</h1>
      <Card className="mt-8 overflow-hidden">
        {orders.map(([number, status, total, date]) => (
          <div key={number} className="grid gap-4 border-b border-border p-5 md:grid-cols-4">
            <strong>{number}</strong>
            <Badge className="w-fit">{status}</Badge>
            <span>{total}</span>
            <span className="text-muted-foreground">{date}</span>
          </div>
        ))}
      </Card>
    </section>
  );
}
