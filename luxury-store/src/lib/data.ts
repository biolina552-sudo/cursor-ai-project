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

export type LandingPage = {
  id: string;
  slug: string;
  productSlug: string;
  title: string;
  titleAr: string;
  subtitle: string;
  subtitleAr: string;
  offer: string;
  offerAr: string;
  angle: string;
  angleAr: string;
  badge: string;
  badgeAr: string;
  bullets: string[];
  bulletsAr: string[];
  status: "published" | "draft";
  conversionRate: number;
};

export const landingPages: LandingPage[] = [
  {
    id: "lp-oud-cod",
    slug: "oud-noir-cod-offer",
    productSlug: "oud-noir-parfum",
    title: "Oud Noir limited COD offer",
    titleAr: "عرض عود نوار المحدود بالدفع عند الاستلام",
    subtitle:
      "A premium fragrance landing page built for direct response campaigns and fast confirmation calls.",
    subtitleAr:
      "صفحة هبوط لعطر فاخر مصممة لحملات البيع المباشر وتأكيد الطلب بسرعة.",
    offer: "Free delivery + cash on delivery today",
    offerAr: "توصيل مجاني + الدفع عند الاستلام اليوم",
    angle: "For evenings, gifting and luxury daily presence.",
    angleAr: "للمناسبات، الهدايا، والحضور اليومي الفاخر.",
    badge: "Best seller",
    badgeAr: "الأكثر مبيعًا",
    bullets: ["Long-lasting extrait", "Premium gift packaging", "Confirm by phone in 24h"],
    bulletsAr: ["ثبات طويل", "تغليف فاخر للهدايا", "تأكيد هاتفي خلال 24 ساعة"],
    status: "published",
    conversionRate: 7.8,
  },
  {
    id: "lp-blazer-vip",
    slug: "silk-blazer-vip-drop",
    productSlug: "silk-structured-blazer",
    title: "Silk blazer VIP drop",
    titleAr: "إطلاق VIP لبليزر الحرير",
    subtitle:
      "A refined landing page for high-ticket apparel with scarcity and premium trust messaging.",
    subtitleAr:
      "صفحة هبوط لمنتج أزياء فاخر مع عناصر الندرة والثقة.",
    offer: "Limited stock - VIP packaging included",
    offerAr: "كمية محدودة - تغليف VIP مشمول",
    angle: "Tailored for events, dinners and executive style.",
    angleAr: "مصمم للمناسبات والعشاء والإطلالات الرسمية.",
    badge: "VIP drop",
    badgeAr: "إصدار VIP",
    bullets: ["Heavy silk tailoring", "Gold hardware", "Easy size exchange"],
    bulletsAr: ["تفصيل حرير فاخر", "إكسسوارات ذهبية", "استبدال المقاس بسهولة"],
    status: "published",
    conversionRate: 5.9,
  },
];

export const landingSectionTemplates = [
  {
    id: "hero",
    name: "Hero + offer",
    nameAr: "البطل + العرض",
    description: "Headline, product image, price, rating and primary CTA above the fold.",
    descriptionAr: "العنوان، صورة المنتج، السعر، التقييم وزر الطلب فوق الصفحة.",
  },
  {
    id: "video",
    name: "Sales video",
    nameAr: "فيديو البيع",
    description: "Embed TikTok, YouTube, UGC or product demonstration video.",
    descriptionAr: "إضافة فيديو TikTok أو YouTube أو تجربة عميل أو شرح المنتج.",
  },
  {
    id: "benefits",
    name: "Benefits grid",
    nameAr: "شبكة المزايا",
    description: "Short conversion-focused benefits with icons.",
    descriptionAr: "مزايا قصيرة بأيقونات لرفع معدل التحويل.",
  },
  {
    id: "before-after",
    name: "Before / After",
    nameAr: "قبل / بعد",
    description: "Comparison section for visual proof and problem/solution products.",
    descriptionAr: "قسم مقارنة لإظهار النتيجة قبل وبعد.",
  },
  {
    id: "testimonials",
    name: "Testimonials",
    nameAr: "تقييمات العملاء",
    description: "Customer quotes, review screenshots and star ratings.",
    descriptionAr: "آراء العملاء وصور التقييمات والنجوم.",
  },
  {
    id: "faq",
    name: "FAQ",
    nameAr: "الأسئلة الشائعة",
    description: "Handle objections about delivery, COD, returns and product use.",
    descriptionAr: "معالجة اعتراضات التوصيل والدفع والاسترجاع وطريقة الاستخدام.",
  },
  {
    id: "cod-form",
    name: "COD form",
    nameAr: "استمارة الدفع عند الاستلام",
    description: "Three-field quick order form with tracking events.",
    descriptionAr: "استمارة طلب من 3 حقول مع أحداث التتبع.",
  },
  {
    id: "upsell",
    name: "Upsell block",
    nameAr: "عرض إضافي",
    description: "Post-click or post-purchase offer to increase AOV.",
    descriptionAr: "عرض إضافي لرفع متوسط قيمة الطلب.",
  },
];

export function getProductBySlug(slug: string) {
  return products.find((product) => product.slug === slug);
}

export function getLandingPageBySlug(slug: string) {
  return landingPages.find((page) => page.slug === slug);
}

export function priceForCurrency(product: Product, currency: string) {
  return convertFromUsd(product.priceUsd, currency);
}
