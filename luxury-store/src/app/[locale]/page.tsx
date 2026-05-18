import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { ArrowRight, Globe2, ShieldCheck, Sparkles } from "lucide-react";
import { Link } from "@/i18n/routing";
import { categories, products, testimonials } from "@/lib/data";
import { supportedCountries } from "@/lib/regions";
import { Button } from "@/components/ui/button";
import { Badge, Card } from "@/components/ui/card";
import { ProductCard } from "@/components/product/product-card";
import { Input } from "@/components/ui/input";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("home");
  const rtl = locale === "ar";

  return (
    <>
      <section className="luxury-gradient text-white">
        <div className="container-shell grid min-h-[720px] items-center gap-12 py-16 lg:grid-cols-[1fr_0.86fr]">
          <div>
            <Badge className="border-accent/40 bg-white/10 text-accent">
              {t("eyebrow")}
            </Badge>
            <h1 className="mt-6 max-w-4xl text-5xl font-semibold tracking-tight md:text-7xl">
              {t("title")}
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-white/70">
              {t("description")}
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link href="/products">
                <Button variant="gold" size="lg">
                  {t("shopNow")}
                  <ArrowRight className={`h-4 w-4 ${rtl ? "rotate-180" : ""}`} />
                </Button>
              </Link>
              <Link href="/admin">
                <Button variant="outline" size="lg" className="border-white/20 text-white">
                  {t("admin")}
                </Button>
              </Link>
            </div>
            <div className="mt-12 grid gap-4 sm:grid-cols-3">
              {[
                ["5", "markets"],
                ["24h", "admin ops"],
                ["5", "currencies"],
              ].map(([value, label]) => (
                <div key={label} className="rounded-3xl border border-white/10 p-5">
                  <div className="text-3xl font-semibold text-accent">{value}</div>
                  <div className="text-sm text-white/60">{label}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="relative min-h-[560px]">
            <Image
              src="https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1200&q=80"
              alt="Luxury editorial collection"
              fill
              priority
              className="rounded-[3rem] object-cover"
            />
            <div className="absolute bottom-6 left-6 right-6 rounded-[2rem] border border-white/15 bg-black/45 p-6 backdrop-blur-xl">
              <p className="text-sm uppercase tracking-[0.26em] text-accent">
                Regional commerce engine
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {supportedCountries.map((country) => (
                  <span key={country.code} className="rounded-full bg-white/10 px-3 py-1 text-sm">
                    {rtl ? country.nameAr : country.name}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container-shell py-20">
        <div className="mb-10 flex items-end justify-between gap-6">
          <div>
            <Badge>{t("featured")}</Badge>
            <h2 className="mt-4 text-4xl font-semibold tracking-tight">
              Signature pieces
            </h2>
          </div>
          <Link href="/products" className="text-sm font-semibold text-accent">
            View all
          </Link>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {products.filter((product) => product.featured).map((product) => (
            <ProductCard key={product.id} product={product} locale={locale} />
          ))}
        </div>
      </section>

      <section className="bg-muted/50 py-20">
        <div className="container-shell">
          <Badge>{t("categories")}</Badge>
          <div className="mt-8 grid gap-5 md:grid-cols-4">
            {categories.map((category, index) => (
              <Card key={category.id} className="p-6">
                <div className="mb-10 flex h-12 w-12 items-center justify-center rounded-full bg-accent/15 text-accent">
                  {index === 0 ? <Sparkles /> : index === 1 ? <ShieldCheck /> : <Globe2 />}
                </div>
                <h3 className="text-xl font-semibold">
                  {rtl ? category.nameAr : category.name}
                </h3>
                <p className="mt-3 text-sm text-muted-foreground">
                  Curated, shoppable and ready for regional campaigns.
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="container-shell py-20">
        <Badge>{t("testimonials")}</Badge>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {testimonials.map((testimonial) => (
            <Card key={testimonial.name} className="p-6">
              <p className="text-lg leading-8">“{testimonial.quote}”</p>
              <p className="mt-6 text-sm font-semibold text-accent">
                {testimonial.name} · {testimonial.country}
              </p>
            </Card>
          ))}
        </div>
      </section>

      <section className="container-shell pb-20">
        <div className="rounded-[3rem] bg-primary p-8 text-primary-foreground md:p-12">
          <div className="grid items-center gap-8 md:grid-cols-[1fr_0.8fr]">
            <div>
              <Badge className="border-white/20 bg-white/10 text-accent">
                {t("newsletter")}
              </Badge>
              <h2 className="mt-5 text-4xl font-semibold">
                Private drops, market insights and VIP offers.
              </h2>
            </div>
            <form className="flex gap-3 rounded-full bg-white p-2">
              <Input type="email" placeholder="you@example.com" className="border-0 text-black" />
              <Button variant="gold">Subscribe</Button>
            </form>
          </div>
        </div>
      </section>
    </>
  );
}
