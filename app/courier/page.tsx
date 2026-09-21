import { CLUSTER_META, COURIER_PROFILES, MARKT_HUB } from "@/lib/courier-mock-data";
import { CourierProfileCard } from "@/components/courier/CourierProfileCard";

export default function CourierPickerPage() {
  return (
    <div className="min-h-dvh bg-paper">
      <main className="mx-auto w-full max-w-160 px-4 py-6">
        <p className="text-[0.8125rem] text-awning">Courier</p>
        <h1 className="display-lg pt-1">Who is riding?</h1>
        <p className="mt-2 max-w-[48ch] text-sm leading-relaxed text-ink/70">
          Pick a courier to open their Friday shift. Name, bike and preferred
          neighbourhood are on each card. Crates wait at{" "}
          {MARKT_HUB.name}.
        </p>

        <ul className="mt-5 flex flex-col gap-3">
          {COURIER_PROFILES.map((profile) => (
            <li key={profile.id}>
              <CourierProfileCard profile={profile} />
            </li>
          ))}
        </ul>

        <p className="mt-6 rounded-md bg-cobble/30 p-4 text-xs leading-relaxed text-ink/65">
          Demo shift only — claim a crate, ride the route and confirm a drop in
          the browser. Nothing is written to the database yet.{" "}
          {CLUSTER_META.centrum_wyck.title} is Alex&apos;s usual run; Emma covers{" "}
          {CLUSTER_META.ceramique_randwyck.shortTitle}; Lucas rides{" "}
          {CLUSTER_META.brusselsepoort_belfort.shortTitle}.
        </p>
      </main>
    </div>
  );
}
