import { AdminShell } from "@/components/admin/admin-shell";
import { ProductEditorForm } from "@/components/admin/product-editor-form";
import { getAdminCopy } from "@/lib/admin-i18n";

export default async function NewProductPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const copy = getAdminCopy(locale);

  return (
    <AdminShell title={copy.add} locale={locale}>
      <ProductEditorForm locale={locale} />
    </AdminShell>
  );
}
