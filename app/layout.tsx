import type { Metadata } from "next";
import { Instrument_Sans, Permanent_Marker } from "next/font/google";
import Link from "next/link";
import { CartProvider } from "@/lib/cart";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const instrumentSans = Instrument_Sans({
  variable: "--font-sans",
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

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${instrumentSans.variable} ${permanentMarker.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-paper text-ink">
        <CartProvider>
          <header className="sticky top-0 z-40 bg-paper">
            <div
              aria-hidden
              className="h-2 w-full"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(90deg, var(--awning-green) 0 24px, var(--paper) 24px 48px)",
              }}
            />
            <div className="mx-auto flex w-full max-w-[640px] items-center justify-between px-4 py-3">
              <Link href="/" className="text-xl font-bold text-awning">
                Merret
              </Link>
              <nav className="flex items-center gap-4 text-sm font-medium">
                <Link href="/" className="hover:text-awning">
                  Market
                </Link>
                <Link href="/stalls" className="hover:text-awning">
                  Stalls
                </Link>
                <Link href="/map" className="hover:text-awning">
                  Map
                </Link>
              </nav>
            </div>
          </header>
          <main className="mx-auto flex w-full max-w-[640px] flex-1 flex-col">
            {children}
          </main>
          <Toaster />
        </CartProvider>
      </body>
    </html>
  );
}
