"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useCartStore } from "@/lib/cart-store";
import { supportedCountries } from "@/lib/regions";
import { addressSchema, type AddressInput } from "@/lib/validations";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export function CheckoutForm({ locale }: { locale: string }) {
  const items = useCartStore((state) => state.items);
  const clearCart = useCartStore((state) => state.clearCart);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AddressInput>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      countryCode: "SA",
      shippingMethod: "standard",
    },
  });

  async function onSubmit(values: AddressInput) {
    const response = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ address: values, items, locale }),
    });
    const data = await response.json();
    if (!response.ok) {
      toast.error(data.error ?? "Checkout failed");
      return;
    }
    clearCart();
    window.location.href = data.url;
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <Card className="space-y-5 p-6">
        <h2 className="text-2xl font-semibold">Shipping address</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Full name" error={errors.fullName?.message}>
            <Input {...register("fullName")} />
          </Field>
          <Field label="Email" error={errors.email?.message}>
            <Input type="email" {...register("email")} />
          </Field>
          <Field label="Address line" error={errors.line1?.message}>
            <Input {...register("line1")} />
          </Field>
          <Field label="City" error={errors.city?.message}>
            <Input {...register("city")} />
          </Field>
          <Field label="Phone" error={errors.phone?.message}>
            <Input {...register("phone")} />
          </Field>
          <Field label="Country" error={errors.countryCode?.message}>
            <select
              className="h-11 w-full rounded-2xl border border-border bg-card px-4"
              {...register("countryCode")}
            >
              {supportedCountries.map((country) => (
                <option key={country.code} value={country.code}>
                  {locale === "ar" ? country.nameAr : country.name}
                </option>
              ))}
            </select>
          </Field>
        </div>
      </Card>

      <Card className="h-fit space-y-5 p-6">
        <h2 className="text-2xl font-semibold">Shipping</h2>
        <label className="flex items-center justify-between rounded-2xl border border-border p-4">
          <span>Standard delivery</span>
          <input type="radio" value="standard" {...register("shippingMethod")} />
        </label>
        <label className="flex items-center justify-between rounded-2xl border border-border p-4">
          <span>Express delivery</span>
          <input type="radio" value="express" {...register("shippingMethod")} />
        </label>
        <Button
          type="submit"
          variant="gold"
          size="lg"
          className="w-full"
          disabled={isSubmitting || items.length === 0}
        >
          {isSubmitting ? "Preparing Stripe..." : "Continue to Stripe"}
        </Button>
      </Card>
    </form>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="grid gap-2 text-sm font-medium">
      {label}
      {children}
      {error ? <span className="text-xs text-destructive">{error}</span> : null}
    </label>
  );
}
