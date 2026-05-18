import { AdminShell } from "@/components/admin/admin-shell";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";

export default function NewProductPage() {
  return (
    <AdminShell title="Add product">
      <form className="grid gap-4 md:grid-cols-2">
        <Input placeholder="Product name" />
        <Input placeholder="Arabic name" />
        <Input placeholder="Slug" />
        <Input placeholder="SKU" />
        <Input placeholder="Price USD" type="number" />
        <Input placeholder="Inventory" type="number" />
        <Input type="file" className="pt-2" />
        <Textarea placeholder="Description" className="md:col-span-2" />
        <Button variant="gold" className="md:col-span-2">
          Save product
        </Button>
      </form>
    </AdminShell>
  );
}
