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
}

interface CourierStoreValue {
  courierId: string;
  ready: boolean;

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
}

const CourierStoreContext = createContext<CourierStoreValue | null>(null);

function freshStops(): DeliveryStop[] {
  return DEMO_STOPS.map((stop) => ({ ...stop }));
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
  const [stops, setStops] = useState<DeliveryStop[]>(freshStops);
  const [shiftStartedAt, setShiftStartedAt] = useState<string>("");
  const [rideStartedAt, setRideStartedAt] = useState<string | null>(null);
  const [nextOrderNumber, setNextOrderNumber] = useState(1051);
  const [incomingAlert, setIncomingAlert] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [now, setNow] = useState(0);

  // Restore after mount so the server and first client render agree.
  useEffect(() => {
    const persisted = readPersisted();
    if (persisted) {
      setStops(persisted.stops);
      setShiftStartedAt(persisted.shiftStartedAt);
      setRideStartedAt(persisted.rideStartedAt);
      setNextOrderNumber(persisted.nextOrderNumber);
    } else {
      setShiftStartedAt(new Date().toISOString());
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready || !shiftStartedAt) return;
    writePersisted({ stops, shiftStartedAt, rideStartedAt, nextOrderNumber });
  }, [ready, stops, shiftStartedAt, rideStartedAt, nextOrderNumber]);

  const myStops = useMemo(
    () =>
      stops.filter(
        (stop) => stop.assignedTo === courierId && stop.status !== "delivered",
      ),
    [stops, courierId],
  );

  const deliveredStops = useMemo(
    () =>
      stops.filter(
        (stop) => stop.assignedTo === courierId && stop.status === "delivered",
      ),
    [stops, courierId],
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
          stop.id === stopId ? { ...stop, ...patch } : stop,
        ),
      );
    },
    [],
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
          stop.cluster === cluster && !stop.assignedTo && stop.status === "queued"
            ? { ...stop, assignedTo: courierId, claimedAt }
            : stop,
        ),
      );
    },
    [courierId],
  );

  const startRide = useCallback(() => {
    if (!currentStop || currentStop.status !== "queued") return;
    setStopStatus(currentStop.id, { status: "riding" });
    setRideStartedAt(new Date().toISOString());
  }, [currentStop, setStopStatus]);

  const completeDrop = useCallback(
    (proof: Omit<ProofOfDrop, "capturedAt">) => {
      if (!currentStop) return;
      const capturedAt = new Date().toISOString();
      setStopStatus(currentStop.id, {
        status: "delivered",
        deliveredAt: capturedAt,
        proof: { ...proof, capturedAt },
      });
      setRideStartedAt(null);
    },
    [currentStop, setStopStatus],
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
      },
    ]);
    setNextOrderNumber((value) => value + 1);
    setIncomingAlert(
      `New order ${orderNumber} packed for ${template.customerName}, ${template.address.split(",")[0]}`,
    );
  }, [nextOrderNumber]);

  useEffect(() => {
    if (!incomingAlert) return;
    const timeout = setTimeout(() => setIncomingAlert(null), 6000);
    return () => clearTimeout(timeout);
  }, [incomingAlert]);

  const resetShift = useCallback(() => {
    setStops(freshStops());
    setRideStartedAt(null);
    setNextOrderNumber(1051);
    setShiftStartedAt(new Date().toISOString());
    setIncomingAlert(null);
  }, []);

  const batches = useMemo(
    () => groupIntoBatches(stops.filter((stop) => !stop.assignedTo)),
    [stops],
  );

  const minutesToCurrentStop = useMemo(() => {
    if (!currentStop) return 0;
    const remaining = rideMinutes(
      pathLengthMeters(currentStop.legFromPrevious) * (1 - progress),
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
