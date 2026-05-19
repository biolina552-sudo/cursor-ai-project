import { notFound } from "next/navigation";
import { AdminShell } from "@/components/admin/admin-shell";
import { ProductEditorForm } from "@/components/admin/product-editor-form";
import { getProductBySlug } from "@/lib/data";
import { getAdminCopy } from "@/lib/admin-i18n";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) notFound();

  const copy = getAdminCopy(locale);

  return (
    <AdminShell
      title={`${copy.edit}: ${locale === "ar" ? product.nameAr : product.name}`}
      subtitle={locale === "ar" ? "عدّل معلومات المنتج، المتغيرات، المخزون وحقول SEO." : "Edit product details, variants, stock and SEO fields."}
      locale={locale}
    >
      <ProductEditorForm locale={locale} product={product} />
    </AdminShell>
  );
}
