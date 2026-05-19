import { Card } from "@/components/ui/card";

export default function AddressesPage() {
  return (
    <section className="container-shell py-10">
      <h1 className="text-4xl font-semibold">Saved addresses</h1>
      <div className="mt-8 grid gap-6 md:grid-cols-2">
        {["Riyadh, Saudi Arabia", "Dubai, United Arab Emirates"].map((address) => (
          <Card key={address} className="p-6">
            <h2 className="font-semibold">Primary address</h2>
            <p className="mt-3 text-muted-foreground">{address}</p>
          </Card>
        ))}
      </div>
    </section>
  );
}
