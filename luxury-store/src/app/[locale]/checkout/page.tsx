import { getTranslations } from "next-intl/server";
import { CheckoutForm } from "@/components/cart/checkout-form";
import { Badge } from "@/components/ui/card";

export default async function CheckoutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("checkout");

  return (
    <section className="container-shell py-10">
      <Badge>{t("payment")}</Badge>
      <h1 className="mt-4 text-5xl font-semibold tracking-tight">{t("title")}</h1>
      <p className="mt-4 max-w-2xl text-muted-foreground">
        Region-aware taxes and shipping are calculated before redirecting to Stripe.
      </p>
      <div className="mt-10">
        <CheckoutForm locale={locale} />
      </div>
    </section>
  );
}
