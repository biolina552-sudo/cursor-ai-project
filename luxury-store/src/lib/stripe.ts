import Stripe from "stripe";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY?.trim() || "sk_test_placeholder";

export const stripe = new Stripe(stripeSecretKey, {
  apiVersion: "2026-04-22.dahlia",
  typescript: true,
});

export const supportedStripeCurrencies = ["usd", "eur", "sar", "aed", "mad"];

export function toStripeAmount(amount: number) {
  return Math.round(amount * 100);
}
