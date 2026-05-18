import { AdminPanel, AdminShell } from "@/components/admin/admin-shell";

export default async function AnalyticsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return (
    <AdminShell title={locale === "ar" ? "التحليلات" : "Analytics overview"} locale={locale}>
      <AdminPanel>
        <div className="grid gap-5 md:grid-cols-3">
        {["Top product: Oud Noir", "AOV: $312", "Repeat rate: 38%"].map((metric) => (
          <div key={metric} className="rounded-3xl bg-[#f7f4ed] p-6 text-xl font-semibold">
            {metric}
          </div>
        ))}
        </div>
        <div className="mt-8 h-72 rounded-[2rem] bg-gradient-to-tr from-[#d9ad51]/30 to-transparent p-6">
          <p className="text-sm text-black/55">Revenue chart placeholder</p>
        </div>
      </AdminPanel>
    </AdminShell>
  );
}
