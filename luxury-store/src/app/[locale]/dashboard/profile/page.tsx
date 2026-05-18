import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function ProfilePage() {
  return (
    <section className="container-shell py-10">
      <h1 className="text-4xl font-semibold">Profile settings</h1>
      <Card className="mt-8 max-w-2xl space-y-5 p-6">
        <Input placeholder="Full name" defaultValue="Luxury Customer" />
        <Input placeholder="Email" defaultValue="client@example.com" />
        <Button variant="gold">Save changes</Button>
      </Card>
    </section>
  );
}
