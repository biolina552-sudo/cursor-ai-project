# Aurum Luxe Commerce

Professional branded ecommerce storefront built with:

- Next.js 15 App Router + TypeScript
- Tailwind CSS and shadcn-style primitives
- next-intl for English and Arabic with RTL layout support
- Supabase helpers for Auth, database and storage integration
- Prisma ORM with a complete commerce schema
- Stripe Checkout with USD, EUR, SAR, AED and MAD support
- Framer Motion animations, dark/light mode, loading skeletons and toast notifications

## Getting started

```bash
cp .env.example .env.local
npm install
npm run prisma:generate
npm run dev
```

Open:

- English storefront: <http://localhost:3000/en>
- Arabic storefront: <http://localhost:3000/ar>
- Admin dashboard: <http://localhost:3000/en/admin>

## Database

The Prisma schema includes:

- Users
- Products
- Categories
- Orders
- OrderItems
- Reviews
- Addresses
- Countries
- ShippingZones
- Coupons

Run migrations after configuring `DATABASE_URL`:

```bash
npm run prisma:migrate
npm run seed
```

## Production notes

- Configure Supabase Auth providers and storage buckets before enabling writes.
- Configure Stripe webhook handling for asynchronous payment confirmation.
- Move admin authorization checks into middleware or server components using Supabase claims.
- Replace placeholder brand assets with production logo, favicon and OG image.
This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
