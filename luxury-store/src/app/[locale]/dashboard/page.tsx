import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { Card } from "@/components/ui/card";

export default async function DashboardPage() {
  const t = await getTranslations("dashboard");
  return (
    <section className="container-shell py-10">
      <h1 className="text-5xl font-semibold">{t("title")}</h1>
      <div className="mt-8 grid gap-6 md:grid-cols-3">
        {[
          [t("orders"), "/dashboard/orders", "Track paid, shipped and delivered orders."],
          [t("profile"), "/dashboard/profile", "Manage name, email and preferences."],
          [t("addresses"), "/dashboard/addresses", "Save addresses for regional checkout."],
        ].map(([title, href, body]) => (
          <Link key={href} href={href}>
            <Card className="h-full p-6 transition hover:-translate-y-1 hover:shadow-xl">
              <h2 className="text-2xl font-semibold">{title}</h2>
              <p className="mt-3 text-sm text-muted-foreground">{body}</p>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  );
}
