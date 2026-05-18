"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { ShoppingBag, Star } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import type { Product } from "@/lib/data";
import { useCartStore } from "@/lib/cart-store";
import { resolveCountry } from "@/lib/regions";
import { formatMoney } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export function ProductCard({
  product,
  locale,
}: {
  product: Product;
  locale: string;
}) {
  const t = useTranslations("products");
  const addItem = useCartStore((state) => state.addItem);
  const country = resolveCountry("SA");
  const price = product.priceUsd * (country.currency === "SAR" ? 3.75 : 1);

  return (
    <motion.article
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="group overflow-hidden rounded-[2rem] border border-border bg-card"
    >
      <Link href={`/products/${product.slug}`}>
        <div className="relative aspect-[4/5] overflow-hidden bg-muted">
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            className="object-cover transition duration-700 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        </div>
      </Link>
      <div className="space-y-4 p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-semibold">
              {locale === "ar" ? product.nameAr : product.name}
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">{product.category}</p>
          </div>
          <div className="flex items-center gap-1 text-sm text-accent">
            <Star className="h-4 w-4 fill-current" />
            {product.rating}
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span className="font-semibold">
            {formatMoney(price, country.currency, locale)}
          </span>
          <Button
            variant="gold"
            size="sm"
            onClick={() =>
              addItem({
                product,
                quantity: 1,
                color: product.colors[0],
                size: product.sizes[0],
              })
            }
          >
            <ShoppingBag className="h-4 w-4" />
            {t("addToCart")}
          </Button>
        </div>
      </div>
    </motion.article>
  );
}
