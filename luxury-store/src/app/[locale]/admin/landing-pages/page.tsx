import { Copy, Edit3, ExternalLink, Plus } from "lucide-react";
import { AdminActionLink, AdminPanel, AdminShell, StatusBadge } from "@/components/admin/admin-shell";
import { Link } from "@/i18n/routing";
import { landingPages } from "@/lib/data";
import { getAdminCopy } from "@/lib/admin-i18n";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";

export default async function AdminLandingPages({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const copy = getAdminCopy(locale);
  const rtl = locale === "ar";

  return (
    <AdminShell
      title={copy.nav.landing}
      locale={locale}
      actions={
        <AdminActionLink href="/admin/landing-pages/new">
          <Plus className="h-4 w-4" />
          {copy.add}
        </AdminActionLink>
      }
    >
      <AdminPanel>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[920px] text-sm">
            <thead className="text-left text-black/50 rtl:text-right">
              <tr>
                <th className="py-3">{rtl ? "العنوان" : "Title"}</th>
                <th>{rtl ? "المنتج" : "Product"}</th>
                <th>{rtl ? "الرابط" : "URL"}</th>
                <th>{rtl ? "الحالة" : "Status"}</th>
                <th>{rtl ? "معدل التحويل" : "CR"}</th>
                <th>{rtl ? "إجراءات" : "Actions"}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/10">
              {landingPages.map((page) => (
                <tr key={page.id}>
                  <td className="py-4">
                    <p className="font-semibold">{rtl ? page.titleAr : page.title}</p>
                    <p className="text-xs text-black/50">{rtl ? page.angleAr : page.angle}</p>
                  </td>
                  <td>{page.productSlug}</td>
                  <td className="font-mono text-xs">/{locale}/landing/{page.slug}</td>
                  <td><StatusBadge status={page.status} /></td>
                  <td>{page.conversionRate}%</td>
                  <td>
                    <div className="flex gap-2">
                      <Link href={`/landing/${page.slug}`}>
                        <Button size="sm" variant="outline">
                          <ExternalLink className="h-4 w-4" />
                          {rtl ? "فتح" : "Open"}
                        </Button>
                      </Link>
                      <Link href={`/admin/landing-pages/${page.slug}/edit`}>
                        <Button size="sm" variant="gold">
                          <Edit3 className="h-4 w-4" />
                          {rtl ? "بناء / تعديل" : "Build / Edit"}
                        </Button>
                      </Link>
                      <Button size="sm" variant="outline">
                        <Copy className="h-4 w-4" />
                        {rtl ? "نسخ" : "Copy"}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </AdminPanel>

      <AdminPanel
        title={rtl ? "إنشاء صفحة هبوط جديدة" : "Create new landing page"}
        className="scroll-mt-28"
      >
        <form id="new-landing" className="grid gap-4 md:grid-cols-2">
          <Input placeholder={rtl ? "عنوان الصفحة بالعربية" : "Landing title in English"} />
          <Input placeholder={rtl ? "عنوان الصفحة بالإنجليزية" : "Landing title in Arabic"} />
          <Input placeholder="Slug" />
          <Input placeholder={rtl ? "اختر المنتج المرتبط" : "Linked product slug"} />
          <Textarea placeholder={rtl ? "وصف العرض بالعربية" : "Offer copy in English"} />
          <Textarea placeholder={rtl ? "وصف العرض بالإنجليزية" : "Offer copy in Arabic"} />
          <Input placeholder={rtl ? "وسم الحملة مثل: TikTok May" : "Campaign tag e.g. TikTok May"} />
          <select className="h-11 rounded-2xl border border-black/10 bg-white px-4">
            <option>{rtl ? "منشورة" : "Published"}</option>
            <option>{rtl ? "مسودة" : "Draft"}</option>
          </select>
          <Button variant="gold" className="md:col-span-2">
            {copy.save}
          </Button>
        </form>
      </AdminPanel>
    </AdminShell>
  );
}
