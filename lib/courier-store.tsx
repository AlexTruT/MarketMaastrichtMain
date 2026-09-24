"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type {
  DeliveryBatch,
  DeliveryCluster,
  DeliveryStop,
  ProofOfDrop,
} from "./courier-types";
import {
  DEMO_STOPS,
  INCOMING_STOP_TEMPLATES,
} from "./courier-mock-data";
import { groupIntoBatches, pathLengthMeters, rideMinutes } from "./courier";
import {
  loadCourierReadyStops,
  setCourierOrderStatus,
} from "@/app/courier/actions";

/**
 * A leg that would really take eight minutes is compressed to this, so the
 * courier marker visibly moves during a demo instead of crawling.
 */
const RIDE_DEMO_MS = 40000;

/** Couriers are on a two hour guaranteed block during the demo shift. */
const GUARANTEED_HOURS = 2;

const FIRST_INCOMING_ORDER = 1051;

// v2: ride clock moved onto each stop and shift clocks keyed per courier, so
// two couriers sharing one browser no longer overwrite each other's timers.
const STORAGE_KEY = "merret-courier-v2";

/**
 * One demo world shared by every courier on this browser: the hub pool, who
 * claimed what, and each courier's shift start.
 */
interface PersistedState {
  stops: DeliveryStop[];
  /** Courier id to ISO time the shift started. */
  shifts: Record<string, string>;
  nextOrderNumber: number;
  /** When true, hub is showing live DB stops rather than mock demo data. */
  liveMode: boolean;
}

export type LiveStatus = "demo" | "live" | "locked";

/** The crate the courier is riding right now. */
export interface CurrentCrate {
  stops: DeliveryStop[];
  deliveredCount: number;
  /** The drop just finished, where the current leg starts. Null means the hub. */
  previousStop: DeliveryStop | null;
}

interface CourierStoreValue {
  courierId: string;
  ready: boolean;
  liveStatus: LiveStatus;
  liveError: string | null;
  refreshing: boolean;
  lastRefreshedAt: string | null;

  /** Unclaimed batches still sitting at the Markt hub. */
  batches: DeliveryBatch[];
  /** Stops this courier is carrying, in riding order. */
  myStops: DeliveryStop[];
  currentStop: DeliveryStop | null;
  currentCrate: CurrentCrate | null;
  /** Everything this courier delivered this shift, oldest first. */
  deliveredStops: DeliveryStop[];

  /** 0 to 1 along the current leg. */
  progress: number;
  minutesToCurrentStop: number;

  hoursWorked: number;
  incomingAlert: string | null;

  claimBatch: (cluster: DeliveryCluster) => void;
  startRide: () => void;
  markArrived: () => void;
  completeDrop: (proof: Omit<ProofOfDrop, "capturedAt">) => void;
  pushIncomingOrder: () => void;
  dismissAlert: () => void;
  resetShift: () => void;
  refreshLiveStops: () => Promise<void>;
}

const CourierStoreContext = createContext<CourierStoreValue | null>(null);

function freshDemoStops(): DeliveryStop[] {
  return DEMO_STOPS.map((stop) => ({ ...stop, source: "demo" as const }));
}

/**
 * Swap in a new hub pool without touching anything a courier already holds.
 *
 * Claimed stops (riding or delivered) are shift history and earnings, so they
 * always survive. Orders the coordinator pushed mid-demo survive while the
 * hub stays on demo data.
 */
function mergePool(
  previous: DeliveryStop[],
  incoming: DeliveryStop[],
): DeliveryStop[] {
  const claimed = previous.filter((stop) => stop.assignedTo);
  const taken = new Set(claimed.map((stop) => stop.id));
  const incomingIds = new Set(incoming.map((stop) => stop.id));
  const incomingIsDemo = incoming.every((stop) => stop.source !== "live");
  const pushedExtras = incomingIsDemo
    ? previous.filter(
        (stop) =>
          !stop.assignedTo &&
          stop.source === "demo" &&
          !incomingIds.has(stop.id),
      )
    : [];

  return [
    ...claimed,
    ...incoming.filter((stop) => !taken.has(stop.id)),
    ...pushedExtras,
  ];
}

function isPersistedState(value: unknown): value is PersistedState {
  if (!value || typeof value !== "object") return false;
  const state = value as Partial<PersistedState>;
  return (
    Array.isArray(state.stops) &&
    !!state.shifts &&
    typeof state.shifts === "object" &&
    typeof state.nextOrderNumber === "number"
  );
}

function readPersisted(): PersistedState | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    return isPersistedState(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function writePersisted(state: PersistedState) {
  try {
    const raw = JSON.stringify(state);
    // Skipping identical writes keeps two open tabs from echoing each
    // other's storage events forever.
    if (window.localStorage.getItem(STORAGE_KEY) === raw) return;
    window.localStorage.setItem(STORAGE_KEY, raw);
  } catch {
    // Most likely the quota. Keep the shift and drop the proof photos, which
    // are the only large thing in here, rather than stop saving altogether.
    try {
      const lean = {
        ...state,
        stops: state.stops.map((stop) =>
          stop.proof?.photoDataUrl
            ? { ...stop, proof: { ...stop.proof, photoDataUrl: undefined } }
            : stop,
        ),
      };
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(lean));
    } catch {
      // Private browsing: the demo keeps working in memory.
    }
  }
}

/**
 * What the courier picker shows on each card, read straight from storage so
 * the picker page needs no provider.
 */
export function readCourierSummary(
  courierId: string,
): { toGo: number; delivered: number } | null {
  const state = readPersisted();
  if (!state) return null;
  const mine = state.stops.filter((stop) => stop.assignedTo === courierId);
  const delivered = mine.filter((stop) => stop.status === "delivered").length;
  return { toGo: mine.length - delivered, delivered };
}

export function CourierStoreProvider({
  courierId,
  children,
}: {
  courierId: string;
  children: React.ReactNode;
}) {
  const [stops, setStops] = useState<DeliveryStop[]>(freshDemoStops);
  const [shifts, setShifts] = useState<Record<string, string>>({});
  const [nextOrderNumber, setNextOrderNumber] = useState(FIRST_INCOMING_ORDER);
  const [liveMode, setLiveMode] = useState(false);
  const [incomingAlert, setIncomingAlert] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [locked, setLocked] = useState(false);
  const [liveError, setLiveError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefreshedAt, setLastRefreshedAt] = useState<string | null>(null);
  // Fast tick while riding (the marker moves), slow tick otherwise (hours).
  const [now, setNow] = useState(0);

  const shiftStartedAt = shifts[courierId] ?? "";

  /** Fetch live orders and fold them (or the demo queue) into the hub pool. */
  const loadPool = useCallback(async () => {
    const result = await loadCourierReadyStops().catch(() => ({
      stops: [] as DeliveryStop[],
      error: "Could not reach the server.",
      locked: false,
    }));
    const isLive = result.stops.length > 0;
    const incoming = isLive ? result.stops : freshDemoStops();

    setStops((previous) => mergePool(previous, incoming));
    setLiveMode(isLive);
    setLocked(result.locked);
    setLiveError(result.error);
    setLastRefreshedAt(new Date().toISOString());
  }, []);

  const refreshLiveStops = useCallback(async () => {
    setRefreshing(true);
    try {
      await loadPool();
    } finally {
      setRefreshing(false);
    }
  }, [loadPool]);

  // Restore after mount so the server and first client render agree, then
  // refresh the hub pool from the database.
  useEffect(() => {
    let cancelled = false;

    async function boot() {
      const persisted = readPersisted();
      if (persisted) {
        setStops(persisted.stops);
        setShifts(persisted.shifts);
        setNextOrderNumber(persisted.nextOrderNumber);
        setLiveMode(persisted.liveMode);
      }
      if (!persisted?.shifts[courierId]) {
        const startedAt = new Date().toISOString();
        setShifts((previous) => ({ ...previous, [courierId]: startedAt }));
      }
      setNow(Date.now());
      setReady(true);

      if (!cancelled) await loadPool();
    }

    void boot();
    return () => {
      cancelled = true;
    };
  }, [courierId, loadPool]);

  useEffect(() => {
    if (!ready) return;
    writePersisted({ stops, shifts, nextOrderNumber, liveMode });
  }, [ready, stops, shifts, nextOrderNumber, liveMode]);

  // Another tab (say Emma's, next to Alex's) claimed or delivered something.
  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key !== STORAGE_KEY) return;
      const persisted = readPersisted();
      if (!persisted) return;
      setStops(persisted.stops);
      setShifts(persisted.shifts);
      setNextOrderNumber(persisted.nextOrderNumber);
      setLiveMode(persisted.liveMode);
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const myStops = useMemo(
    () =>
      stops.filter(
        (stop) => stop.assignedTo === courierId && stop.status !== "delivered",
      ),
    [stops, courierId],
  );

  const deliveredStops = useMemo(
    () =>
      stops
        .filter(
          (stop) =>
            stop.assignedTo === courierId && stop.status === "delivered",
        )
        .sort((a, b) =>
          (a.deliveredAt ?? "").localeCompare(b.deliveredAt ?? ""),
        ),
    [stops, courierId],
  );

  const currentStop = myStops[0] ?? null;
  const isRiding = currentStop?.status === "riding";

  const currentCrate = useMemo<CurrentCrate | null>(() => {
    if (!currentStop) return null;
    const crateStops = stops.filter(
      (stop) =>
        stop.assignedTo === courierId &&
        stop.claimedAt === currentStop.claimedAt,
    );
    const delivered = crateStops
      .filter((stop) => stop.status === "delivered")
      .sort((a, b) =>
        (a.deliveredAt ?? "").localeCompare(b.deliveredAt ?? ""),
      );
    return {
      stops: crateStops,
      deliveredCount: delivered.length,
      previousStop: delivered[delivered.length - 1] ?? null,
    };
  }, [stops, courierId, currentStop]);

  useEffect(() => {
    if (!ready) return;
    const interval = setInterval(
      () => setNow(Date.now()),
      isRiding ? 250 : 30000,
    );
    return () => clearInterval(interval);
  }, [ready, isRiding]);

  const progress = useMemo(() => {
    if (!currentStop) return 0;
    if (currentStop.status === "arrived") return 1;
    if (currentStop.status !== "riding" || !currentStop.rideStartedAt) return 0;
    const elapsed = now - new Date(currentStop.rideStartedAt).getTime();
    return Math.min(Math.max(elapsed / RIDE_DEMO_MS, 0), 1);
  }, [currentStop, now]);

  const patchStop = useCallback(
    (stopId: string, patch: Partial<DeliveryStop>) => {
      setStops((previous) =>
        previous.map((stop) =>
          stop.id === stopId ? { ...stop, ...patch } : stop,
        ),
      );
    },
    [],
  );

  const syncLiveStatus = useCallback(
    (stop: DeliveryStop, status: "ready" | "out" | "delivered") => {
      if (stop.source !== "live" || !stop.liveOrderId) return;
      void setCourierOrderStatus(stop.liveOrderId, status)
        .then((result) => {
          if ("error" in result) {
            setIncomingAlert(`${stop.orderNumber}: ${result.error}`);
          }
        })
        .catch(() => {
          setIncomingAlert(
            `${stop.orderNumber}: offline, the shop was not updated.`,
          );
        });
    },
    [],
  );

  const markArrived = useCallback(() => {
    if (currentStop?.status !== "riding") return;
    patchStop(currentStop.id, {
      status: "arrived",
      arrivedAt: new Date().toISOString(),
    });
  }, [currentStop, patchStop]);

  // Arriving is automatic once the leg is ridden, the courier only confirms.
  useEffect(() => {
    if (progress >= 1 && currentStop?.status === "riding") {
      markArrived();
    }
  }, [progress, currentStop?.status, markArrived]);

  const claimBatch = useCallback(
    (cluster: DeliveryCluster) => {
      if (myStops.length > 0) return;
      const claimedAt = new Date().toISOString();
      setStops((previous) =>
        previous.map((stop) =>
          stop.cluster === cluster &&
          !stop.assignedTo &&
          stop.status === "queued"
            ? { ...stop, assignedTo: courierId, claimedAt }
            : stop,
        ),
      );
    },
    [courierId, myStops.length],
  );

  const startRide = useCallback(() => {
    if (currentStop?.status !== "queued") return;
    const rideStartedAt = new Date().toISOString();
    patchStop(currentStop.id, { status: "riding", rideStartedAt });
    setNow(Date.now());
    syncLiveStatus(currentStop, "out");
  }, [currentStop, patchStop, syncLiveStatus]);

  const completeDrop = useCallback(
    (proof: Omit<ProofOfDrop, "capturedAt">) => {
      // Only from the doorstep, and only once: a double tap on the confirm
      // button must not deliver twice.
      if (currentStop?.status !== "arrived") return;
      const capturedAt = new Date().toISOString();
      patchStop(currentStop.id, {
        status: "delivered",
        deliveredAt: capturedAt,
        proof: { ...proof, capturedAt },
      });
      syncLiveStatus(currentStop, "delivered");
    },
    [currentStop, patchStop, syncLiveStatus],
  );

  const pushIncomingOrder = useCallback(() => {
    const template =
      INCOMING_STOP_TEMPLATES[nextOrderNumber % INCOMING_STOP_TEMPLATES.length];
    const orderNumber = `MM-${nextOrderNumber}`;

    setStops((previous) => [
      ...previous,
      {
        ...template,
        id: `stop-${nextOrderNumber}`,
        orderNumber,
        packageNumber: `BAG-${nextOrderNumber}`,
        items: template.items.map((item, index) => ({
          ...item,
          id: `it-${nextOrderNumber}-${index}`,
        })),
        status: "queued",
        source: "demo",
      },
    ]);
    setNextOrderNumber((value) => value + 1);
    setIncomingAlert(
      `New order ${orderNumber} packed for ${template.areaLabel}`,
    );
  }, [nextOrderNumber]);

  useEffect(() => {
    if (!incomingAlert) return;
    const timeout = setTimeout(() => setIncomingAlert(null), 6000);
    return () => clearTimeout(timeout);
  }, [incomingAlert]);

  /**
   * Start this courier's shift over. Their drops go back to the hub (demo)
   * or back to "ready" in the shop (live, if still on the bike). Other
   * couriers' crates are left alone.
   */
  const resetShift = useCallback(() => {
    for (const stop of myStops) {
      if (stop.status === "riding" || stop.status === "arrived") {
        syncLiveStatus(stop, "ready");
      }
    }
    setStops((previous) =>
      previous.filter((stop) => stop.assignedTo !== courierId),
    );
    setShifts((previous) => ({
      ...previous,
      [courierId]: new Date().toISOString(),
    }));
    setIncomingAlert(null);
    void refreshLiveStops();
  }, [courierId, myStops, refreshLiveStops, syncLiveStatus]);

  const batches = useMemo(
    () => groupIntoBatches(stops.filter((stop) => !stop.assignedTo)),
    [stops],
  );

  const minutesToCurrentStop = useMemo(() => {
    if (!currentStop || currentStop.status === "arrived") return 0;
    return rideMinutes(
      pathLengthMeters(currentStop.legFromPrevious) * (1 - progress),
    );
  }, [currentStop, progress]);

  const hoursWorked = useMemo(() => {
    if (!shiftStartedAt || !now) return GUARANTEED_HOURS;
    const elapsedHours =
      (now - new Date(shiftStartedAt).getTime()) / 3600000;
    return Math.max(GUARANTEED_HOURS, Math.round(elapsedHours * 10) / 10);
  }, [shiftStartedAt, now]);

  const value: CourierStoreValue = {
    courierId,
    ready,
    liveStatus: liveMode ? "live" : locked ? "locked" : "demo",
    liveError,
    refreshing,
    lastRefreshedAt,
    batches,
    myStops,
    currentStop,
    currentCrate,
    deliveredStops,
    progress,
    minutesToCurrentStop,
    hoursWorked,
    incomingAlert,
    claimBatch,
    startRide,
    markArrived,
    completeDrop,
    pushIncomingOrder,
    dismissAlert: () => setIncomingAlert(null),
    resetShift,
    refreshLiveStops,
  };

  return (
    <CourierStoreContext.Provider value={value}>
      {children}
    </CourierStoreContext.Provider>
  );
}

export function useCourierStore(): CourierStoreValue {
  const context = useContext(CourierStoreContext);
  if (!context) {
    throw new Error("useCourierStore must be used inside CourierStoreProvider");
  }
  return context;
}
