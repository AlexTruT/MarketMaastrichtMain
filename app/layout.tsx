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

export const metadata: Metadata = {
  title: "Merret — the Friday Maastricht market, delivered",
  description:
    "Order fresh from the Maastricht Friday market. Our shopper walks the market for you and couriers deliver it or drop it at a pickup point.",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const today = new Date();
  const products = await getProducts();

  return (
    <html
      lang="en"
      className={`${instrumentSans.variable} ${instrumentSerif.variable} ${permanentMarker.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col overflow-x-hidden bg-paper text-ink">
        <CartProvider>
          <SiteHeader />
          {/* No max-width on the outer shell — hero photo and header bar stay
              full-bleed. Inner page content and header nav share 1200px. */}
          <main className="flex w-full flex-1 flex-col">
            <LayoutCartBar products={products} todayIso={today.toISOString()}>
              {children}
            </LayoutCartBar>
          </main>
          <Toaster />
        </CartProvider>
      </body>
    </html>
  );
}
