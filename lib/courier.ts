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

/** Average cargo e-bike speed through the Maastricht centre. */
const BIKE_KMH = 15;
/** Handover time on the doorstep: bell, hand over, photo. */
const MINUTES_PER_DROP = 3;

const BASE_HOURLY_RATE_CENTS = 1500;
const DROP_BONUS_CENTS = 400;

export function formatEuro(cents: number): string {
  return `€${(cents / 100).toFixed(2)}`;
}

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

/** Path the courier rides for the whole batch, hub included. */
export function batchPath(stops: DeliveryStop[]): LatLng[] {
  return stops.flatMap((stop, index) =>
    index === 0 ? stop.legFromPrevious : stop.legFromPrevious.slice(1),
  );
}

export function groupIntoBatches(stops: DeliveryStop[]): DeliveryBatch[] {
  const clusters: DeliveryCluster[] = [
    "centrum_wyck",
    "ceramique_randwyck",
    "brusselsepoort_belfort",
  ];

  return clusters
    .map((cluster) => {
      const clusterStops = stops.filter(
        (stop) => stop.cluster === cluster && stop.status === "queued",
      );
      const meta = CLUSTER_META[cluster];
      const distanceMeters = pathLengthMeters(batchPath(clusterStops));

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

export function clusterForAddress(address: string): DeliveryCluster {
  const value = address.toLowerCase();
  if (/wyck|rechtstraat|gracht|markt|vrijthof|stokstraat|stationsstraat/.test(value)) {
    return "centrum_wyck";
  }
  if (/ceramique|céramique|randwyck|heugem|oxfordlaan|universiteit|plein 1992/.test(value)) {
    return "ceramique_randwyck";
  }
  return "brusselsepoort_belfort";
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
