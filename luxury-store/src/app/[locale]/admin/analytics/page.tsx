import { AdminShell } from "@/components/admin/admin-shell";

export default function AnalyticsPage() {
  return (
    <AdminShell title="Analytics overview">
      <div className="grid gap-5 md:grid-cols-3">
        {["Top product: Oud Noir", "AOV: $312", "Repeat rate: 38%"].map((metric) => (
          <div key={metric} className="rounded-3xl bg-muted p-6 text-xl font-semibold">
            {metric}
          </div>
        ))}
      </div>
      <div className="mt-8 h-72 rounded-[2rem] bg-gradient-to-tr from-accent/30 to-transparent p-6">
        <p className="text-sm text-muted-foreground">Revenue chart placeholder</p>
      </div>
    </AdminShell>
  );
}
