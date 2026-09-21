import Link from "next/link";
import { AwningStripe } from "@/components/courier/CourierTopBar";

export default function HomePage() {
  return (
    <div className="min-h-dvh bg-canvas">
      <AwningStripe />

      <main className="mx-auto w-full max-w-160 px-4 py-8">
        <h1 className="text-3xl font-bold tracking-tight">Merret</h1>
        <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">
          The Maastricht Friday market, ordered online. Our shopper walks the
          Markt with the combined list, student couriers bring it to the door.
        </p>

        <Link
          href="/courier"
          className="mt-6 flex items-center gap-3 rounded-2xl bg-paper p-4 ring-1 ring-cobble active:scale-[0.99]"
        >
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-awning-tint text-2xl">
            🚴
          </span>
          <span className="min-w-0 flex-1">
            <span className="block font-bold">Courier app</span>
            <span className="block text-xs text-ink-soft">
              Claim a crate, ride the route on the map, drop it with proof
            </span>
          </span>
          <span className="shrink-0 text-ink-faint" aria-hidden>
            →
          </span>
        </Link>

        <p className="mt-6 text-xs leading-relaxed text-ink-faint">
          The customer side of the market lives in the routes described in
          context.md and is not built yet.
        </p>
      </main>
    </div>
  );
}
