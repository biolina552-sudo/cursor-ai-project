import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "sk_test_placeholder", {
  apiVersion: "2026-04-22.dahlia",
  typescript: true,
});

export const supportedStripeCurrencies = ["usd", "eur", "sar", "aed", "mad"];

export function toStripeAmount(amount: number) {
  return Math.round(amount * 100);
}
