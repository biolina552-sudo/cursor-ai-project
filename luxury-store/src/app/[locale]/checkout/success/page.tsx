import { CheckCircle2, Gift, PhoneCall } from "lucide-react";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { products } from "@/lib/data";

export default async function OrderSuccessPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ cod?: string; order?: string; product?: string }>;
}) {
  const { locale } = await params;
  const query = await searchParams;
  const rtl = locale === "ar";
  const upsell = products[1];

  return (
    <section className="container-shell grid gap-8 py-12 lg:grid-cols-[1fr_0.8fr]">
      <Card className="p-8 text-center lg:p-10">
        <div className="mx-auto mb-6 grid h-20 w-20 place-items-center rounded-full bg-emerald-100 text-emerald-700">
          <CheckCircle2 className="h-10 w-10" />
        </div>
        <h1 className="text-4xl font-semibold">
          {rtl ? "تم استلام طلبك بنجاح" : "Your order was received"}
        </h1>
        <p className="mt-4 text-lg leading-8 text-muted-foreground">
          {rtl
            ? "سيتصل بك أحد موظفينا خلال 24 ساعة لتأكيد العنوان وتفاصيل الشحن. يرجى إبقاء الهاتف قريبًا منك."
            : "Our team will call you within 24 hours to confirm the address and delivery details."}
        </p>
        {query.order ? (
          <p className="mt-4 rounded-full bg-muted px-4 py-2 font-mono text-sm">
            {rtl ? "رقم الطلب" : "Order number"}: {query.order}
          </p>
        ) : null}
        <div className="mt-8 rounded-[2rem] bg-muted p-6 text-start">
          <h2 className="flex items-center gap-2 text-xl font-semibold">
            <PhoneCall className="h-5 w-5 text-accent" />
            {rtl ? "الخطوة القادمة" : "Next step"}
          </h2>
          <ol className="mt-4 list-inside list-decimal space-y-2 text-muted-foreground">
            <li>{rtl ? "تأكيد الطلب عبر مكالمة قصيرة." : "We confirm the order with a short call."}</li>
            <li>{rtl ? "تجهيز المنتج وتغليفه." : "We prepare and package the product."}</li>
            <li>{rtl ? "تسليم الطلب والدفع عند الاستلام." : "You receive the order and pay on delivery."}</li>
          </ol>
        </div>
        <Link href="/dashboard/orders">
          <Button variant="gold" className="mt-8">
            {rtl ? "تتبع الطلب" : "Track order"}
          </Button>
        </Link>
      </Card>

      <Card className="overflow-hidden p-6">
        <div className="mb-5 flex items-center gap-2 text-accent">
          <Gift className="h-5 w-5" />
          <span className="font-bold">
            {rtl ? "عرض خاص بعد الطلب" : "Post-purchase offer"}
          </span>
        </div>
        <h2 className="text-3xl font-semibold">
          {rtl ? "احصل على القطعة الثانية بنصف السعر" : "Get the second item for half price"}
        </h2>
        <p className="mt-4 text-muted-foreground">
          {rtl
            ? `بما أنك أكملت طلبك، يمكنك إضافة ${upsell.nameAr} الآن بعرض خاص قبل الاتصال التأكيدي.`
            : `Since you completed your order, add ${upsell.name} now before the confirmation call.`}
        </p>
        <div className="mt-6 rounded-[2rem] bg-accent/10 p-5">
          <p className="text-sm text-muted-foreground">
            {rtl ? "السعر الخاص" : "Special price"}
          </p>
          <p className="mt-1 text-3xl font-bold text-accent">50% OFF</p>
        </div>
        <Link href={`/products/${upsell.slug}`}>
          <Button variant="gold" size="lg" className="mt-6 w-full">
            {rtl ? "إضافة العرض للطلب" : "Add offer to order"}
          </Button>
        </Link>
      </Card>
    </section>
  );
}
