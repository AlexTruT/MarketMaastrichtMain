import { COURIER_PROFILES, MARKT_HUB } from "@/lib/courier-mock-data";
import { CourierProfileCard } from "@/components/courier/CourierProfileCard";

export default function CourierPickerPage() {
  return (
    <div className="min-h-dvh bg-paper">
      <main className="mx-auto w-full max-w-160 px-4 py-6">
        <p className="text-[0.8125rem] text-awning">Courier</p>
        <h1 className="display-lg pt-1">Who is riding?</h1>
        <p className="mt-2 max-w-[48ch] text-sm leading-relaxed text-ink/70">
          Pick a courier to open their Friday shift. Crates wait at{" "}
          {MARKT_HUB.name}, packed per neighbourhood, from{" "}
          {MARKT_HUB.windowLabel.replace(/^Crates ready /, "")}.
        </p>

        <ul className="mt-5 flex flex-col gap-3">
          {COURIER_PROFILES.map((profile) => (
            <li key={profile.id}>
              <CourierProfileCard profile={profile} />
            </li>
          ))}
        </ul>

        <p className="mt-6 rounded-xl bg-cobble/30 p-4 text-xs leading-relaxed text-ink/65">
          When the shopper has marked home orders ready, the hub shows those
          real orders and riding them updates their status in the shop.
          Otherwise it runs a demo queue in this browser. The couriers share one
          hub, so a crate Alex takes is gone for Emma, even in another tab.
        </p>
      </main>
    </div>
  );
}
