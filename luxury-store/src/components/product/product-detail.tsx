"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import {
  Banknote,
  CheckCircle2,
  Clock3,
  CreditCard,
  Landmark,
  PackageCheck,
  Phone,
  RotateCcw,
  ShieldCheck,
  Smartphone,
  Star,
  Truck,
  WalletCards,
} from "lucide-react";
import { toast } from "sonner";
import type { Product } from "@/lib/data";
import { useCartStore } from "@/lib/cart-store";
import { convertFromUsd, resolveCountry } from "@/lib/regions";
import { getEnabledPaymentMethods, storefrontSettings } from "@/lib/store-settings";
import { formatMoney } from "@/lib/utils";
import { Badge } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trackEvent } from "@/lib/tracking";

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
  const [timeLeft, setTimeLeft] = useState(12 * 60 + 43);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [checkoutStarted, setCheckoutStarted] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const addItem = useCartStore((state) => state.addItem);
  const country = resolveCountry(storefrontSettings.defaultCountryCode);
  const currency = storefrontSettings.defaultCurrency;
  const price = convertFromUsd(product.priceUsd, currency);
  const rtl = locale === "ar";
  const stockLeft = Math.max(5, Math.min(15, Math.round(product.inventory / 6)));
  const stockPercent = Math.max(14, Math.min(100, (stockLeft / 20) * 100));
  const formattedTime = useMemo(() => {
    const minutes = Math.floor(timeLeft / 60).toString().padStart(2, "0");
    const seconds = (timeLeft % 60).toString().padStart(2, "0");
    return `${minutes}:${seconds}`;
  }, [timeLeft]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setTimeLeft((value) => Math.max(0, value - 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, []);

  function startCheckoutTracking() {
    if (checkoutStarted) return;
    setCheckoutStarted(true);
    trackEvent("InitiateCheckout", {
      contentId: product.id,
      contentName: product.name,
      value: price,
      currency,
    });
  }

  return (
    <section className="container-shell grid gap-8 py-6 lg:grid-cols-[1.05fr_0.95fr] lg:py-10">
      <div className="order-2 grid gap-4 md:grid-cols-[96px_1fr] lg:order-1">
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

      <div className="order-1 self-start lg:order-2">
        <Badge>{product.category}</Badge>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight md:text-6xl">
          {locale === "ar" ? product.nameAr : product.name}
        </h1>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <span className="text-3xl font-bold text-accent">
            {formatMoney(price, currency, locale)}
          </span>
          <span className="flex items-center gap-1 rounded-full bg-accent/10 px-3 py-1 text-accent">
            <Star className="h-4 w-4 fill-current" />
            {product.rating} ({product.reviews})
          </span>
        </div>
        <p className="mt-4 text-base leading-8 text-muted-foreground md:text-lg">
          {product.description}
        </p>

        <Variant title="Color" values={product.colors} selected={color} onSelect={setColor} />
        <Variant title="Size" values={product.sizes} selected={size} onSelect={setSize} />

        <div className="mt-6 grid gap-3 rounded-[1.75rem] border border-accent/30 bg-accent/10 p-4">
          <div className="flex items-center justify-between gap-3">
            <span className="flex items-center gap-2 text-sm font-bold text-accent">
              <Clock3 className="h-4 w-4" />
              {rtl ? "ينتهي العرض خلال" : "Offer ends in"}
            </span>
            <span className="rounded-full bg-accent px-4 py-1 font-mono text-lg font-black text-accent-foreground">
              {formattedTime}
            </span>
          </div>
          <div>
            <div className="mb-2 flex justify-between text-sm font-semibold">
              <span>{rtl ? `متبقي ${stockLeft} قطع فقط في المخزن` : `Only ${stockLeft} pieces left in stock`}</span>
              <span>{stockLeft}/20</span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-background">
              <div className="h-full rounded-full bg-gradient-to-r from-red-500 to-accent" style={{ width: `${stockPercent}%` }} />
            </div>
          </div>
        </div>

        <PaymentMethodsPanel
          locale={locale}
          selected={paymentMethod}
          onSelect={setPaymentMethod}
        />

        <QuickOrderForm
          locale={locale}
          product={product}
          color={color}
          size={size}
          price={price}
          currency={currency}
          countryCode={country.code}
          paymentMethod={paymentMethod}
          isSubmitting={isSubmitting}
          setIsSubmitting={setIsSubmitting}
          onFocus={startCheckoutTracking}
        />

        <Button
          variant="gold"
          size="lg"
          className="mt-4 w-full"
          onClick={() => {
            addItem({ product, quantity: 1, color, size });
            toast.success(rtl ? "تمت الإضافة للسلة" : "Added to cart");
          }}
        >
          {rtl ? "أضف للسلة بدل الطلب السريع" : "Add to cart instead"}
        </Button>

        <div className="mt-6 grid gap-3 rounded-[2rem] bg-muted p-5 text-sm text-muted-foreground sm:grid-cols-3">
          <TrustItem icon={<Truck className="h-5 w-5" />} text={rtl ? "توصيل مجاني" : "Free delivery"} />
          <TrustItem icon={<Banknote className="h-5 w-5" />} text={rtl ? "الدفع عند الاستلام" : "Cash on delivery"} />
          <TrustItem icon={<RotateCcw className="h-5 w-5" />} text={rtl ? "استبدال واسترجاع" : "Easy returns"} />
        </div>

        <div className="mt-6 grid gap-3 rounded-[2rem] border border-border bg-card p-5">
          <h2 className="text-lg font-bold">{rtl ? "لماذا تطلب من شوبلينا؟" : "Why order from Shoplina?"}</h2>
          <div className="grid gap-3 text-sm text-muted-foreground md:grid-cols-3">
            <TrustItem icon={<PackageCheck className="h-5 w-5" />} text={rtl ? "تأكيد الطلب خلال 24 ساعة" : "Confirmed within 24h"} />
            <TrustItem icon={<ShieldCheck className="h-5 w-5" />} text={rtl ? "دفع آمن وخيارات متعددة" : "Secure payment options"} />
            <TrustItem icon={<CheckCircle2 className="h-5 w-5" />} text={rtl ? "منتجات مختارة بعناية" : "Curated products"} />
          </div>
        </div>
      </div>
    </section>
  );
}

function PaymentMethodsPanel({
  locale,
  selected,
  onSelect,
}: {
  locale: string;
  selected: string;
  onSelect: (value: string) => void;
}) {
  const rtl = locale === "ar";
  const methods = getEnabledPaymentMethods();
  const icons: Record<string, React.ReactNode> = {
    cod: <Banknote className="h-5 w-5" />,
    card: <CreditCard className="h-5 w-5" />,
    "apple-pay": <Smartphone className="h-5 w-5" />,
    "stc-pay": <WalletCards className="h-5 w-5" />,
    installments: <Landmark className="h-5 w-5" />,
  };

  return (
    <div className="mt-5 rounded-[2rem] border border-border bg-card p-5">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold">{rtl ? "اختر طريقة الدفع" : "Choose payment method"}</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {rtl
              ? "تظهر هنا فقط طرق الدفع التي تفعلها من إعدادات المتجر."
              : "Only payment methods enabled from store settings appear here."}
          </p>
        </div>
        <ShieldCheck className="h-7 w-7 text-accent" />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {methods.map((method) => (
          <label key={method.id} className="cursor-pointer">
            <input
              type="radio"
              name="paymentMethod"
              value={method.id}
              checked={selected === method.id}
              onChange={() => onSelect(method.id)}
              className="peer sr-only"
            />
            <span className="flex h-full gap-3 rounded-2xl border border-border bg-background p-4 transition peer-checked:border-accent peer-checked:bg-accent/10 peer-checked:ring-2 peer-checked:ring-accent/30">
              <span className="mt-1 text-accent">{icons[method.id] ?? <CreditCard className="h-5 w-5" />}</span>
              <span>
                <span className="flex items-center gap-2 font-bold">
                  {rtl ? method.labelAr : method.label}
                  {method.recommended ? (
                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                      {rtl ? "مفضل" : "Recommended"}
                    </span>
                  ) : null}
                </span>
                <span className="mt-1 block text-xs text-muted-foreground">
                  {rtl ? method.descriptionAr : method.description}
                </span>
              </span>
            </span>
          </label>
        ))}
      </div>
    </div>
  );
}

function QuickOrderForm({
  locale,
  product,
  color,
  size,
  price,
  currency,
  countryCode,
  paymentMethod,
  isSubmitting,
  setIsSubmitting,
  onFocus,
}: {
  locale: string;
  product: Product;
  color: string;
  size: string;
  price: number;
  currency: string;
  countryCode: string;
  paymentMethod: string;
  isSubmitting: boolean;
  setIsSubmitting: (value: boolean) => void;
  onFocus: () => void;
}) {
  const rtl = locale === "ar";
  const [phone, setPhone] = useState("+966 ");

  async function submitOrder(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const payload = {
      productId: product.id,
      productName: product.name,
      value: price,
      currency,
      fullName: String(formData.get("fullName") ?? ""),
      phone,
      city: String(formData.get("city") ?? ""),
      countryCode,
      paymentMethod,
      color,
      size,
    };

    try {
      const response = await fetch("/api/cod-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error ?? "Order failed");
      }

      trackEvent("Purchase", {
        contentId: product.id,
        contentName: product.name,
        value: price,
        currency,
        phone,
        city: payload.city,
      });
      window.location.href = `/${locale}/checkout/success?cod=1&order=${data.orderNumber}&product=${product.slug}`;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : rtl ? "تعذر إرسال الطلب" : "Could not submit order");
      setIsSubmitting(false);
    }
  }

  return (
    <form
      id="quick-order"
      onFocus={onFocus}
      onSubmit={submitOrder}
      className="mt-6 rounded-[2rem] border border-accent/35 bg-card p-5 shadow-xl shadow-accent/10"
    >
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold">{rtl ? "اطلب الآن" : "Order now"}</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {rtl ? "املأ 3 حقول فقط وسيتصل بك فريقنا للتأكيد." : "Fill only 3 fields. Our team calls to confirm."}
          </p>
        </div>
        <ShieldCheck className="h-8 w-8 text-accent" />
      </div>
      <div className="grid gap-3">
        <Input name="fullName" required placeholder={rtl ? "الاسم الكامل" : "Full name"} />
        <Input
          name="phone"
          required
          inputMode="tel"
          value={phone}
          onChange={(event) => {
            const value = event.target.value;
            setPhone(value.startsWith("+") ? value : `+966 ${value}`);
          }}
          placeholder={rtl ? "رقم الهاتف" : "Phone number"}
          className="ltr-only"
        />
        <Input name="city" required placeholder={rtl ? "المدينة / المنطقة" : "City / region"} />
      </div>
      <Button type="submit" variant="gold" size="lg" className="mt-4 w-full bg-orange-500 text-white hover:bg-orange-600" disabled={isSubmitting}>
        <Phone className="h-5 w-5" />
        {isSubmitting ? (rtl ? "جاري إرسال الطلب..." : "Sending order...") : rtl ? "اضغط هنا للطلب" : "Click here to order"}
      </Button>
    </form>
  );
}

function TrustItem({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-center gap-2 rounded-2xl bg-background/70 p-3 font-semibold">
      <span className="text-accent">{icon}</span>
      <span>{text}</span>
    </div>
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
