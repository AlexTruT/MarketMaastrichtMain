import type { Metadata, Viewport } from "next";
import { Instrument_Sans, Permanent_Marker } from "next/font/google";
import "./globals.css";

const instrumentSans = Instrument_Sans({
  subsets: ["latin"],
  variable: "--font-instrument-sans",
  display: "swap",
});

const permanentMarker = Permanent_Marker({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-permanent-marker",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Merret courier",
  description:
    "Friday market deliveries in Maastricht: claim a crate at the Markt, ride the route, drop it at the door.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#1e5b3f",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${instrumentSans.variable} ${permanentMarker.variable} min-h-dvh bg-canvas font-sans text-ink antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
