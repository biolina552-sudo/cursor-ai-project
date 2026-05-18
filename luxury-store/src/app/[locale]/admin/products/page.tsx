import Image from "next/image";
import { AdminShell } from "@/components/admin/admin-shell";
import { Link } from "@/i18n/routing";
import { products } from "@/lib/data";
import { Button } from "@/components/ui/button";

export default function AdminProductsPage() {
  return (
    <AdminShell title="Products CRUD">
      <div className="mb-6 flex justify-end">
        <Link href="/admin/products/new">
          <Button variant="gold">Add product</Button>
        </Link>
      </div>
      <div className="space-y-4">
        {products.map((product) => (
          <div key={product.id} className="grid items-center gap-4 rounded-3xl border border-border p-4 md:grid-cols-[72px_1fr_120px_160px]">
            <Image src={product.images[0]} alt="" width={72} height={72} className="h-18 w-18 rounded-2xl object-cover" />
            <div>
              <h2 className="font-semibold">{product.name}</h2>
              <p className="text-sm text-muted-foreground">{product.slug}</p>
            </div>
            <span>${product.priceUsd}</span>
            <div className="flex gap-2">
              <Button size="sm" variant="outline">Edit</Button>
              <Button size="sm" variant="ghost">Delete</Button>
            </div>
          </div>
        ))}
      </div>
    </AdminShell>
  );
}
