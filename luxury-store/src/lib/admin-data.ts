import { createClient } from "@supabase/supabase-js";
import { products, categories } from "./data";
import { supportedCountries } from "./regions";

export type AdminProduct = {
  id: string;
  slug: string;
  sku: string;
  nameEn: string;
  nameAr: string;
  category: string;
  stock: number;
  status: "active" | "draft" | "archived";
  priceUsd: number;
  priceSar: number;
  priceAed: number;
  priceMad: number;
  priceEur: number;
};

export type AdminOrder = {
  id: string;
  orderNumber: string;
  customer: string;
  email: string;
  countryCode: string;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  paymentStatus: "paid" | "pending" | "refunded";
  total: number;
  currency: string;
  createdAt: string;
  shippingAddress: string;
  items: { name: string; quantity: number; price: number }[];
};

export type AdminCustomer = {
  id: string;
  name: string;
  email: string;
  countryCode: string;
  orders: number;
  totalSpent: number;
  blocked: boolean;
  addresses: string[];
};

export type AdminDashboardData = {
  stats: {
    totalRevenue: number;
    ordersToday: number;
    newCustomers: number;
    productsCount: number;
  };
  revenue: { day: string; revenue: number; orders: number }[];
  topProducts: { name: string; units: number; revenue: number }[];
  recentOrders: AdminOrder[];
  lowStock: { sku: string; name: string; stock: number }[];
  products: AdminProduct[];
  customers: AdminCustomer[];
};

const sampleProducts: AdminProduct[] = products.map((product, index) => ({
  id: product.id,
  slug: product.slug,
  sku: product.id.toUpperCase(),
  nameEn: product.name,
  nameAr: product.nameAr,
  category: product.category,
  stock: product.inventory,
  status: index % 5 === 0 ? "draft" : index % 4 === 0 ? "archived" : "active",
  priceUsd: product.priceUsd,
  priceSar: Math.round(product.priceUsd * 3.75),
  priceAed: Math.round(product.priceUsd * 3.67),
  priceMad: Math.round(product.priceUsd * 10.05),
  priceEur: Math.round(product.priceUsd * 0.92),
}));

const sampleOrders: AdminOrder[] = [
  {
    id: "ord_10024",
    orderNumber: "AUR-10024",
    customer: "Layla Ahmed",
    email: "layla@example.com",
    countryCode: "AE",
    status: "processing",
    paymentStatus: "paid",
    total: 845,
    currency: "AED",
    createdAt: "2026-05-18",
    shippingAddress: "Downtown Dubai, UAE",
    items: [
      { name: "Silk Structured Blazer", quantity: 1, price: 460 },
      { name: "Oud Noir Parfum", quantity: 2, price: 185 },
    ],
  },
  {
    id: "ord_10018",
    orderNumber: "AUR-10018",
    customer: "Omar Nasser",
    email: "omar@example.com",
    countryCode: "SA",
    status: "shipped",
    paymentStatus: "paid",
    total: 620,
    currency: "SAR",
    createdAt: "2026-05-18",
    shippingAddress: "Olaya, Riyadh, Saudi Arabia",
    items: [{ name: "Monogram Leather Tote", quantity: 1, price: 620 }],
  },
  {
    id: "ord_10011",
    orderNumber: "AUR-10011",
    customer: "Nadia El Fassi",
    email: "nadia@example.com",
    countryCode: "MA",
    status: "pending",
    paymentStatus: "pending",
    total: 295,
    currency: "MAD",
    createdAt: "2026-05-17",
    shippingAddress: "Maarif, Casablanca, Morocco",
    items: [{ name: "Cashmere Travel Wrap", quantity: 1, price: 295 }],
  },
];

const sampleCustomers: AdminCustomer[] = [
  {
    id: "cus_1",
    name: "Layla Ahmed",
    email: "layla@example.com",
    countryCode: "AE",
    orders: 12,
    totalSpent: 8420,
    blocked: false,
    addresses: ["Downtown Dubai, UAE", "Jumeirah, Dubai, UAE"],
  },
  {
    id: "cus_2",
    name: "Omar Nasser",
    email: "omar@example.com",
    countryCode: "SA",
    orders: 8,
    totalSpent: 5210,
    blocked: false,
    addresses: ["Olaya, Riyadh, Saudi Arabia"],
  },
  {
    id: "cus_3",
    name: "Nadia El Fassi",
    email: "nadia@example.com",
    countryCode: "MA",
    orders: 5,
    totalSpent: 2310,
    blocked: true,
    addresses: ["Maarif, Casablanca, Morocco"],
  },
];

const sampleRevenue = Array.from({ length: 30 }, (_, index) => ({
  day: `${index + 1}`,
  revenue: 3800 + Math.round(Math.sin(index / 3) * 900) + index * 135,
  orders: 20 + (index % 7) * 3,
}));

export const adminReferenceData = {
  categories,
  countries: supportedCountries,
  coupons: [
    { code: "VIP15", discount: "15%", status: "active", expires: "2026-06-30" },
    { code: "RAMADAN25", discount: "25%", status: "draft", expires: "2026-03-20" },
    { code: "WELCOME10", discount: "10%", status: "active", expires: "2026-12-31" },
  ],
  pages: ["About", "Contact", "Terms", "Privacy"],
  reviews: [
    { product: "Oud Noir Parfum", rating: 5, author: "Layla", status: "pending" },
    { product: "Cashmere Travel Wrap", rating: 4, author: "Nadia", status: "approved" },
  ],
  notifications: [
    { title: "Low stock alert", body: "Oud Noir Parfum reached 8 units." },
    { title: "Refund requested", body: "AUR-10011 requested a refund review." },
    { title: "New VIP customer", body: "Customer entered VIP segment in UAE." },
  ],
};

function isSupabaseConfigured() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.SUPABASE_SERVICE_ROLE_KEY &&
      !process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder") &&
      !process.env.SUPABASE_SERVICE_ROLE_KEY.includes("placeholder"),
  );
}

export async function getAdminDashboardData(): Promise<AdminDashboardData> {
  if (!isSupabaseConfigured()) {
    return getSampleAdminDashboardData();
  }

  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false } },
    );

    const [{ count: productCount }, { data: orders }, { data: users }] =
      await Promise.all([
        supabase.from("Product").select("*", { count: "exact", head: true }),
        supabase.from("Order").select("*").order("createdAt", { ascending: false }).limit(10),
        supabase.from("User").select("*").order("createdAt", { ascending: false }).limit(10),
      ]);

    if (!orders || !users) {
      return getSampleAdminDashboardData();
    }

    const recentOrders = orders.map((order) => ({
      id: order.id,
      orderNumber: order.orderNumber ?? order.id,
      customer: order.email ?? "Customer",
      email: order.email ?? "",
      countryCode: order.countryCode ?? "SA",
      status: order.status?.toLowerCase?.() ?? "pending",
      paymentStatus: order.status === "PAID" ? "paid" : "pending",
      total: Number(order.total ?? 0),
      currency: order.currency ?? "USD",
      createdAt: String(order.createdAt ?? ""),
      shippingAddress: "",
      items: [],
    })) as AdminOrder[];

    const sample = getSampleAdminDashboardData();
    return {
      ...sample,
      stats: {
        ...sample.stats,
        productsCount: productCount ?? sample.stats.productsCount,
        newCustomers: users.length,
        ordersToday: recentOrders.length,
      },
      recentOrders,
    };
  } catch {
    return getSampleAdminDashboardData();
  }
}

export function getSampleAdminDashboardData(): AdminDashboardData {
  return {
    stats: {
      totalRevenue: 128400,
      ordersToday: 42,
      newCustomers: 18,
      productsCount: sampleProducts.length,
    },
    revenue: sampleRevenue,
    topProducts: [
      { name: "Oud Noir Parfum", units: 312, revenue: 57720 },
      { name: "Silk Structured Blazer", units: 128, revenue: 58880 },
      { name: "Monogram Leather Tote", units: 86, revenue: 53320 },
    ],
    recentOrders: sampleOrders,
    lowStock: sampleProducts
      .slice(0, 4)
      .map((product, index) => ({
        sku: product.sku,
        name: product.nameEn,
        stock: [8, 12, 5, 14][index],
      })),
    products: sampleProducts,
    customers: sampleCustomers,
  };
}

export async function getAdminOrder(id: string) {
  const data = await getAdminDashboardData();
  return data.recentOrders.find((order) => order.id === id) ?? data.recentOrders[0];
}

export async function getAdminCustomer(id: string) {
  const data = await getAdminDashboardData();
  return data.customers.find((customer) => customer.id === id) ?? data.customers[0];
}
