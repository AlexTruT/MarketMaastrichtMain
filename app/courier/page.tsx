import Link from "next/link";
import { CLUSTER_META, COURIER_PROFILES, MARKT_HUB } from "@/lib/courier-mock-data";
import { AwningStripe } from "@/components/courier/CourierTopBar";

export default function CourierPickerPage() {
  return (
    <div className="min-h-dvh bg-canvas">
      <AwningStripe />

      <main className="mx-auto w-full max-w-160 px-4 py-6">
        <h1 className="text-2xl font-bold tracking-tight">Who is riding?</h1>
        <p className="mt-1 text-sm text-ink-soft">
          Pick a courier to open their Friday shift. Crates wait at{" "}
          {MARKT_HUB.name.toLowerCase()}.
        </p>

        <ul className="mt-5 flex flex-col gap-3">
          {COURIER_PROFILES.map((profile) => (
            <li key={profile.id}>
              <Link
                href={`/courier/${profile.id}`}
                className="flex items-center gap-3.5 rounded-2xl bg-paper p-4 ring-1 ring-cobble active:scale-[0.99]"
              >
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-awning-tint text-2xl">
                  {profile.avatar}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-bold">{profile.name}</p>
                  <p className="truncate text-xs text-ink-soft">
                    {profile.role} · {profile.vehicle}
                  </p>
                  <p className="mt-0.5 truncate text-xs text-ink-faint">
                    Usually rides {CLUSTER_META[profile.preferredCluster].title}
                  </p>
                </div>
                <span className="shrink-0 text-ink-faint" aria-hidden>
                  →
                </span>
              </Link>
            </li>
          ))}
        </ul>

        <p className="mt-6 rounded-2xl bg-paper p-4 text-xs leading-relaxed text-ink-soft ring-1 ring-cobble">
          This screen runs entirely on demo data in your browser. Claiming a
          crate, riding the route and confirming a drop all work offline, so
          nothing depends on the database yet.
        </p>
      </main>
    </div>
  );
}
