"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { Banknote, CheckCircle2, Clock3, MessageCircle, Phone, ShieldCheck, Star, Truck } from "lucide-react";
import { toast } from "sonner";
import type { LandingPage, Product } from "@/lib/data";
import { resolveCountry } from "@/lib/regions";
import { formatMoney } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trackEvent } from "@/lib/tracking";

export function LandingPageView({
  page,
  product,
  locale,
}: {
  page: LandingPage;
  product: Product;
  locale: string;
}) {
  const rtl = locale === "ar";
  const country = resolveCountry("SA");
  const price = product.priceUsd * 3.75;
  const oldPrice = Math.round(price * 1.35);
  const [timeLeft, setTimeLeft] = useState(9 * 60 + 58);
  const [phone, setPhone] = useState("+966 ");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [checkoutTracked, setCheckoutTracked] = useState(false);

  const time = useMemo(() => {
    const minutes = Math.floor(timeLeft / 60).toString().padStart(2, "0");
    const seconds = (timeLeft % 60).toString().padStart(2, "0");
    return `${minutes}:${seconds}`;
  }, [timeLeft]);

  useEffect(() => {
    const timer = window.setInterval(() => setTimeLeft((value) => Math.max(0, value - 1)), 1000);
    return () => window.clearInterval(timer);
  }, []);

  function trackCheckoutOnce() {
    if (checkoutTracked) return;
    setCheckoutTracked(true);
    trackEvent("InitiateCheckout", {
      contentId: product.id,
      contentName: product.name,
      value: price,
      currency: country.currency,
    });
  }

  async function submitOrder(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    const formData = new FormData(event.currentTarget);
    const payload = {
      productId: product.id,
      productName: product.name,
      value: price,
      currency: country.currency,
      fullName: String(formData.get("fullName") ?? ""),
      phone,
      city: String(formData.get("city") ?? ""),
      countryCode: country.code,
      color: product.colors[0],
      size: product.sizes[0],
    };

    try {
      const response = await fetch("/api/cod-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Order failed");
      trackEvent("Purchase", {
        contentId: product.id,
        contentName: product.name,
        value: price,
        currency: country.currency,
        phone,
        city: payload.city,
      });
      window.location.href = `/${locale}/checkout/success?cod=1&order=${data.orderNumber}&landing=${page.slug}`;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : rtl ? "تعذر إرسال الطلب" : "Order failed");
      setIsSubmitting(false);
    }
  }

  return (
    <main className="bg-[#fbfaf7] text-[#15120b]">
      <section className="relative overflow-hidden bg-[#0b0906] text-white">
        <div className="absolute inset-0 opacity-20">
          <Image src={product.images[0]} alt="" fill priority className="object-cover" />
        </div>
        <div className="container-shell relative grid min-h-screen items-center gap-8 py-8 lg:grid-cols-[1fr_460px]">
          <div>
            <div className="mb-5 inline-flex rounded-full border border-[#d9ad51]/40 bg-[#d9ad51]/10 px-4 py-2 text-sm font-bold text-[#f5d994]">
              {rtl ? page.badgeAr : page.badge}
            </div>
            <h1 className="max-w-4xl text-4xl font-black leading-tight md:text-7xl">
              {rtl ? page.titleAr : page.title}
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-white/75">
              {rtl ? page.subtitleAr : page.subtitle}
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <span className="text-4xl font-black text-[#d9ad51]">
                {formatMoney(price, country.currency, locale)}
              </span>
              <span className="text-xl text-white/45 line-through">
                {formatMoney(oldPrice, country.currency, locale)}
              </span>
              <span className="flex items-center gap-1 rounded-full bg-white/10 px-3 py-1 text-[#f5d994]">
                <Star className="h-4 w-4 fill-current" />
                {product.rating} ({product.reviews})
              </span>
            </div>
            <div className="mt-7 grid gap-3 sm:grid-cols-3">
              {(rtl ? page.bulletsAr : page.bullets).map((bullet) => (
                <div key={bullet} className="flex items-center gap-2 rounded-2xl bg-white/10 p-3">
                  <CheckCircle2 className="h-5 w-5 text-[#d9ad51]" />
                  <span className="text-sm font-semibold">{bullet}</span>
                </div>
              ))}
            </div>
          </div>

          <form
            onFocus={trackCheckoutOnce}
            onSubmit={submitOrder}
            className="rounded-[2rem] border border-[#d9ad51]/30 bg-white p-5 text-[#15120b] shadow-2xl md:p-7"
          >
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-[#b9872b]">
                  {rtl ? page.offerAr : page.offer}
                </p>
                <h2 className="mt-1 text-2xl font-black">
                  {rtl ? "املأ الطلب الآن" : "Order now"}
                </h2>
              </div>
              <div className="rounded-2xl bg-orange-100 px-4 py-2 font-mono text-xl font-black text-orange-700">
                {time}
              </div>
            </div>
            <div className="mb-4 rounded-2xl bg-amber-50 p-3 text-sm font-bold text-amber-900">
              {rtl ? "متبقي 5 قطع فقط لهذا العرض" : "Only 5 pieces left for this offer"}
            </div>
            <div className="grid gap-3">
              <Input required name="fullName" placeholder={rtl ? "الاسم الكامل" : "Full name"} />
              <Input
                required
                name="phone"
                inputMode="tel"
                value={phone}
                onChange={(event) => setPhone(event.target.value.startsWith("+") ? event.target.value : `+966 ${event.target.value}`)}
                placeholder={rtl ? "رقم الهاتف" : "Phone number"}
                className="ltr-only"
              />
              <Input required name="city" placeholder={rtl ? "المدينة / المنطقة" : "City / region"} />
            </div>
            <Button
              type="submit"
              size="lg"
              className="mt-4 w-full bg-orange-500 text-white hover:bg-orange-600"
              disabled={isSubmitting}
            >
              <Phone className="h-5 w-5" />
              {isSubmitting ? (rtl ? "جاري الإرسال..." : "Sending...") : rtl ? "اضغط هنا للطلب" : "Click here to order"}
            </Button>
            <div className="mt-5 grid gap-2 text-sm text-[#5f5341]">
              <Trust icon={<Truck />} text={rtl ? "توصيل مجاني" : "Free delivery"} />
              <Trust icon={<Banknote />} text={rtl ? "الدفع عند الاستلام" : "Cash on delivery"} />
              <Trust icon={<ShieldCheck />} text={rtl ? "ضمان الاستبدال والاسترجاع" : "Exchange and return guarantee"} />
            </div>
          </form>
        </div>
      </section>

      <section className="container-shell grid gap-8 py-16 lg:grid-cols-3">
        {[product.images[0], product.images[1], product.images[0]].map((image, index) => (
          <div key={`${image}-${index}`} className="relative aspect-[4/5] overflow-hidden rounded-[2rem] bg-muted">
            <Image src={image} alt={product.name} fill loading={index === 0 ? "eager" : "lazy"} className="object-cover" />
          </div>
        ))}
      </section>

      <a
        href="https://wa.me/966500000000"
        target="_blank"
        rel="noopener noreferrer"
        className={`fixed bottom-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500 text-white shadow-2xl ${rtl ? "left-5" : "right-5"}`}
      >
        <MessageCircle className="h-6 w-6" />
      </a>
    </main>
  );
}

function Trust({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[#b9872b] [&_svg]:h-5 [&_svg]:w-5">{icon}</span>
      <span>{text}</span>
    </div>
  );
}
