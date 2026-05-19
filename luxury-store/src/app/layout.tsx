import type { Metadata } from "next";
import { Geist_Mono, Montserrat, Tajawal } from "next/font/google";
import "./globals.css";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const tajawal = Tajawal({
  variable: "--font-tajawal",
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "700", "800"],
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ?? "https://luxury-store.example.com",
  ),
  title: {
    default: "Aurum Luxe Commerce",
    template: "%s | Aurum Luxe Commerce",
  },
  description:
    "A premium multi-country ecommerce storefront with Arabic and English support.",
  openGraph: {
    title: "Aurum Luxe Commerce",
    description:
      "Luxury ecommerce experience with regional pricing, shipping, tax, and payments.",
    type: "website",
    images: ["/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${montserrat.variable} ${tajawal.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full bg-background text-foreground">{children}</body>
    </html>
  );
}
