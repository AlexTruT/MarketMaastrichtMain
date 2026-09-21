/**
 * Courier domain types for Merret.
 *
 * UI state for the courier app. Stops may be mock demo data or live
 * home-delivery orders loaded from Supabase (see lib/courier-live.ts).
 */

/** [latitude, longitude], the order Leaflet expects. */
export type LatLng = [number, number];

export type HandlingTag = "cold" | "fragile" | "floral";

export type DeliveryCluster =
  | "centrum_wyck"
  | "ceramique_randwyck"
  | "brusselsepoort_belfort";

export type FulfilmentType = "home" | "pickup";

export type SubstitutionPreference = "substitute" | "skip" | "call";

/**
 * Lifecycle of a single drop.
 * queued -> riding -> arrived -> delivered, driven by the one primary button.
 */
export type StopStatus = "queued" | "riding" | "arrived" | "delivered";

export interface CourierProfile {
  id: string;
  name: string;
  firstName: string;
  role: string;
  vehicle: string;
  /** Public path to portrait photo, e.g. `/couriers/alex.webp`. */
  avatar: string;
  preferredCluster: DeliveryCluster;
}

export interface HubLocation {
  name: string;
  subtitle: string;
  /** Geocodable address, used as the origin of the first route leg. */
  address: string;
  coords: LatLng;
  windowLabel: string;
}

export interface ClusterMeta {
  cluster: DeliveryCluster;
  title: string;
  shortTitle: string;
  description: string;
  terrain: string;
  crateColor: string;
}

export interface DeliveryItem {
  id: string;
  name: string;
  stallName: string;
  quantity: number;
  unit: string;
  priceCents: number;
  handling: HandlingTag[];
}

export interface ProofOfDrop {
  photoDataUrl?: string;
  latitude?: number;
  longitude?: number;
  notes?: string;
  capturedAt: string;
}

export interface DeliveryStop {
  id: string;
  orderNumber: string;
  packageNumber: string;
  crateNumber: string;
  cluster: DeliveryCluster;
  fulfilment: FulfilmentType;
  deliveryWindow: string;

  customerName: string;
  customerPhone: string;
  address: string;
  /** Second address line: floor, intercom, gate code. */
  addressHint: string;
  /**
   * Neighbourhood-level label. This is all a courier sees before claiming the
   * crate: the exact address and coordinates unlock once the drop is theirs.
   */
  areaLabel: string;
  coords: LatLng;
  deliveryNotes?: string;
  substitution: SubstitutionPreference;

  items: DeliveryItem[];
  handling: HandlingTag[];

  /**
   * Hand-authored cycling path from the previous point in the batch (the hub
   * for the first stop). Google draws the route the courier actually follows;
   * this is only used to estimate distance and ride time up front.
   */
  legFromPrevious: LatLng[];

  status: StopStatus;
  /** Live DB order vs local mock demo stop. */
  source?: "live" | "demo";
  /** Present when source is live — used to write order status back. */
  liveOrderId?: number;
  /** Courier profile id that claimed this stop, undefined while in the pool. */
  assignedTo?: string;
  claimedAt?: string;
  arrivedAt?: string;
  deliveredAt?: string;
  proof?: ProofOfDrop;
}

export interface DeliveryBatch {
  cluster: DeliveryCluster;
  title: string;
  shortTitle: string;
  description: string;
  terrain: string;
  crateColor: string;
  stops: DeliveryStop[];
  distanceMeters: number;
  etaMinutes: number;
  payoutCents: number;
}

export interface ShiftPayout {
  hoursWorked: number;
  drops: number;
  basePayCents: number;
  bonusPayCents: number;
  totalCents: number;
}
