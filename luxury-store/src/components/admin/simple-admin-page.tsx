import { AdminPanel, AdminShell, EmptyAction, StatusBadge } from "./admin-shell";
import { adminReferenceData } from "@/lib/admin-data";
import { getAdminCopy } from "@/lib/admin-i18n";
import { supportedCountries } from "@/lib/regions";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";

export async function CategoriesAdminPage({
  locale,
}: {
  locale: string;
}) {
  const copy = getAdminCopy(locale);
  return (
    <AdminShell title={copy.nav.categories} locale={locale} actions={<Button variant="gold">{copy.add}</Button>}>
      <AdminPanel>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {adminReferenceData.categories.map((category) => (
            <div key={category.id} className="rounded-3xl border border-black/10 p-5">
              <h2 className="font-semibold">{locale === "ar" ? category.nameAr : category.name}</h2>
              <p className="mt-2 text-sm text-black/50">{category.id}</p>
              <div className="mt-5 flex gap-2">
                <Button size="sm" variant="outline">{copy.edit}</Button>
                <Button size="sm" variant="ghost">{copy.delete}</Button>
              </div>
            </div>
          ))}
        </div>
      </AdminPanel>
    </AdminShell>
  );
}

export async function CouponsAdminPage({ locale }: { locale: string }) {
  const copy = getAdminCopy(locale);
  return (
    <AdminShell title={copy.nav.coupons} locale={locale} actions={<Button variant="gold">{copy.add}</Button>}>
      <AdminPanel>
        <div className="grid gap-4">
          {adminReferenceData.coupons.map((coupon) => (
            <div key={coupon.code} className="grid gap-4 rounded-3xl border border-black/10 p-4 md:grid-cols-4">
              <strong>{coupon.code}</strong>
              <span>{coupon.discount}</span>
              <StatusBadge status={coupon.status} />
              <span>{coupon.expires}</span>
            </div>
          ))}
        </div>
      </AdminPanel>
    </AdminShell>
  );
}

export async function CountriesAdminPage({ locale }: { locale: string }) {
  const copy = getAdminCopy(locale);
  return (
    <AdminShell title={copy.nav.countries} locale={locale}>
      <AdminPanel title={copy.settings.currency}>
        <div className="space-y-4">
          {supportedCountries.map((country) => (
            <div key={country.code} className="grid gap-4 rounded-3xl border border-black/10 p-4 md:grid-cols-5">
              <strong>{locale === "ar" ? country.nameAr : country.name}</strong>
              <Input defaultValue={country.currency} />
              <Input type="number" defaultValue={country.taxRate} />
              <Input type="number" defaultValue={country.shippingFrom} />
              <Button variant="gold">{copy.save}</Button>
            </div>
          ))}
        </div>
      </AdminPanel>
    </AdminShell>
  );
}

export async function StoreSettingsAdminPage({ locale }: { locale: string }) {
  const copy = getAdminCopy(locale);
  return (
    <AdminShell title={copy.settings.title} locale={locale}>
      <AdminPanel>
        <form className="grid gap-5 lg:grid-cols-2">
          <label className="grid gap-2 text-sm font-semibold">
            {copy.settings.logo}
            <Input type="file" className="pt-2" />
          </label>
          <Input placeholder={copy.settings.storeNameEn} />
          <Input placeholder={copy.settings.storeNameAr} />
          <Input placeholder={`${copy.settings.contact} - email`} />
          <Input placeholder={`${copy.settings.contact} - phone`} />
          <Textarea placeholder={`${copy.settings.contact} - address`} />
          <Textarea placeholder={copy.settings.socials} />
          <div className="grid gap-3 rounded-3xl bg-[#f7f4ed] p-4 md:grid-cols-3 lg:col-span-2">
            <Input type="color" defaultValue="#0b0906" />
            <Input type="color" defaultValue="#d9ad51" />
            <Input type="color" defaultValue="#f7f4ed" />
          </div>
          <Input placeholder={copy.settings.emails} />
          <Input placeholder="SEO title" />
          <Textarea placeholder={copy.settings.seo} className="lg:col-span-2" />
          <Button variant="gold" className="lg:col-span-2">{copy.save}</Button>
        </form>
      </AdminPanel>
    </AdminShell>
  );
}

export async function PagesAdminPage({ locale }: { locale: string }) {
  const copy = getAdminCopy(locale);
  return (
    <AdminShell title={copy.nav.pages} locale={locale}>
      <AdminPanel>
        <div className="grid gap-4 md:grid-cols-2">
          {adminReferenceData.pages.map((page) => (
            <div key={page} className="rounded-3xl border border-black/10 p-5">
              <h2 className="text-xl font-semibold">{page}</h2>
              <Textarea className="mt-4" placeholder={`${page} content AR + EN`} />
              <Button className="mt-4" variant="gold">{copy.save}</Button>
            </div>
          ))}
        </div>
      </AdminPanel>
    </AdminShell>
  );
}

export async function ReviewsAdminPage({ locale }: { locale: string }) {
  const copy = getAdminCopy(locale);
  return (
    <AdminShell title={copy.nav.reviews} locale={locale}>
      <AdminPanel>
        <div className="space-y-4">
          {adminReferenceData.reviews.map((review) => (
            <div key={`${review.product}-${review.author}`} className="grid gap-4 rounded-3xl border border-black/10 p-4 md:grid-cols-5">
              <strong>{review.product}</strong>
              <span>{review.author}</span>
              <span>{review.rating}/5</span>
              <StatusBadge status={review.status} />
              <div className="flex gap-2">
                <Button size="sm" variant="gold">Approve</Button>
                <Button size="sm" variant="outline">Reject</Button>
              </div>
            </div>
          ))}
        </div>
      </AdminPanel>
    </AdminShell>
  );
}

export async function NotificationsAdminPage({ locale }: { locale: string }) {
  const copy = getAdminCopy(locale);
  return (
    <AdminShell title={copy.nav.notifications} locale={locale}>
      <AdminPanel>
        <div className="grid gap-4 md:grid-cols-3">
          {adminReferenceData.notifications.map((notification) => (
            <div key={notification.title} className="rounded-3xl border border-black/10 bg-[#f7f4ed] p-5">
              <h2 className="font-semibold">{notification.title}</h2>
              <p className="mt-3 text-sm text-black/55">{notification.body}</p>
            </div>
          ))}
        </div>
      </AdminPanel>
    </AdminShell>
  );
}

export async function AdminProfilePage({ locale }: { locale: string }) {
  const copy = getAdminCopy(locale);
  return (
    <AdminShell title={copy.nav.profile} locale={locale}>
      <AdminPanel>
        <form className="grid max-w-2xl gap-4">
          <Input defaultValue="Aurum Admin" />
          <Input defaultValue="admin@aurum.example" />
          <Input type="password" placeholder="New password" />
          <Button variant="gold">{copy.save}</Button>
        </form>
      </AdminPanel>
      <EmptyAction>{copy.logout}</EmptyAction>
    </AdminShell>
  );
}
