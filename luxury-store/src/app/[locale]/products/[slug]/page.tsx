import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProductBySlug, products } from "@/lib/data";
import { ProductDetail } from "@/components/product/product-detail";
import { Card } from "@/components/ui/card";

export function generateStaticParams() {
  return products.flatMap((product) => [
    { locale: "en", slug: product.slug },
    { locale: "ar", slug: product.slug },
  ]);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) return {};

  return {
    title: product.name,
    description: product.description,
    openGraph: {
      title: product.name,
      description: product.description,
      images: product.images,
    },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) notFound();

  return (
    <>
      <ProductDetail product={product} locale={locale} />
      <section className="container-shell grid gap-6 pb-20 md:grid-cols-3">
        {[
          ["Materials", "Premium materials selected for longevity and touch."],
          ["Shipping", "Country-specific shipping zones and thresholds."],
          ["Reviews", `${product.reviews} verified reviews with ${product.rating}/5 rating.`],
        ].map(([title, body]) => (
          <Card key={title} className="p-6">
            <h2 className="text-xl font-semibold">{title}</h2>
            <p className="mt-3 text-sm leading-7 text-muted-foreground">{body}</p>
          </Card>
        ))}
      </section>
    </>
  );
}
