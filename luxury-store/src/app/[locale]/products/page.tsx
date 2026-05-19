import { getTranslations } from "next-intl/server";
import { categories, products } from "@/lib/data";
import { ProductCard } from "@/components/product/product-card";
import { Badge, Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default async function ProductsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ q?: string; category?: string; sort?: string; page?: string }>;
}) {
  const { locale } = await params;
  const query = await searchParams;
  const t = await getTranslations("products");
  const search = query.q?.toLowerCase() ?? "";
  const category = query.category ?? "all";
  const sort = query.sort ?? "featured";
  const page = Number(query.page ?? "1");
  const pageSize = 6;

  const filtered = products
    .filter((product) => category === "all" || product.category === category)
    .filter((product) =>
      [product.name, product.nameAr, product.description]
        .join(" ")
        .toLowerCase()
        .includes(search),
    )
    .sort((a, b) => {
      if (sort === "price-asc") return a.priceUsd - b.priceUsd;
      if (sort === "price-desc") return b.priceUsd - a.priceUsd;
      if (sort === "rating") return b.rating - a.rating;
      return Number(Boolean(b.featured)) - Number(Boolean(a.featured));
    });

  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));

  return (
    <section className="container-shell py-10">
      <div className="mb-10">
        <Badge>{t("title")}</Badge>
        <h1 className="mt-4 text-5xl font-semibold tracking-tight">{t("title")}</h1>
        <p className="mt-4 max-w-2xl text-muted-foreground">{t("description")}</p>
      </div>

      <Card className="mb-8 grid gap-4 p-4 md:grid-cols-[1fr_220px_220px]">
        <form>
          <Input name="q" defaultValue={query.q} placeholder={t("search")} />
        </form>
        <form>
          <select
            name="category"
            defaultValue={category}
            className="h-11 w-full rounded-2xl border border-border bg-card px-4"
          >
            <option value="all">{t("all")}</option>
            {categories.map((item) => (
              <option key={item.id} value={item.id}>
                {locale === "ar" ? item.nameAr : item.name}
              </option>
            ))}
          </select>
        </form>
        <form>
          <select
            name="sort"
            defaultValue={sort}
            className="h-11 w-full rounded-2xl border border-border bg-card px-4"
          >
            <option value="featured">Featured</option>
            <option value="price-asc">Price: low to high</option>
            <option value="price-desc">Price: high to low</option>
            <option value="rating">Highest rated</option>
          </select>
        </form>
      </Card>

      <div className="grid gap-6 md:grid-cols-3">
        {paginated.map((product) => (
          <ProductCard key={product.id} product={product} locale={locale} />
        ))}
      </div>

      <div className="mt-10 flex justify-center gap-2">
        {Array.from({ length: totalPages }, (_, index) => (
          <a
            key={index + 1}
            href={`?page=${index + 1}`}
            className={`grid h-10 w-10 place-items-center rounded-full border ${
              page === index + 1 ? "bg-primary text-primary-foreground" : ""
            }`}
          >
            {index + 1}
          </a>
        ))}
      </div>
    </section>
  );
}
