import { Link } from "@/i18n/routing";
import { Card } from "@/components/ui/card";

export function AdminShell({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="container-shell grid gap-8 py-10 lg:grid-cols-[260px_1fr]">
      <aside className="h-fit rounded-[2rem] border border-border bg-card p-4">
        {[
          ["Overview", "/admin"],
          ["Products", "/admin/products"],
          ["Orders", "/admin/orders"],
          ["Customers", "/admin/customers"],
          ["Analytics", "/admin/analytics"],
          ["Shipping zones", "/admin/shipping"],
        ].map(([label, href]) => (
          <Link
            key={href}
            href={href}
            className="block rounded-2xl px-4 py-3 text-sm font-medium hover:bg-muted"
          >
            {label}
          </Link>
        ))}
      </aside>
      <div>
        <h1 className="mb-8 text-4xl font-semibold">{title}</h1>
        <Card className="p-6">{children}</Card>
      </div>
    </section>
  );
}
