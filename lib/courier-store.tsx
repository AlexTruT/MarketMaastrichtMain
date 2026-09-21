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

const STORAGE_KEY = "merret-courier-v1";

interface PersistedState {
  stops: DeliveryStop[];
  shiftStartedAt: string;
  rideStartedAt: string | null;
  nextOrderNumber: number;
  /** When true, hub is showing live DB stops rather than mock demo data. */
  liveMode?: boolean;
}

interface CourierStoreValue {
  courierId: string;
  ready: boolean;
  /** True when the hub queue is backed by ready home-delivery orders. */
  liveMode: boolean;
  liveError: string | null;

  /** Unclaimed batches still sitting at the Markt hub. */
  batches: DeliveryBatch[];
  /** Stops this courier is carrying, in riding order. */
  myStops: DeliveryStop[];
  currentStop: DeliveryStop | null;
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

function readPersisted(): PersistedState | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PersistedState;
    if (!Array.isArray(parsed.stops) || parsed.stops.length === 0) return null;
    return parsed;
  } catch {
    return null;
  }
}

function writePersisted(state: PersistedState) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Private browsing or a full quota: the demo keeps working in memory.
  }
}

export function CourierStoreProvider({
  courierId,
  children,
}: {
  courierId: string;
  children: React.ReactNode;
}) {
  const [stops, setStops] = useState<DeliveryStop[]>(freshDemoStops);
  const [shiftStartedAt, setShiftStartedAt] = useState<string>("");
  const [rideStartedAt, setRideStartedAt] = useState<string | null>(null);
  const [nextOrderNumber, setNextOrderNumber] = useState(1051);
  const [incomingAlert, setIncomingAlert] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [liveMode, setLiveMode] = useState(false);
  const [liveError, setLiveError] = useState<string | null>(null);
  const [now, setNow] = useState(0);

  const applyLiveOrDemo = useCallback((liveStops: DeliveryStop[]) => {
    if (liveStops.length > 0) {
      setStops(liveStops);
      setLiveMode(true);
      setLiveError(null);
      return;
    }
    setStops(freshDemoStops());
    setLiveMode(false);
  }, []);

  const refreshLiveStops = useCallback(async () => {
    const result = await loadCourierReadyStops();
    if (result.error) {
      setLiveError(result.error);
    }
    // Keep an in-progress live route; only refresh the hub pool when idle.
    setStops((previous) => {
      const mine = previous.filter(
        (stop) => stop.assignedTo === courierId && stop.status !== "delivered"
      );
      if (mine.length > 0) {
        if (result.stops.length > 0) setLiveMode(true);
        return previous;
      }
      if (result.stops.length > 0) {
        setLiveMode(true);
        setLiveError(null);
        return result.stops;
      }
      setLiveMode(false);
      return freshDemoStops();
    });
  }, [courierId]);

  // Restore after mount so the server and first client render agree, then
  // prefer live ready home orders when the DB has any.
  useEffect(() => {
    let cancelled = false;

    async function boot() {
      const persisted = readPersisted();
      if (persisted && !cancelled) {
        setStops(persisted.stops);
        setShiftStartedAt(persisted.shiftStartedAt);
        setRideStartedAt(persisted.rideStartedAt);
        setNextOrderNumber(persisted.nextOrderNumber);
        setLiveMode(!!persisted.liveMode);
      } else if (!cancelled) {
        setShiftStartedAt(new Date().toISOString());
      }

      const result = await loadCourierReadyStops();
      if (cancelled) return;

      if (result.error) setLiveError(result.error);

      const hasActiveMine =
        persisted?.stops.some(
          (stop) =>
            stop.assignedTo === courierId && stop.status !== "delivered"
        ) ?? false;

      if (!hasActiveMine) {
        applyLiveOrDemo(result.stops);
      } else if (result.stops.length > 0) {
        setLiveMode(true);
      }

      setReady(true);
    }

    void boot();
    return () => {
      cancelled = true;
    };
  }, [applyLiveOrDemo, courierId]);

  useEffect(() => {
    if (!ready || !shiftStartedAt) return;
    writePersisted({
      stops,
      shiftStartedAt,
      rideStartedAt,
      nextOrderNumber,
      liveMode,
    });
  }, [ready, stops, shiftStartedAt, rideStartedAt, nextOrderNumber, liveMode]);

  const myStops = useMemo(
    () =>
      stops.filter(
        (stop) => stop.assignedTo === courierId && stop.status !== "delivered"
      ),
    [stops, courierId]
  );

  const deliveredStops = useMemo(
    () =>
      stops.filter(
        (stop) => stop.assignedTo === courierId && stop.status === "delivered"
      ),
    [stops, courierId]
  );

  const currentStop = myStops[0] ?? null;
  const isRiding = currentStop?.status === "riding";

  // Ticking clock, only while the marker actually needs to move.
  useEffect(() => {
    if (!isRiding) return;
    setNow(Date.now());
    const interval = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(interval);
  }, [isRiding, currentStop?.id]);

  const progress = useMemo(() => {
    if (!currentStop) return 0;
    if (currentStop.status === "arrived") return 1;
    if (currentStop.status !== "riding" || !rideStartedAt) return 0;
    const elapsed = now - new Date(rideStartedAt).getTime();
    return Math.min(Math.max(elapsed / RIDE_DEMO_MS, 0), 1);
  }, [currentStop, rideStartedAt, now]);

  const setStopStatus = useCallback(
    (stopId: string, patch: Partial<DeliveryStop>) => {
      setStops((previous) =>
        previous.map((stop) =>
          stop.id === stopId ? { ...stop, ...patch } : stop
        )
      );
    },
    []
  );

  const markArrived = useCallback(() => {
    if (!currentStop || currentStop.status === "arrived") return;
    setStopStatus(currentStop.id, {
      status: "arrived",
      arrivedAt: new Date().toISOString(),
    });
    setRideStartedAt(null);
  }, [currentStop, setStopStatus]);

  // Arriving is automatic once the leg is ridden, the courier only confirms.
  useEffect(() => {
    if (progress >= 1 && currentStop?.status === "riding") {
      markArrived();
    }
  }, [progress, currentStop?.status, markArrived]);

  const claimBatch = useCallback(
    (cluster: DeliveryCluster) => {
      const claimedAt = new Date().toISOString();
      setStops((previous) =>
        previous.map((stop) =>
          stop.cluster === cluster &&
          !stop.assignedTo &&
          stop.status === "queued"
            ? { ...stop, assignedTo: courierId, claimedAt }
            : stop
        )
      );
    },
    [courierId]
  );

  const startRide = useCallback(() => {
    if (!currentStop || currentStop.status !== "queued") return;
    setStopStatus(currentStop.id, { status: "riding" });
    setRideStartedAt(new Date().toISOString());
    if (currentStop.source === "live" && currentStop.liveOrderId) {
      void setCourierOrderStatus(currentStop.liveOrderId, "out").then(
        (result) => {
          if ("error" in result) {
            setIncomingAlert(`Could not mark order out: ${result.error}`);
          }
        }
      );
    }
  }, [currentStop, setStopStatus]);

  const completeDrop = useCallback(
    (proof: Omit<ProofOfDrop, "capturedAt">) => {
      if (!currentStop) return;
      const capturedAt = new Date().toISOString();
      const liveOrderId = currentStop.liveOrderId;
      const isLive = currentStop.source === "live" && !!liveOrderId;
      setStopStatus(currentStop.id, {
        status: "delivered",
        deliveredAt: capturedAt,
        proof: { ...proof, capturedAt },
      });
      setRideStartedAt(null);
      if (isLive && liveOrderId) {
        void setCourierOrderStatus(liveOrderId, "delivered").then((result) => {
          if ("error" in result) {
            setIncomingAlert(`Could not mark delivered: ${result.error}`);
          }
        });
      }
    },
    [currentStop, setStopStatus]
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
      `New order ${orderNumber} packed for ${template.customerName}, ${template.address.split(",")[0]}`
    );
  }, [nextOrderNumber]);

  useEffect(() => {
    if (!incomingAlert) return;
    const timeout = setTimeout(() => setIncomingAlert(null), 6000);
    return () => clearTimeout(timeout);
  }, [incomingAlert]);

  const resetShift = useCallback(() => {
    setRideStartedAt(null);
    setNextOrderNumber(1051);
    setShiftStartedAt(new Date().toISOString());
    setIncomingAlert(null);
    void refreshLiveStops();
  }, [refreshLiveStops]);

  const batches = useMemo(
    () => groupIntoBatches(stops.filter((stop) => !stop.assignedTo)),
    [stops]
  );

  const minutesToCurrentStop = useMemo(() => {
    if (!currentStop) return 0;
    const remaining = rideMinutes(
      pathLengthMeters(currentStop.legFromPrevious) * (1 - progress)
    );
    return currentStop.status === "arrived" ? 0 : remaining;
  }, [currentStop, progress]);

  const hoursWorked = useMemo(() => {
    if (!shiftStartedAt) return 0;
    const elapsedHours =
      (Date.now() - new Date(shiftStartedAt).getTime()) / 3600000;
    // Couriers are on a two hour guaranteed block during the demo shift.
    return Math.max(2, Math.round(elapsedHours * 10) / 10);
  }, [shiftStartedAt]);

  const value: CourierStoreValue = {
    courierId,
    ready,
    liveMode,
    liveError,
    batches,
    myStops,
    currentStop,
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
