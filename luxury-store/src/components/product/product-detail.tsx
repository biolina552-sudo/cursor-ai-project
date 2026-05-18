"use client";

import Image from "next/image";
import { useState } from "react";
import { Star } from "lucide-react";
import { toast } from "sonner";
import type { Product } from "@/lib/data";
import { useCartStore } from "@/lib/cart-store";
import { resolveCountry } from "@/lib/regions";
import { formatMoney } from "@/lib/utils";
import { Badge } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function ProductDetail({
  product,
  locale,
}: {
  product: Product;
  locale: string;
}) {
  const [image, setImage] = useState(product.images[0]);
  const [color, setColor] = useState(product.colors[0]);
  const [size, setSize] = useState(product.sizes[0]);
  const addItem = useCartStore((state) => state.addItem);
  const country = resolveCountry("SA");
  const price = product.priceUsd * (country.currency === "SAR" ? 3.75 : 1);

  return (
    <section className="container-shell grid gap-10 py-10 lg:grid-cols-[1.1fr_0.9fr]">
      <div className="grid gap-4 md:grid-cols-[96px_1fr]">
        <div className="order-2 flex gap-3 md:order-1 md:flex-col">
          {product.images.map((item) => (
            <button
              key={item}
              className="relative h-24 w-24 overflow-hidden rounded-2xl border border-border"
              onClick={() => setImage(item)}
            >
              <Image src={item} alt="" fill className="object-cover" />
            </button>
          ))}
        </div>
        <div className="relative order-1 aspect-[4/5] overflow-hidden rounded-[2.5rem] bg-muted md:order-2">
          <Image src={image} alt={product.name} fill priority className="object-cover" />
        </div>
      </div>

      <div className="self-center">
        <Badge>{product.category}</Badge>
        <h1 className="mt-5 text-4xl font-semibold tracking-tight md:text-6xl">
          {locale === "ar" ? product.nameAr : product.name}
        </h1>
        <div className="mt-5 flex items-center gap-3">
          <span className="text-2xl font-semibold">
            {formatMoney(price, country.currency, locale)}
          </span>
          <span className="flex items-center gap-1 text-accent">
            <Star className="h-4 w-4 fill-current" />
            {product.rating} ({product.reviews})
          </span>
        </div>
        <p className="mt-6 text-lg leading-8 text-muted-foreground">
          {product.description}
        </p>

        <Variant title="Color" values={product.colors} selected={color} onSelect={setColor} />
        <Variant title="Size" values={product.sizes} selected={size} onSelect={setSize} />

        <Button
          variant="gold"
          size="lg"
          className="mt-8 w-full"
          onClick={() => {
            addItem({ product, quantity: 1, color, size });
            toast.success("Added to cart");
          }}
        >
          Add to cart
        </Button>

        <div className="mt-10 grid gap-4 rounded-[2rem] bg-muted p-6 text-sm text-muted-foreground">
          <p>Complimentary gift packaging on orders above $250.</p>
          <p>Regional tax and shipping are calculated automatically at checkout.</p>
          <p>Secure Stripe payments in USD, EUR, SAR, AED and MAD.</p>
        </div>
      </div>
    </section>
  );
}

function Variant({
  title,
  values,
  selected,
  onSelect,
}: {
  title: string;
  values: string[];
  selected: string;
  onSelect: (value: string) => void;
}) {
  return (
    <div className="mt-8">
      <h3 className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
        {title}
      </h3>
      <div className="flex flex-wrap gap-2">
        {values.map((value) => (
          <button
            key={value}
            className={`rounded-full border px-4 py-2 text-sm ${
              selected === value
                ? "border-accent bg-accent text-accent-foreground"
                : "border-border"
            }`}
            onClick={() => onSelect(value)}
          >
            {value}
          </button>
        ))}
      </div>
    </div>
  );
}
