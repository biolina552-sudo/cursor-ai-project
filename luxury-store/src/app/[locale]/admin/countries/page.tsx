import { CountriesAdminPage } from "@/components/admin/simple-admin-page";

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return <CountriesAdminPage locale={locale} />;
}
