import { Download, Filter, Search, Trash2 } from "lucide-react";
import { AdminPanel, AdminShell, StatusBadge } from "@/components/admin/admin-shell";
import { getAdminDashboardData } from "@/lib/admin-data";
import { getAdminCopy } from "@/lib/admin-i18n";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const copy = getAdminCopy(locale);
  const data = await getAdminDashboardData();

  return (
    <AdminShell
      title={copy.products.title}
      subtitle={copy.products.subtitle}
      locale={locale}
      actions={
        <>
          <Button variant="outline">
            <Trash2 className="h-4 w-4" />
            {copy.bulkDelete}
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4" />
            {copy.exportCsv}
          </Button>
          <Button variant="gold">{copy.add}</Button>
        </>
      }
    >
      <AdminPanel>
        <div className="grid gap-3 md:grid-cols-[1fr_220px_180px]">
          <div className="relative">
            <Search className="absolute start-4 top-3 h-4 w-4 text-black/40" />
            <Input className="ps-10" placeholder={`${copy.search}...`} />
          </div>
          <select className="h-11 rounded-2xl border border-black/10 bg-white px-4">
            <option>{copy.products.category}</option>
            <option>Atelier</option>
            <option>Fragrance</option>
            <option>Accessories</option>
          </select>
          <Button variant="outline">
            <Filter className="h-4 w-4" />
            {locale === "ar" ? "فرز" : "Sort"}
          </Button>
        </div>

        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[900px] text-sm">
            <thead className="text-left text-black/50 rtl:text-right">
              <tr>
                <th className="py-3"><input type="checkbox" /></th>
                <th>{copy.products.nameEn}</th>
                <th>{copy.products.category}</th>
                <th>SAR</th>
                <th>AED</th>
                <th>MAD</th>
                <th>USD</th>
                <th>EUR</th>
                <th>{copy.products.stock}</th>
                <th>{copy.status}</th>
                <th>{copy.edit}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/10">
              {data.products.map((product) => (
                <tr key={product.id}>
                  <td className="py-4"><input type="checkbox" /></td>
                  <td>
                    <p className="font-semibold">{product.nameEn}</p>
                    <p className="text-xs text-black/50">{product.nameAr}</p>
                  </td>
                  <td>{product.category}</td>
                  <td>{product.priceSar}</td>
                  <td>{product.priceAed}</td>
                  <td>{product.priceMad}</td>
                  <td>{product.priceUsd}</td>
                  <td>{product.priceEur}</td>
                  <td>{product.stock}</td>
                  <td><StatusBadge status={product.status} /></td>
                  <td><Button size="sm" variant="outline">{copy.edit}</Button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </AdminPanel>

      <AdminPanel title={locale === "ar" ? "نموذج إضافة / تعديل منتج" : "Add / Edit product form"}>
        <form className="grid gap-4 lg:grid-cols-2">
          <Input placeholder={copy.products.nameEn} />
          <Input placeholder={copy.products.nameAr} />
          <Textarea placeholder={copy.products.descriptionEn} />
          <Textarea placeholder={copy.products.descriptionAr} />
          <div className="grid gap-3 rounded-3xl bg-[#f7f4ed] p-4 lg:col-span-2 md:grid-cols-5">
            {["SAR", "AED", "MAD", "USD", "EUR"].map((currency) => (
              <Input key={currency} type="number" placeholder={`${copy.products.prices} ${currency}`} />
            ))}
          </div>
          <Input type="file" multiple className="pt-2" />
          <Input placeholder={copy.products.category} />
          <Input placeholder={copy.products.tags} />
          <Input type="number" placeholder={copy.products.stock} />
          <Input placeholder={`${copy.products.variants}: Size`} />
          <Input placeholder={`${copy.products.variants}: Color`} />
          <Input placeholder="SEO title" />
          <Textarea placeholder="SEO description" className="lg:col-span-2" />
          <select className="h-11 rounded-2xl border border-black/10 bg-white px-4">
            <option>{copy.products.active}</option>
            <option>{copy.products.draft}</option>
            <option>{copy.products.archived}</option>
          </select>
          <Button variant="gold">{copy.save}</Button>
        </form>
      </AdminPanel>
    </AdminShell>
  );
}
