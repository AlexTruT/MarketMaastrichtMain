import type { Metadata } from "next";
import { WaitlistForm } from "./WaitlistForm";
import { cleanSource } from "./options";

const title = "Merret wachtlijst";
const description =
  "De vrijdagmarkt, bij jou thuis. Zet je op de wachtlijst voor Merret in Maastricht.";
const url = "https://merret.vercel.app/waitlist";

export const metadata: Metadata = {
  title: { absolute: title },
  description,
  openGraph: { title, description, url, locale: "nl_NL" },
  twitter: { title, description },
  alternates: { canonical: url },
};

export default async function WaitlistPage({
  searchParams,
}: {
  searchParams: Promise<{ src?: string | string[] }>;
}) {
  const { src } = await searchParams;
  return <WaitlistForm source={cleanSource(Array.isArray(src) ? src[0] : src)} />;
}
