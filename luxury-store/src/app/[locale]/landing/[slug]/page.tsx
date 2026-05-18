import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getLandingPageBySlug, getProductBySlug, landingPages } from "@/lib/data";
import { LandingPageView } from "@/components/landing/landing-page-view";

export function generateStaticParams() {
  return landingPages.flatMap((page) => [
    { locale: "en", slug: page.slug },
    { locale: "ar", slug: page.slug },
  ]);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const page = getLandingPageBySlug(slug);
  if (!page) return {};

  return {
    title: page.title,
    description: page.subtitle,
    openGraph: {
      title: page.title,
      description: page.subtitle,
    },
  };
}

export default async function LandingPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const page = getLandingPageBySlug(slug);
  if (!page) notFound();

  const product = getProductBySlug(page.productSlug);
  if (!product) notFound();

  return <LandingPageView page={page} product={product} locale={locale} />;
}
