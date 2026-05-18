import { AdminPanel, AdminShell } from "@/components/admin/admin-shell";
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
  const rtl = locale === "ar";
  const variantGroups = [
    {
      name: "size",
      label: rtl ? "المقاسات" : "Sizes",
      helper: rtl ? "اختر المقاسات المتاحة لهذا المنتج" : "Choose available product sizes",
      options: ["XS", "S", "M", "L", "XL"],
    },
    {
      name: "color",
      label: rtl ? "الألوان" : "Colors",
      helper: rtl ? "اعرض الألوان كخيارات واضحة للعميل" : "Show colors as clear customer choices",
      options: rtl
        ? ["أسود", "ذهبي", "عاجي", "بني", "أزرق"]
        : ["Black", "Gold", "Ivory", "Brown", "Blue"],
    },
    {
      name: "material",
      label: rtl ? "الخامة" : "Material",
      helper: rtl ? "حدد خامة المنتج مثل المتاجر الكبرى" : "Define product material like premium stores",
      options: rtl
        ? ["حرير", "جلد", "قطن", "كشمير"]
        : ["Silk", "Leather", "Cotton", "Cashmere"],
    },
    {
      name: "fit",
      label: rtl ? "القَصّة / الستايل" : "Fit / Style",
      helper: rtl ? "متغير إضافي لتجربة شراء أكثر احترافية" : "Extra variant group for a richer buying experience",
      options: rtl
        ? ["كلاسيكي", "ضيق", "واسع", "فاخر"]
        : ["Classic", "Slim", "Relaxed", "Luxury"],
    },
  ];

  return (
    <AdminShell title={copy.add} locale={locale}>
      <form className="grid gap-6">
        <AdminPanel title={rtl ? "معلومات المنتج الأساسية" : "Core product information"}>
          <div className="grid gap-4 md:grid-cols-2">
            <Input placeholder={copy.products.nameEn} />
            <Input placeholder={copy.products.nameAr} />
            <Input placeholder="Slug" />
            <Input placeholder="SKU" />
            <Input placeholder="Price USD" type="number" />
            <Input placeholder={copy.products.stock} type="number" />
            <Input type="file" multiple className="pt-2" />
            <Input placeholder={copy.products.category} />
            <Textarea placeholder={copy.products.descriptionEn} className="md:col-span-2" />
            <Textarea placeholder={copy.products.descriptionAr} className="md:col-span-2" />
          </div>
        </AdminPanel>

        <AdminPanel title={rtl ? "المتغيرات وخيارات المنتج" : "Product variants and options"}>
          <div className="mb-6 rounded-3xl bg-[#f7f4ed] p-5 text-sm text-black/60">
            {rtl
              ? "هذه المتغيرات ستظهر للعميل كأزرار اختيار واضحة في صفحة المنتج، ويمكنك لاحقًا ربط كل تركيبة بسعر ومخزون وصورة مختلفة."
              : "These variants appear to customers as clear selectable chips/radio buttons on the product page. Each combination can later map to its own price, stock, SKU and image."}
          </div>

          <div className="grid gap-5 xl:grid-cols-2">
            {variantGroups.map((group) => (
              <fieldset key={group.name} className="rounded-[1.75rem] border border-black/10 p-5">
                <legend className="px-2 text-lg font-semibold">{group.label}</legend>
                <p className="mb-4 mt-1 text-sm text-black/50">{group.helper}</p>
                <div className="flex flex-wrap gap-3">
                  {group.options.map((option, index) => (
                    <label key={option} className="cursor-pointer">
                      <input
                        type="checkbox"
                        name={`${group.name}[]`}
                        value={option}
                        defaultChecked={index < 3}
                        className="peer sr-only"
                      />
                      <span className="inline-flex h-11 min-w-16 items-center justify-center rounded-full border border-black/15 bg-white px-5 text-sm font-semibold text-black transition peer-checked:border-[#d9ad51] peer-checked:bg-[#d9ad51] peer-checked:text-black peer-focus:ring-2 peer-focus:ring-[#d9ad51]">
                        {option}
                      </span>
                    </label>
                  ))}
                </div>
              </fieldset>
            ))}
          </div>

          <div className="mt-6 rounded-[1.75rem] border border-black/10 p-5">
            <h3 className="text-lg font-semibold">
              {rtl ? "إضافة متغير مخصص" : "Add custom variant group"}
            </h3>
            <div className="mt-4 grid gap-4 md:grid-cols-[1fr_2fr_auto]">
              <Input placeholder={rtl ? "اسم المتغير مثل: الطول" : "Variant name e.g. Length"} />
              <Input placeholder={rtl ? "القيم مفصولة بفواصل: قصير، متوسط، طويل" : "Comma separated values: Short, Regular, Long"} />
              <Button type="button" variant="outline">
                {rtl ? "إضافة المتغير" : "Add variant"}
              </Button>
            </div>
          </div>
        </AdminPanel>

        <AdminPanel title={rtl ? "مصفوفة المتغيرات" : "Variant matrix"}>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-sm">
              <thead className="text-left text-black/50 rtl:text-right">
                <tr>
                  <th className="py-3">{rtl ? "التركيبة" : "Combination"}</th>
                  <th>SKU</th>
                  <th>{rtl ? "المخزون" : "Stock"}</th>
                  <th>{rtl ? "زيادة السعر" : "Price delta"}</th>
                  <th>{rtl ? "الحالة" : "Status"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/10">
                {[
                  rtl ? "أسود / M / حرير" : "Black / M / Silk",
                  rtl ? "ذهبي / L / حرير" : "Gold / L / Silk",
                  rtl ? "عاجي / S / كشمير" : "Ivory / S / Cashmere",
                ].map((combination, index) => (
                  <tr key={combination}>
                    <td className="py-4 font-semibold">{combination}</td>
                    <td>
                      <Input defaultValue={`VAR-${index + 1}`} className="h-9" />
                    </td>
                    <td>
                      <Input type="number" defaultValue={24 - index * 6} className="h-9" />
                    </td>
                    <td>
                      <Input type="number" defaultValue={index * 10} className="h-9" />
                    </td>
                    <td>
                      <label className="inline-flex items-center gap-2">
                        <input type="radio" name={`variant-status-${index}`} defaultChecked />
                        {rtl ? "متاح" : "Available"}
                      </label>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </AdminPanel>

        <AdminPanel title={rtl ? "تحسين محركات البحث" : "SEO fields"}>
          <div className="grid gap-4 md:grid-cols-2">
            <Input placeholder="SEO title" />
            <Input placeholder="SEO slug" />
            <Textarea placeholder="SEO description" className="md:col-span-2" />
            <select className="h-11 rounded-2xl border border-black/10 bg-white px-4">
              <option>{copy.products.active}</option>
              <option>{copy.products.draft}</option>
              <option>{copy.products.archived}</option>
            </select>
            <Button variant="gold">{copy.save}</Button>
          </div>
        </AdminPanel>
      </form>
    </AdminShell>
  );
}
