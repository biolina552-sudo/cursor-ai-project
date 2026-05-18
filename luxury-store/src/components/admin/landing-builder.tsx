import { ArrowUpDown, Eye, Film, GripVertical, LayoutTemplate, Plus, Save, Settings2 } from "lucide-react";
import { AdminActionLink, AdminPanel, AdminShell, StatusBadge } from "@/components/admin/admin-shell";
import { Link } from "@/i18n/routing";
import { getAdminCopy } from "@/lib/admin-i18n";
import { getLandingPageBySlug, landingPages, landingSectionTemplates, products } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";

export function LandingBuilder({
  locale,
  slug,
}: {
  locale: string;
  slug?: string;
}) {
  const rtl = locale === "ar";
  const copy = getAdminCopy(locale);
  const page = slug ? getLandingPageBySlug(slug) : undefined;
  const isNew = !page;
  const previewSlug = page?.slug ?? "new-campaign";

  return (
    <AdminShell
      title={isNew ? (rtl ? "إنشاء صفحة هبوط" : "Create landing page") : rtl ? "تعديل صفحة الهبوط" : "Edit landing page"}
      subtitle={
        rtl
          ? "ابنِ صفحة هبوط جاهزة للحملات، أضف الأقسام، عدّل الفيديو، واربط الطلبات والتتبع."
          : "Build a campaign-ready landing page, add sections, edit video, and connect orders/tracking."
      }
      locale={locale}
      actions={
        <>
          <Link href={`/landing/${previewSlug}`}>
            <Button variant="outline">
              <Eye className="h-4 w-4" />
              {rtl ? "معاينة الصفحة" : "Preview"}
            </Button>
          </Link>
          <AdminActionLink href="/admin/landing-pages">
            {rtl ? "كل صفحات الهبوط" : "All landing pages"}
          </AdminActionLink>
        </>
      }
    >
      <AdminPanel title={rtl ? "كيف تبني صفحة هبوط جاهزة؟" : "How to build a ready landing page"}>
        <div className="grid gap-4 md:grid-cols-4">
          {[
            [rtl ? "1. اختر المنتج" : "1. Choose product", rtl ? "اربط الصفحة بمنتج وسعر وعرض." : "Connect product, price and offer."],
            [rtl ? "2. عدّل الأقسام" : "2. Edit sections", rtl ? "فعّل الفيديو، المزايا، FAQ والتقييمات." : "Enable video, benefits, FAQ and reviews."],
            [rtl ? "3. اربط التتبع" : "3. Connect tracking", rtl ? "Meta/TikTok/Google + Google Sheets." : "Meta/TikTok/Google + Google Sheets."],
            [rtl ? "4. انشر الرابط" : "4. Publish link", rtl ? "انسخ رابط الحملة واستخدمه في الإعلانات." : "Copy campaign URL and use it in ads."],
          ].map(([title, body]) => (
            <div key={title} className="rounded-3xl bg-[#f7f4ed] p-5">
              <h3 className="font-bold">{title}</h3>
              <p className="mt-2 text-sm text-black/55">{body}</p>
            </div>
          ))}
        </div>
      </AdminPanel>

      <div className="grid gap-6 xl:grid-cols-[1fr_420px]">
        <div className="grid gap-6">
          <AdminPanel title={rtl ? "معلومات الصفحة الأساسية" : "Landing page basics"}>
            <form className="grid gap-4 md:grid-cols-2">
              <Input defaultValue={page?.title ?? ""} placeholder={rtl ? "العنوان بالإنجليزية" : "Title in English"} />
              <Input defaultValue={page?.titleAr ?? ""} placeholder={rtl ? "العنوان بالعربية" : "Title in Arabic"} />
              <Input defaultValue={page?.slug ?? ""} placeholder="Slug" />
              <select defaultValue={page?.productSlug ?? products[0].slug} className="h-11 rounded-2xl border border-black/10 bg-white px-4">
                {products.map((product) => (
                  <option key={product.slug} value={product.slug}>
                    {rtl ? product.nameAr : product.name}
                  </option>
                ))}
              </select>
              <Textarea defaultValue={page?.subtitle ?? ""} placeholder={rtl ? "الوصف بالإنجليزية" : "Subtitle in English"} />
              <Textarea defaultValue={page?.subtitleAr ?? ""} placeholder={rtl ? "الوصف بالعربية" : "Subtitle in Arabic"} />
              <Input defaultValue={page?.offer ?? ""} placeholder={rtl ? "العرض بالإنجليزية" : "Offer in English"} />
              <Input defaultValue={page?.offerAr ?? ""} placeholder={rtl ? "العرض بالعربية" : "Offer in Arabic"} />
              <Input defaultValue={page?.badge ?? ""} placeholder={rtl ? "الشارة بالإنجليزية" : "Badge in English"} />
              <Input defaultValue={page?.badgeAr ?? ""} placeholder={rtl ? "الشارة بالعربية" : "Badge in Arabic"} />
            </form>
          </AdminPanel>

          <AdminPanel title={rtl ? "مكتبة الأقسام" : "Section library"}>
            <div className="grid gap-4 md:grid-cols-2">
              {landingSectionTemplates.map((section, index) => (
                <label key={section.id} className="flex cursor-pointer gap-4 rounded-3xl border border-black/10 p-4 transition hover:border-[#d9ad51]">
                  <input type="checkbox" defaultChecked={index < 5 || section.id === "cod-form"} className="mt-1" />
                  <div>
                    <div className="flex items-center gap-2">
                      {section.id === "video" ? <Film className="h-4 w-4 text-[#b9872b]" /> : <LayoutTemplate className="h-4 w-4 text-[#b9872b]" />}
                      <h3 className="font-bold">{rtl ? section.nameAr : section.name}</h3>
                    </div>
                    <p className="mt-2 text-sm text-black/55">
                      {rtl ? section.descriptionAr : section.description}
                    </p>
                  </div>
                </label>
              ))}
            </div>
          </AdminPanel>

          <AdminPanel title={rtl ? "ترتيب الأقسام" : "Section order"}>
            <div className="space-y-3">
              {landingSectionTemplates.slice(0, 7).map((section, index) => (
                <div key={section.id} className="flex items-center justify-between rounded-2xl border border-black/10 p-4">
                  <div className="flex items-center gap-3">
                    <GripVertical className="h-5 w-5 text-black/35" />
                    <span className="grid h-8 w-8 place-items-center rounded-full bg-[#d9ad51]/20 text-sm font-black">
                      {index + 1}
                    </span>
                    <strong>{rtl ? section.nameAr : section.name}</strong>
                  </div>
                  <Button type="button" size="sm" variant="outline">
                    <ArrowUpDown className="h-4 w-4" />
                    {rtl ? "ترتيب" : "Move"}
                  </Button>
                </div>
              ))}
            </div>
          </AdminPanel>
        </div>

        <aside className="grid h-fit gap-6">
          <AdminPanel title={rtl ? "قسم الفيديو" : "Video section"}>
            <div className="grid gap-3">
              <Input placeholder="YouTube / TikTok / MP4 URL" />
              <Textarea placeholder={rtl ? "عنوان الفيديو ووصف قصير" : "Video headline and short caption"} />
              <div className="aspect-video rounded-3xl border border-dashed border-black/20 bg-[#f7f4ed] p-5 text-center text-sm text-black/50">
                {rtl ? "معاينة الفيديو تظهر هنا" : "Video preview appears here"}
              </div>
            </div>
          </AdminPanel>

          <AdminPanel title={rtl ? "التتبع والربط" : "Tracking & integrations"}>
            <div className="grid gap-3">
              <Input placeholder="Meta Pixel ID" />
              <Input placeholder="TikTok Pixel ID" />
              <Input placeholder="Google Ads / GA4 ID" />
              <Input placeholder="Google Sheets Webhook URL" />
              <Input placeholder={rtl ? "وسم UTM للحملة" : "Campaign UTM tag"} />
            </div>
          </AdminPanel>

          <AdminPanel title={rtl ? "إعدادات النشر" : "Publish settings"}>
            <div className="grid gap-3">
              <select className="h-11 rounded-2xl border border-black/10 bg-white px-4" defaultValue={page?.status ?? "draft"}>
                <option value="published">{rtl ? "منشورة" : "Published"}</option>
                <option value="draft">{rtl ? "مسودة" : "Draft"}</option>
              </select>
              <StatusBadge status={page?.status ?? "draft"} />
              <Button variant="gold">
                <Save className="h-4 w-4" />
                {copy.save}
              </Button>
              <Button variant="outline">
                <Settings2 className="h-4 w-4" />
                {rtl ? "حفظ كقالب" : "Save as template"}
              </Button>
            </div>
          </AdminPanel>
        </aside>
      </div>
    </AdminShell>
  );
}
