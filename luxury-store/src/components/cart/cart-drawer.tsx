"use client";

import Image from "next/image";
import { X } from "lucide-react";
import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { useCartStore } from "@/lib/cart-store";
import { convertFromUsd, resolveCountry } from "@/lib/regions";
import { storefrontSettings } from "@/lib/store-settings";
import { formatMoney } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export function CartDrawer({ locale }: { locale: string }) {
  const t = useTranslations("nav");
  const { items, isOpen, closeCart, updateQuantity, removeItem } = useCartStore();
  const country = resolveCountry(storefrontSettings.defaultCountryCode);
  const currency = storefrontSettings.defaultCurrency;
  const subtotal = useMemo(
    () =>
      items.reduce(
        (sum, item) => sum + convertFromUsd(item.product.priceUsd, currency) * item.quantity,
        0,
      ),
    [items, currency],
  );
  const tax = subtotal * country.taxRate;
  const shipping = subtotal > 500 ? 0 : country.shippingFrom;
  const total = subtotal + tax + shipping;

  return (
    <div
      className={
        isOpen
          ? "fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
          : "pointer-events-none fixed inset-0 z-50 bg-black/0"
      }
      aria-hidden={!isOpen}
    >
      <aside
        className={`absolute top-0 h-full w-full max-w-md overflow-y-auto bg-background p-6 shadow-2xl transition-transform duration-300 ${
          locale === "ar" ? "left-0" : "right-0"
        } ${isOpen ? "translate-x-0" : locale === "ar" ? "-translate-x-full" : "translate-x-full"}`}
      >
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-2xl font-semibold">{t("cart")}</h2>
          <Button variant="ghost" size="sm" onClick={closeCart}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {items.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-border p-8 text-center text-muted-foreground">
            Your cart is empty.
          </div>
        ) : (
          <div className="space-y-5">
            {items.map((item) => (
              <div key={`${item.product.id}-${item.color}-${item.size}`} className="flex gap-4">
                <Image
                  src={item.product.images[0]}
                  alt={item.product.name}
                  width={96}
                  height={120}
                  className="rounded-2xl object-cover"
                />
                <div className="flex-1">
                  <h3 className="font-semibold">
                    {locale === "ar" ? item.product.nameAr : item.product.name}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {item.color} / {item.size}
                  </p>
                  <div className="mt-3 flex items-center justify-between">
                    <input
                      type="number"
                      min={1}
                      value={item.quantity}
                      onChange={(event) =>
                        updateQuantity(item.product.id, Number(event.target.value))
                      }
                      className="h-9 w-16 rounded-full border border-border bg-card px-3"
                    />
                    <button
                      className="text-xs text-destructive"
                      onClick={() => removeItem(item.product.id)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-8 space-y-3 rounded-3xl bg-muted p-5 text-sm">
          <Summary label="Subtotal" value={formatMoney(subtotal, currency, locale)} />
          <Summary label="Tax" value={formatMoney(tax, currency, locale)} />
          <Summary label="Shipping" value={formatMoney(shipping, currency, locale)} />
          <Summary
            label="Total"
            value={formatMoney(total, currency, locale)}
            strong
          />
        </div>

        <Link href="/checkout" onClick={closeCart}>
          <Button variant="gold" size="lg" className="mt-6 w-full">
            Checkout
          </Button>
        </Link>
      </aside>
    </div>
  );
}

function Summary({
  label,
  value,
  strong,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <div className={`flex justify-between ${strong ? "text-lg font-bold" : ""}`}>
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}
