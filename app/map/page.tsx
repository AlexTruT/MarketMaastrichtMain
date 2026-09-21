import Image from "next/image";
import Link from "next/link";
import { getStalls } from "@/lib/data";
import {
  MarktPlan,
  ZONE_CAPTION,
  ZONE_COLOR,
  ZONE_ORDER,
} from "@/components/map/MarktPlan";
import type { Stall, Zone } from "@/lib/types";
import stadhuisPhoto from "@/assets/vrijdagmarkt-stadhuis-maastricht-eighty8things_77138142.webp";
import fishPhoto from "@/assets/markt-vis-maastricht-marketing-hugo-thomassen.webp";
import flowersPhoto from "@/assets/vrijdagmarkt-bloemenkraam-maastricht-eighty8things_958508054.webp";

const ZONE_PHOTO: Record<
  Zone,
  { src: typeof stadhuisPhoto; alt: string }
> = {
  Stadhuis: {
    src: stadhuisPhoto,
    alt: "The Stadhuis on the Markt during the Friday market",
  },
  Boschstraat: {
    src: fishPhoto,
    alt: "Fish stalls on the Boschstraat side of the Markt",
  },
  "Mosae Forum": {
    src: flowersPhoto,
    alt: "A flower stall on the Mosae Forum side of the Markt",
  },
};

export default async function MapPage() {
  const stalls = await getStalls();

  const byZone = new Map<Zone, Stall[]>();
  for (const stall of stalls) {
    byZone.set(stall.zone, [...(byZone.get(stall.zone) ?? []), stall]);
  }

  const numbers = new Map<string, number>();
  let counter = 0;
  for (const zone of ZONE_ORDER) {
    for (const stall of byZone.get(zone) ?? []) {
      numbers.set(stall.id, ++counter);
    }
  }

  return (
    <div className="mx-auto w-full max-w-[1200px]">
      <div className="px-4 pt-8">
        <h1 className="display-lg">Where the stalls stand</h1>
        <p className="max-w-[56ch] pt-3 text-[0.9375rem] leading-relaxed text-ink/70">
          The Stadhuis sits in the middle of the Markt and the stalls fill the
          square around it. Our shopper walks it in this order, which is why
          fish comes back last and coldest.
        </p>
      </div>

      <div className="px-4 pt-7">
        <MarktPlan stalls={stalls} numbers={numbers} />
      </div>

      <div className="flex flex-col gap-12 px-4 pt-10 pb-4">
        {ZONE_ORDER.map((zone) => {
          const zoneStalls = byZone.get(zone) ?? [];
          if (zoneStalls.length === 0) return null;
          const photo = ZONE_PHOTO[zone];
          return (
            <section key={zone}>
              <div className="relative -mx-4 aspect-21/9 overflow-hidden">
                <Image
                  src={photo.src}
                  alt={photo.alt}
                  fill
                  sizes="(max-width: 640px) 100vw, 1200px"
                  placeholder="blur"
                  className="object-cover"
                />
              </div>
              <h2 className="display-md pt-5">{zone}</h2>
              <p className="pt-1 text-[0.8125rem] text-ink/55">
                {ZONE_CAPTION[zone]}
              </p>
              <ul className="pt-3">
                {zoneStalls.map((stall) => (
                  <li
                    key={stall.id}
                    className="border-b border-cobble last:border-0"
                  >
                    <Link
                      href={`/stalls/${stall.id}`}
                      className="flex min-h-11 items-center gap-3 py-3 transition-colors hover:bg-cobble/25"
                    >
                      <span
                        aria-hidden
                        className="grid size-6 shrink-0 place-items-center rounded-full text-[0.6875rem] font-semibold text-paper"
                        style={{ backgroundColor: ZONE_COLOR[zone] }}
                      >
                        {numbers.get(stall.id)}
                      </span>
                      <span className="min-w-0 flex-1 truncate">
                        {stall.name}
                      </span>
                      <span className="shrink-0 text-[0.8125rem] text-ink/50">
                        {stall.owner}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>
    </div>
  );
}
