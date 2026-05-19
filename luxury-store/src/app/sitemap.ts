import type { MetadataRoute } from "next";
import { landingPages, products } from "@/lib/data";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://luxury-store.example.com";
  const locales = ["en", "ar"];
  const staticRoutes = ["", "/products", "/checkout", "/auth/login"];

  return [
    ...locales.flatMap((locale) =>
      staticRoutes.map((route) => ({
        url: `${baseUrl}/${locale}${route}`,
        lastModified: new Date(),
        changeFrequency: "weekly" as const,
        priority: route === "" ? 1 : 0.8,
      })),
    ),
    ...locales.flatMap((locale) =>
      products.map((product) => ({
        url: `${baseUrl}/${locale}/products/${product.slug}`,
        lastModified: new Date(),
        changeFrequency: "weekly" as const,
        priority: 0.9,
      })),
    ),
    ...locales.flatMap((locale) =>
      landingPages.map((page) => ({
        url: `${baseUrl}/${locale}/landing/${page.slug}`,
        lastModified: new Date(),
        changeFrequency: "weekly" as const,
        priority: 0.95,
      })),
    ),
  ];
}
