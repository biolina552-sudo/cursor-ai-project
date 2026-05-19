import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Link } from "@/i18n/routing";

export function AuthCard({ mode }: { mode: "login" | "register" | "forgot" }) {
  const title =
    mode === "login"
      ? "Welcome back"
      : mode === "register"
        ? "Create your account"
        : "Reset your password";

  return (
    <section className="container-shell grid min-h-[70vh] place-items-center py-16">
      <Card className="w-full max-w-md p-8">
        <h1 className="text-3xl font-semibold">{title}</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Supabase Auth ready form. Connect project keys in `.env.local`.
        </p>
        <form className="mt-8 grid gap-4">
          <Input type="email" placeholder="Email" />
          {mode !== "forgot" ? <Input type="password" placeholder="Password" /> : null}
          <Button variant="gold" size="lg" type="submit">
            {mode === "login" ? "Login" : mode === "register" ? "Register" : "Send reset link"}
          </Button>
        </form>
        <div className="mt-6 flex justify-between text-sm text-muted-foreground">
          <Link href="/auth/login">Login</Link>
          <Link href="/auth/register">Register</Link>
          <Link href="/auth/forgot-password">Forgot?</Link>
        </div>
      </Card>
    </section>
  );
}
