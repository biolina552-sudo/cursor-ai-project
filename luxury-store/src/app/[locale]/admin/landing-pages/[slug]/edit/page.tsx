import { LandingBuilder } from "@/components/admin/landing-builder";

export default async function EditLandingPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  return <LandingBuilder locale={locale} slug={slug} />;
}
