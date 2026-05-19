import { NextResponse } from "next/server";
import { addressSchema } from "@/lib/validations";
import { resolveCountry } from "@/lib/regions";
import { stripe, toStripeAmount } from "@/lib/stripe";
import type { CartItem } from "@/lib/cart-store";

export async function POST(request: Request) {
  const body = await request.json();
  const parsedAddress = addressSchema.safeParse(body.address);
  const items = (body.items ?? []) as CartItem[];
  const locale = body.locale === "ar" ? "ar" : "en";

  if (!parsedAddress.success) {
    return NextResponse.json({ error: "Invalid checkout address" }, { status: 400 });
  }
  if (!items.length) {
    return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
  }

  const country = resolveCountry(parsedAddress.data.countryCode);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json({
      url: `${appUrl}/${locale}/checkout/success?demo=true`,
    });
  }

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    locale: locale === "ar" ? "auto" : "en",
    success_url: `${appUrl}/${locale}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${appUrl}/${locale}/checkout`,
    shipping_address_collection: {
      allowed_countries: ["SA", "AE", "MA", "EG", "KW"],
    },
    line_items: items.map((item) => ({
      quantity: item.quantity,
      price_data: {
        currency: country.currency.toLowerCase(),
        product_data: {
          name: item.product.name,
          images: [item.product.images[0]],
          metadata: {
            productId: item.product.id,
            color: item.color ?? "",
            size: item.size ?? "",
          },
        },
        unit_amount: toStripeAmount(
          item.product.priceUsd *
            (country.currency === "SAR"
              ? 3.75
              : country.currency === "AED"
                ? 3.67
                : country.currency === "MAD"
                  ? 10.05
                  : 1),
        ),
      },
    })),
    metadata: {
      countryCode: country.code,
      taxRate: String(country.taxRate),
      shippingMethod: parsedAddress.data.shippingMethod,
    },
  });

  return NextResponse.json({ url: session.url });
}
