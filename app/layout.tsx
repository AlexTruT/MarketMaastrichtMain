import type { Metadata } from "next";
import {
  Instrument_Sans,
  Instrument_Serif,
  Permanent_Marker,
} from "next/font/google";
import { CartProvider } from "@/lib/cart";
import { getProducts } from "@/lib/data";
import { Toaster } from "@/components/ui/sonner";
import { SiteHeader } from "@/components/shared/SiteHeader";
import { SiteFooter } from "@/components/shared/SiteFooter";
import { LayoutCartBar } from "@/components/shared/LayoutCartBar";
import "./globals.css";

const instrumentSans = Instrument_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
});

// Headings only. Same superfamily as the interface sans, so the two read as
// one voice rather than a borrowed display face.
const instrumentSerif = Instrument_Serif({
  variable: "--font-display",
  weight: "400",
  subsets: ["latin"],
});

const permanentMarker = Permanent_Marker({
  variable: "--font-price",
  weight: "400",
  subsets: ["latin"],
});

const siteUrl = "https://merret.vercel.app";
const siteTitle = "Merret — You pick, we deliver";
const siteDescription =
  "Order from the Maastricht Friday market online. Our shopper walks the stalls for you; couriers deliver to your door or drop it at pickup.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: siteTitle,
    template: "%s · Merret",
  },
  description: siteDescription,
  applicationName: "Merret",
  keywords: [
    "Merret",
    "Maastricht",
    "Friday market",
    "market delivery",
    "personal shopper",
  ],
  authors: [{ name: "Ivan" }],
  openGraph: {
    type: "website",
    url: siteUrl,
    siteName: "Merret",
    title: siteTitle,
    description: siteDescription,
    locale: "en_GB",
  },
  twitter: {
    card: "summary_large_image",
    title: siteTitle,
    description: siteDescription,
  },
  alternates: {
    canonical: siteUrl,
  },
};

// Catalogue changes weekly; 60s ISR keeps TTFB low without baking build-time DB.
export const revalidate = 60;

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const today = new Date();
  let products: Awaited<ReturnType<typeof getProducts>> = [];
  try {
    products = await getProducts();
  } catch (err) {
    console.error("[layout] getProducts failed", err);
  }

  return (
    <html
      lang="en"
      className={`${instrumentSans.variable} ${instrumentSerif.variable} ${permanentMarker.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col overflow-x-hidden bg-paper text-ink">
        <CartProvider>
          <SiteHeader
            products={products}
            todayIso={today.toISOString()}
          />
          {/* No max-width on the outer shell — hero photo and header bar stay
              full-bleed. Inner page content and header nav share 1200px. */}
          <main className="flex w-full flex-1 flex-col">
            <LayoutCartBar products={products} todayIso={today.toISOString()}>
              {children}
            </LayoutCartBar>
          </main>
          <SiteFooter />
          <Toaster />
        </CartProvider>
      </body>
    </html>
  );
}
