import Link from "next/link";
import { getProducts, getStalls } from "@/lib/data";
import { CartBar } from "@/components/shared/CartBar";
import type { Stall, Zone } from "@/lib/types";

const ZONES: {
  name: Zone;
  x: number;
  y: number;
  width: number;
  height: number;
  colorVar: string;
}[] = [
  {
    name: "Stadhuis",
    x: 20,
    y: 20,
    width: 160,
    height: 120,
    colorVar: "var(--awning-green)",
  },
  {
    name: "Boschstraat",
    x: 200,
    y: 20,
    width: 100,
    height: 120,
    colorVar: "var(--maastricht-red)",
  },
  {
    name: "Mosae Forum",
    x: 20,
    y: 160,
    width: 280,
    height: 90,
    colorVar: "#8a6f2a",
  },
];

export default async function MapPage() {
  const today = new Date();
  const [stalls, products] = await Promise.all([getStalls(), getProducts()]);

  const byZone = new Map<Zone, Stall[]>();
  for (const stall of stalls) {
    const list = byZone.get(stall.zone) ?? [];
    list.push(stall);
    byZone.set(stall.zone, list);
  }

  return (
    <>
      <div className="flex flex-col gap-6 p-4">
        <h1 className="text-2xl font-bold">Map</h1>

        <svg
          viewBox="0 0 320 270"
          className="w-full rounded-md border border-cobble"
          role="img"
          aria-label="Map of the Markt with three zones: Stadhuis, Boschstraat, Mosae Forum"
        >
          {ZONES.map((zone) => (
            <g key={zone.name}>
              <rect
                x={zone.x}
                y={zone.y}
                width={zone.width}
                height={zone.height}
                rx={6}
                style={{
                  fill: zone.colorVar,
                  fillOpacity: 0.15,
                  stroke: zone.colorVar,
                  strokeWidth: 2,
                }}
              />
              <text
                x={zone.x + 10}
                y={zone.y + 24}
                style={{ fill: "var(--ink)" }}
                fontSize="14"
                fontWeight="bold"
              >
                {zone.name}
              </text>
            </g>
          ))}
        </svg>

        {(["Stadhuis", "Boschstraat", "Mosae Forum"] as Zone[]).map((zone) => {
          const zoneStalls = byZone.get(zone) ?? [];
          if (zoneStalls.length === 0) return null;
          return (
            <section key={zone} className="flex flex-col gap-2">
              <h2 className="text-lg font-bold">{zone}</h2>
              <ul className="flex flex-col divide-y divide-cobble border-y border-cobble">
                {zoneStalls.map((stall) => (
                  <li key={stall.id}>
                    <Link
                      href={`/stalls/${stall.id}`}
                      className="flex items-center gap-3 py-3"
                    >
                      <span className="text-2xl">{stall.emoji}</span>
                      <span className="font-medium">{stall.name}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>
      <CartBar products={products} today={today} />
    </>
  );
}
