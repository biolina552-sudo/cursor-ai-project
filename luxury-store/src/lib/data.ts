import { convertFromUsd } from "./regions";

export type Product = {
  id: string;
  slug: string;
  name: string;
  nameAr: string;
  description: string;
  category: string;
  priceUsd: number;
  images: string[];
  colors: string[];
  sizes: string[];
  rating: number;
  reviews: number;
  featured?: boolean;
  inventory: number;
};

export const categories = [
  { id: "atelier", name: "Atelier Essentials", nameAr: "أساسيات الأتيليه" },
  { id: "fragrance", name: "Signature Fragrance", nameAr: "العطور المميزة" },
  { id: "accessories", name: "Accessories", nameAr: "الإكسسوارات" },
  { id: "home", name: "Home Objects", nameAr: "قطع المنزل" },
];

export const products: Product[] = [
  {
    id: "p1",
    slug: "silk-structured-blazer",
    name: "Silk Structured Blazer",
    nameAr: "بليزر حرير فاخر",
    description:
      "A sculptural evening blazer tailored from heavy silk with a satin lapel and gold hardware.",
    category: "atelier",
    priceUsd: 460,
    images: [
      "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1485968579580-b6d095142e6e?auto=format&fit=crop&w=1200&q=80",
    ],
    colors: ["Black", "Champagne", "Ivory"],
    sizes: ["XS", "S", "M", "L", "XL"],
    rating: 4.9,
    reviews: 128,
    featured: true,
    inventory: 42,
  },
  {
    id: "p2",
    slug: "oud-noir-parfum",
    name: "Oud Noir Parfum",
    nameAr: "عطر عود نوار",
    description:
      "A layered oud, saffron and amber extrait designed for warm evenings and special occasions.",
    category: "fragrance",
    priceUsd: 185,
    images: [
      "https://images.unsplash.com/photo-1619994403073-2cec844b8e63?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=1200&q=80",
    ],
    colors: ["Noir", "Gold"],
    sizes: ["50ml", "100ml"],
    rating: 4.8,
    reviews: 312,
    featured: true,
    inventory: 120,
  },
  {
    id: "p3",
    slug: "monogram-leather-tote",
    name: "Monogram Leather Tote",
    nameAr: "حقيبة جلد مونوغرام",
    description:
      "Full-grain leather tote with brushed gold details, laptop sleeve and detachable pouch.",
    category: "accessories",
    priceUsd: 620,
    images: [
      "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=1200&q=80",
    ],
    colors: ["Espresso", "Black", "Sand"],
    sizes: ["One size"],
    rating: 4.7,
    reviews: 86,
    featured: true,
    inventory: 33,
  },
  {
    id: "p4",
    slug: "marble-candle-set",
    name: "Marble Candle Set",
    nameAr: "مجموعة شموع رخامية",
    description:
      "Hand-poured candles in reusable marble vessels with cedar, fig and amber notes.",
    category: "home",
    priceUsd: 140,
    images: [
      "https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1602874801007-bd458bb1b8b6?auto=format&fit=crop&w=1200&q=80",
    ],
    colors: ["Carrara", "Nero"],
    sizes: ["Set of 3"],
    rating: 4.9,
    reviews: 54,
    inventory: 64,
  },
  {
    id: "p5",
    slug: "cashmere-travel-wrap",
    name: "Cashmere Travel Wrap",
    nameAr: "وشاح كشمير للسفر",
    description:
      "Ultra-soft cashmere wrap finished with tonal fringe for flights, dinners and weekends away.",
    category: "atelier",
    priceUsd: 295,
    images: [
      "https://images.unsplash.com/photo-1543076447-215ad9ba6923?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=80",
    ],
    colors: ["Camel", "Black", "Pearl"],
    sizes: ["One size"],
    rating: 4.6,
    reviews: 77,
    inventory: 90,
  },
  {
    id: "p6",
    slug: "gold-rim-sunglasses",
    name: "Gold Rim Sunglasses",
    nameAr: "نظارات بإطار ذهبي",
    description:
      "Polished acetate sunglasses with fine gold rims and gradient UV-protective lenses.",
    category: "accessories",
    priceUsd: 230,
    images: [
      "https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1508296695146-257a814070b4?auto=format&fit=crop&w=1200&q=80",
    ],
    colors: ["Black", "Tortoise"],
    sizes: ["One size"],
    rating: 4.5,
    reviews: 41,
    inventory: 70,
  },
];

export const testimonials = [
  {
    quote:
      "The experience feels closer to a private luxury appointment than a typical online store.",
    name: "Layla A.",
    country: "UAE",
  },
  {
    quote:
      "Arabic RTL, local pricing and premium packaging made our regional launch effortless.",
    name: "Omar B.",
    country: "Saudi Arabia",
  },
  {
    quote:
      "A refined brand system with operational depth behind the storefront.",
    name: "Nadia M.",
    country: "Morocco",
  },
];

export function getProductBySlug(slug: string) {
  return products.find((product) => product.slug === slug);
}

export function priceForCurrency(product: Product, currency: string) {
  return convertFromUsd(product.priceUsd, currency);
}
