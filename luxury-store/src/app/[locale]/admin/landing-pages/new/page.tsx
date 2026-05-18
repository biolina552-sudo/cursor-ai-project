import { LandingBuilder } from "@/components/admin/landing-builder";

export default async function NewLandingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return <LandingBuilder locale={locale} />;
}
