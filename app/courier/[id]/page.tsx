import { notFound } from "next/navigation";
import { COURIER_PROFILES } from "@/lib/courier-mock-data";
import { CourierApp } from "@/components/courier/CourierApp";

export function generateStaticParams() {
  return COURIER_PROFILES.map((profile) => ({ id: profile.id }));
}

export default async function CourierAppPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const profile = COURIER_PROFILES.find((candidate) => candidate.id === id);

  if (!profile) notFound();

  return <CourierApp profile={profile} />;
}
