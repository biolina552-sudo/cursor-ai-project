import { AdminShell } from "@/components/admin/admin-shell";
import { getAdminCopy } from "@/lib/admin-i18n";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";

export default async function NewProductPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const copy = getAdminCopy(locale);
  return (
    <AdminShell title={copy.add} locale={locale}>
      <form className="grid gap-4 md:grid-cols-2">
        <Input placeholder={copy.products.nameEn} />
        <Input placeholder={copy.products.nameAr} />
        <Input placeholder="Slug" />
        <Input placeholder="SKU" />
        <Input placeholder="Price USD" type="number" />
        <Input placeholder={copy.products.stock} type="number" />
        <Input type="file" className="pt-2" />
        <Textarea placeholder={copy.products.descriptionEn} className="md:col-span-2" />
        <Button variant="gold" className="md:col-span-2">
          {copy.save}
        </Button>
      </form>
    </AdminShell>
  );
}
