import { Link } from "@/i18n/routing";

export function Footer({ locale }: { locale: string }) {
  const rtl = locale === "ar";
  return (
    <footer className="border-t border-border bg-muted/40">
      <div className="container-shell grid gap-10 py-12 md:grid-cols-[1.4fr_repeat(3,1fr)]">
        <div>
          <div className="mb-4 text-2xl font-semibold tracking-[0.24em]">
            AURUM
          </div>
          <p className="max-w-sm text-sm leading-7 text-muted-foreground">
            {rtl
              ? "متجر فاخر متعدد الدول والعملات مع تجربة عربية وإنجليزية متكاملة."
              : "Premium multi-country commerce with localized payments, shipping and bilingual experiences."}
          </p>
        </div>
        {[
          ["Shop", "Products", "New arrivals", "Gift cards"],
          ["Account", "Orders", "Addresses", "Profile"],
          ["Markets", "Saudi Arabia", "UAE", "Morocco"],
        ].map((group) => (
          <div key={group[0]}>
            <h3 className="mb-4 font-semibold">{group[0]}</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              {group.slice(1).map((item) => (
                <li key={item}>
                  <Link href="/products">{item}</Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </footer>
  );
}
