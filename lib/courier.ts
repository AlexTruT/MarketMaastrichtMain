import type {
  DeliveryBatch,
  DeliveryCluster,
  DeliveryStop,
  HandlingTag,
  LatLng,
  ShiftPayout,
  SubstitutionPreference,
} from "./courier-types";
import { CLUSTER_META } from "./courier-mock-data";
import { formatEuro } from "./pricing";

/** Average cargo e-bike speed through the Maastricht centre. */
const BIKE_KMH = 15;
/** Handover time on the doorstep: bell, hand over, photo. */
const MINUTES_PER_DROP = 3;

const BASE_HOURLY_RATE_CENTS = 1500;
const DROP_BONUS_CENTS = 400;

// Re-exported so existing courier imports (`from "@/lib/courier"`) keep
// working. formatEuro itself lives in the shared lib/pricing.ts, per
// context.md: "Format only at render time with formatEuro() from lib/pricing.ts."
export { formatEuro };

export function formatDistance(meters: number): string {
  if (meters < 950) return `${Math.round(meters / 10) * 10} m`;
  return `${(meters / 1000).toFixed(1)} km`;
}

export function formatPhone(phone: string): string {
  const digits = phone.replace(/[^\d+]/g, "");
  if (!digits.startsWith("+31") || digits.length !== 12) return phone;
  return `${digits.slice(0, 3)} ${digits.slice(3, 4)} ${digits.slice(4, 6)} ${digits.slice(6, 8)} ${digits.slice(8, 10)} ${digits.slice(10)}`;
}

export function haversineMeters(a: LatLng, b: LatLng): number {
  const earthRadius = 6371000;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(b[0] - a[0]);
  const dLng = toRad(b[1] - a[1]);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a[0])) * Math.cos(toRad(b[0])) * Math.sin(dLng / 2) ** 2;
  return 2 * earthRadius * Math.asin(Math.sqrt(h));
}

export function pathLengthMeters(path: LatLng[]): number {
  let total = 0;
  for (let i = 1; i < path.length; i += 1) {
    total += haversineMeters(path[i - 1], path[i]);
  }
  return total;
}

export function rideMinutes(meters: number): number {
  return Math.max(1, Math.round((meters / 1000 / BIKE_KMH) * 60));
}

export function etaClock(minutesFromNow: number, now: Date = new Date()): string {
  const arrival = new Date(now.getTime() + minutesFromNow * 60000);
  return arrival.toLocaleTimeString("en-NL", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

export function stopTotalCents(stop: DeliveryStop): number {
  return stop.items.reduce((sum, item) => sum + item.priceCents * item.quantity, 0);
}

export function stopItemCount(stop: DeliveryStop): number {
  return stop.items.reduce((sum, item) => sum + item.quantity, 0);
}

/**
 * Bikes cannot ride as the crow flies: canal bridges, one-way streets and the
 * pedestrian centre add roughly a third. Applied to straight-line legs only;
 * hand-traced legs already follow the streets.
 */
const STRAIGHT_LEG_DETOUR = 1.3;

/** Riding distance of one leg, correcting straight-line legs for detours. */
export function legMeters(leg: LatLng[]): number {
  const meters = pathLengthMeters(leg);
  return leg.length <= 2 ? meters * STRAIGHT_LEG_DETOUR : meters;
}

function samePoint(a: LatLng | undefined, b: LatLng): boolean {
  return !!a && haversineMeters(a, b) < 15;
}

/** "12:00 to 13:00" to minutes after midnight of its start, for sorting. */
function windowStartMinutes(window: string): number {
  const match = /(\d{1,2}):(\d{2})/.exec(window);
  return match ? Number(match[1]) * 60 + Number(match[2]) : 24 * 60;
}

/**
 * Riding order for one crate, starting from the hub.
 *
 * Delivery windows are promises to customers, so earlier windows always go
 * first. Inside a window it is greedy nearest neighbour: from wherever the
 * courier is standing, ride to the closest door not yet done. For the three
 * to six drops in a crate this is within a few percent of optimal and easy to
 * explain to a courier ("closest next, but never late").
 *
 * Each stop's leg is re-anchored to where the courier will actually come
 * from. A hand-traced street leg is kept when it starts there already;
 * otherwise it becomes a straight line (see STRAIGHT_LEG_DETOUR).
 */
export function planRoute(stops: DeliveryStop[], start: LatLng): DeliveryStop[] {
  const remaining = [...stops];
  const ordered: DeliveryStop[] = [];
  let here = start;

  while (remaining.length > 0) {
    const earliest = Math.min(
      ...remaining.map((stop) => windowStartMinutes(stop.deliveryWindow)),
    );
    let bestIndex = -1;
    let bestMeters = Infinity;
    remaining.forEach((stop, index) => {
      if (windowStartMinutes(stop.deliveryWindow) !== earliest) return;
      const meters = haversineMeters(here, stop.coords);
      if (meters < bestMeters) {
        bestMeters = meters;
        bestIndex = index;
      }
    });

    const [next] = remaining.splice(bestIndex, 1);
    const leg = samePoint(next.legFromPrevious[0], here)
      ? next.legFromPrevious
      : [here, next.coords];
    ordered.push({ ...next, legFromPrevious: leg });
    here = next.coords;
  }

  return ordered;
}

/** Path the courier rides for the whole batch, hub included. */
export function batchPath(stops: DeliveryStop[]): LatLng[] {
  return stops.flatMap((stop, index) =>
    index === 0 ? stop.legFromPrevious : stop.legFromPrevious.slice(1),
  );
}

export function groupIntoBatches(
  stops: DeliveryStop[],
  hub: LatLng,
): DeliveryBatch[] {
  const clusters: DeliveryCluster[] = [
    "centrum_wyck",
    "ceramique_randwyck",
    "brusselsepoort_belfort",
  ];

  return clusters
    .map((cluster) => {
      const clusterStops = planRoute(
        stops.filter(
          (stop) => stop.cluster === cluster && stop.status === "queued",
        ),
        hub,
      );
      const meta = CLUSTER_META[cluster];
      const distanceMeters = clusterStops.reduce(
        (sum, stop) => sum + legMeters(stop.legFromPrevious),
        0,
      );

      return {
        cluster,
        title: meta.title,
        shortTitle: meta.shortTitle,
        description: meta.description,
        terrain: meta.terrain,
        crateColor: meta.crateColor,
        stops: clusterStops,
        distanceMeters,
        etaMinutes:
          rideMinutes(distanceMeters) + clusterStops.length * MINUTES_PER_DROP,
        payoutCents: clusterStops.length * DROP_BONUS_CENTS,
      };
    })
    .filter((batch) => batch.stops.length > 0);
}

export function calculateShiftPayout(
  hoursWorked: number,
  drops: number,
): ShiftPayout {
  const basePayCents = Math.round(hoursWorked * BASE_HOURLY_RATE_CENTS);
  const bonusPayCents = drops * DROP_BONUS_CENTS;
  return {
    hoursWorked,
    drops,
    basePayCents,
    bonusPayCents,
    totalCents: basePayCents + bonusPayCents,
  };
}

export const SHIFT_RATES = {
  baseHourlyCents: BASE_HOURLY_RATE_CENTS,
  dropBonusCents: DROP_BONUS_CENTS,
};

export function substitutionLabel(pref: SubstitutionPreference): string {
  if (pref === "substitute") return "Substitute the closest match";
  if (pref === "skip") return "Skip the item";
  return "Call me first";
}

export function inferHandlingTags(productName: string): HandlingTag[] {
  const name = productName.toLowerCase();
  const tags: HandlingTag[] = [];
  const matches = (words: string[]) => words.some((word) => name.includes(word));

  if (matches(["mackerel", "makreel", "fish", "vis", "sea bass", "cheese", "kaas", "remoudou", "butter", "boter", "chicken", "meat", "vlees"])) {
    tags.push("cold");
  }
  if (matches(["vlaai", "krentenmik", "bread", "brood", "egg", "eieren", "pastry", "berry", "jar", "stroop"])) {
    tags.push("fragile");
  }
  if (matches(["flower", "bloem", "tulip", "bouquet", "bunch", "plant"])) {
    tags.push("floral");
  }
  return tags;
}

/**
 * Rough centre of each Maastricht four-digit postcode area. Live orders only
 * carry a typed address and we have no geocoder, so this places a door to
 * within a few hundred metres: plenty to pick a crate and order the drops.
 * Google Maps geocodes the exact door when the courier rides.
 */
const POSTCODE_AREAS: Record<string, { cluster: DeliveryCluster; coords: LatLng }> = {
  "6211": { cluster: "centrum_wyck", coords: [50.8505, 5.689] }, // Binnenstad
  "6219": { cluster: "centrum_wyck", coords: [50.868, 5.69] }, // Boschpoort
  "6221": { cluster: "centrum_wyck", coords: [50.848, 5.7] }, // Wyck
  "6222": { cluster: "centrum_wyck", coords: [50.857, 5.708] }, // Wittevrouwenveld
  "6223": { cluster: "centrum_wyck", coords: [50.87, 5.705] }, // Meerssenhoven
  "6224": { cluster: "centrum_wyck", coords: [50.856, 5.72] }, // Wyckerpoort
  "6225": { cluster: "ceramique_randwyck", coords: [50.848, 5.724] }, // Scharn
  "6226": { cluster: "ceramique_randwyck", coords: [50.837, 5.725] }, // Heer
  "6227": { cluster: "ceramique_randwyck", coords: [50.833, 5.715] }, // Heugem
  "6228": { cluster: "ceramique_randwyck", coords: [50.82, 5.705] }, // Heugemerveld
  "6229": { cluster: "ceramique_randwyck", coords: [50.838, 5.705] }, // Randwyck
  "6212": { cluster: "brusselsepoort_belfort", coords: [50.844, 5.688] }, // Jekerkwartier
  "6213": { cluster: "brusselsepoort_belfort", coords: [50.852, 5.676] }, // Brusselsepoort
  "6214": { cluster: "brusselsepoort_belfort", coords: [50.857, 5.665] }, // Belfort
  "6215": { cluster: "brusselsepoort_belfort", coords: [50.864, 5.668] }, // Caberg
  "6216": { cluster: "brusselsepoort_belfort", coords: [50.86, 5.653] }, // Malberg
  "6217": { cluster: "brusselsepoort_belfort", coords: [50.839, 5.678] }, // Sint Pieter
  "6218": { cluster: "brusselsepoort_belfort", coords: [50.866, 5.68] }, // Pottenberg
};

const CLUSTER_CENTRES: Record<DeliveryCluster, LatLng> = {
  centrum_wyck: [50.84905, 5.69895],
  ceramique_randwyck: [50.84555, 5.70285],
  brusselsepoort_belfort: [50.84695, 5.68505],
};

function postcodeArea(address: string) {
  const match = /\b(62\d{2})\s?[a-z]{2}\b/i.exec(address);
  return match ? POSTCODE_AREAS[match[1]] : undefined;
}

export function clusterForAddress(address: string): DeliveryCluster {
  const value = address.toLowerCase();
  // Street names first: Céramique shares 6221 with Wyck but rides with Randwyck.
  if (/ceramique|céramique|sphinx|bonnefanten|randwyck|heugem|oxfordlaan|universiteitssingel|plein 1992/.test(value)) {
    return "ceramique_randwyck";
  }
  if (/wyck|rechtstraat|gracht|markt|vrijthof|stokstraat|stationsstraat/.test(value)) {
    return "centrum_wyck";
  }
  if (/brusselse|tongerse|sint pieter|belfort|mariaberg|jeker/.test(value)) {
    return "brusselsepoort_belfort";
  }
  // Unknown streets fall back to the postcode, then to the central crate,
  // which is the shortest ride from the hub.
  return postcodeArea(address)?.cluster ?? "centrum_wyck";
}

/** Best guess at where a typed address is, for crate planning only. */
export function coordsForAddress(address: string, cluster: DeliveryCluster): LatLng {
  const area = postcodeArea(address);
  return area && area.cluster === cluster ? area.coords : CLUSTER_CENTRES[cluster];
}

/** Hands the drop over to the phone's own Google Maps app, in cycling mode. */
export function bicycleNavigationUrl(stop: DeliveryStop): string {
  const params = new URLSearchParams({
    api: "1",
    destination: stop.address,
    travelmode: "bicycling",
  });
  return `https://www.google.com/maps/dir/?${params.toString()}`;
}

/**
 * Google Maps directions, embeddable without an API key.
 *
 * Addresses are passed as text rather than coordinates so Google geocodes the
 * real door and labels the route with the street the courier is looking for.
 * `dirflg=b` asks for the cycling route.
 */
export function googleDirectionsEmbedUrl(
  originAddress: string,
  destinationAddress: string,
): string {
  const params = new URLSearchParams({
    saddr: originAddress,
    daddr: destinationAddress,
    dirflg: "b",
    output: "embed",
  });
  return `https://www.google.com/maps?${params.toString()}`;
}
