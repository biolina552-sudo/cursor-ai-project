import crypto from "node:crypto";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

const codOrderSchema = z.object({
  productId: z.string().min(1),
  productName: z.string().min(1),
  value: z.number().nonnegative(),
  currency: z.string().min(3),
  fullName: z.string().min(3),
  phone: z.string().min(7),
  city: z.string().min(2),
  countryCode: z.string().min(2),
  color: z.string().optional(),
  size: z.string().optional(),
});

function hash(value: string) {
  return crypto.createHash("sha256").update(value.trim().toLowerCase()).digest("hex");
}

function isSupabaseConfigured() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.SUPABASE_SERVICE_ROLE_KEY &&
      !process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder") &&
      !process.env.SUPABASE_SERVICE_ROLE_KEY.includes("placeholder"),
  );
}

async function persistOrder(order: z.infer<typeof codOrderSchema> & { orderNumber: string }) {
  if (!isSupabaseConfigured()) {
    return { stored: false, fallback: "preview-mode" };
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  );

  const { error } = await supabase.from("cod_orders").insert({
    order_number: order.orderNumber,
    product_id: order.productId,
    product_name: order.productName,
    customer_name: order.fullName,
    phone: order.phone,
    city: order.city,
    country_code: order.countryCode,
    currency: order.currency,
    value: order.value,
    variant_color: order.color,
    variant_size: order.size,
    status: "pending_confirmation",
  });

  if (error) {
    return { stored: false, fallback: "supabase-error", error: error.message };
  }

  return { stored: true };
}

async function sendGoogleSheets(order: z.infer<typeof codOrderSchema> & { orderNumber: string }) {
  const webhook = process.env.GOOGLE_SHEETS_WEBHOOK_URL;
  if (!webhook) return { synced: false, retry: true };

  try {
    const response = await fetch(webhook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(order),
    });
    return { synced: response.ok, retry: !response.ok };
  } catch {
    return { synced: false, retry: true };
  }
}

async function sendServerSideConversion(order: z.infer<typeof codOrderSchema> & { orderNumber: string }) {
  // Prepared payload for Meta/TikTok/Google CAPI gateways. Hook real endpoints via env vars.
  const payload = {
    event: "Purchase",
    event_id: order.orderNumber,
    value: order.value,
    currency: order.currency,
    user_data: {
      ph: hash(order.phone),
      ct: hash(order.city),
    },
    custom_data: {
      content_id: order.productId,
      content_name: order.productName,
    },
  };

  const endpoint = process.env.SERVER_SIDE_CONVERSIONS_WEBHOOK_URL;
  if (!endpoint) return { sent: false, payload };

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return { sent: response.ok };
  } catch {
    return { sent: false };
  }
}

export async function POST(request: Request) {
  const json = await request.json();
  const parsed = codOrderSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid COD order" }, { status: 400 });
  }

  const order = {
    ...parsed.data,
    orderNumber: `COD-${Date.now().toString(36).toUpperCase()}`,
  };

  const [storage, sheets, conversions] = await Promise.all([
    persistOrder(order),
    sendGoogleSheets(order),
    sendServerSideConversion(order),
  ]);

  return NextResponse.json({
    ok: true,
    orderNumber: order.orderNumber,
    storage,
    sheets,
    conversions,
  });
}
