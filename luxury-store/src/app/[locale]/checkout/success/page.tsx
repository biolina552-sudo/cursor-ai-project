import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function OrderSuccessPage() {
  return (
    <section className="container-shell grid min-h-[60vh] place-items-center py-20">
      <Card className="max-w-xl p-10 text-center">
        <div className="mx-auto mb-6 grid h-16 w-16 place-items-center rounded-full bg-accent text-2xl text-accent-foreground">
          ✓
        </div>
        <h1 className="text-4xl font-semibold">Order confirmed</h1>
        <p className="mt-4 text-muted-foreground">
          Thank you. Your payment was accepted and your order is being prepared.
        </p>
        <Link href="/dashboard/orders">
          <Button variant="gold" className="mt-8">
            View orders
          </Button>
        </Link>
      </Card>
    </section>
  );
}
