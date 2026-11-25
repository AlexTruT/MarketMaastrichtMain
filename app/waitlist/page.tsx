import type { Metadata } from "next";
import { getCatalogue } from "@/lib/data";
import { WaitlistForm } from "./WaitlistForm";

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

// ?src= (flyer, linkedin...) is read in the browser at submit, so this page
// is prerendered and served from the CDN.
export default async function WaitlistPage() {
  const { demo } = await getCatalogue();
  return <WaitlistForm demo={demo} />;
}
