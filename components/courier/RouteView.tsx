"use client";

import React, { useCallback, useState } from "react";
import { useCourierStore } from "@/lib/courier-store";
import { CLUSTER_META, MARKT_HUB } from "@/lib/courier-mock-data";
import { formatEuro, SHIFT_RATES } from "@/lib/courier";
import { RouteMap } from "./RouteMap";
import { RouteSheet } from "./RouteSheet";
import { ProofOfDropSheet } from "./ProofOfDropSheet";
import { Bike, CircleCheckBig } from "lucide-react";

export function RouteView({ onGoToHub }: { onGoToHub: () => void }) {
  const {
    currentStop,
    currentCrate,
    deliveredStops,
    batches,
    progress,
    minutesToCurrentStop,
    startRide,
    markArrived,
    completeDrop,
  } = useCourierStore();

  const [sheetHeight, setSheetHeight] = useState(280);
  const [proofOpen, setProofOpen] = useState(false);

  const handleHeightChange = useCallback((height: number) => {
    setSheetHeight(height);
  }, []);

  if (!currentStop || !currentCrate) {
    const finished = deliveredStops.length > 0;
    const cratesWaiting = batches.length;

    return (
      <div className="flex h-full flex-col items-center justify-center px-6 text-center">
        {finished ? (
          <CircleCheckBig aria-hidden className="size-12 text-awning" />
        ) : (
          <Bike aria-hidden className="size-12 text-ink-faint" />
        )}
        <h2 className="display-md mt-4">
          {finished ? "Crate empty, nice riding" : "No crate in your bag yet"}
        </h2>
        <p className="mt-1.5 max-w-72 text-sm text-ink-soft">
          {finished
            ? `${deliveredStops.length} ${deliveredStops.length === 1 ? "drop" : "drops"} delivered with proof this shift, ${formatEuro(deliveredStops.length * SHIFT_RATES.dropBonusCents)} in drop bonus.`
            : "Pick up a neighbourhood crate at the Markt hub and the route appears here."}
        </p>
        <button
          type="button"
          onClick={onGoToHub}
          className="mt-5 min-h-13 rounded-xl bg-awning px-6 text-sm font-bold text-white active:scale-[0.99]"
        >
          {cratesWaiting > 0
            ? `Back to the hub, ${cratesWaiting} ${cratesWaiting === 1 ? "crate" : "crates"} waiting`
            : "Back to the Markt hub"}
        </button>
      </div>
    );
  }

  // Counted per crate: an earlier crate this shift is not part of this ride.
  const totalStops = currentCrate.stops.length;
  const stopIndex = currentCrate.deliveredCount + 1;
  const clusterTitle = CLUSTER_META[currentStop.cluster].shortTitle;

  // The leg starts at the last door in this crate, or the hub for the first.
  const previousStop = currentCrate.previousStop;
  const originAddress = previousStop?.address ?? MARKT_HUB.address;
  const originLabel = previousStop
    ? previousStop.address.split(",")[0]
    : MARKT_HUB.name;

  return (
    <div className="relative h-full overflow-hidden lg:flex">
      {/* Phone: the map fills the screen under a bottom sheet. Desktop: a
          side panel on the left, the map beside it at full height. */}
      <div className="absolute inset-0 lg:relative lg:order-2 lg:flex-1">
        <RouteMap
          key={currentStop.id}
          stop={currentStop}
          originAddress={originAddress}
          originLabel={originLabel}
          bottomInset={Math.round(sheetHeight)}
        />
      </div>

      {/* Stays below the proof-of-drop sheet, which sits at z-50. */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 mx-auto max-w-160 lg:pointer-events-auto lg:relative lg:order-1 lg:mx-0 lg:h-full lg:w-105 lg:max-w-none lg:shrink-0 lg:overflow-y-auto lg:border-r lg:border-cobble lg:bg-paper">
        <RouteSheet
          stop={currentStop}
          stopIndex={stopIndex}
          totalStops={totalStops}
          clusterTitle={clusterTitle}
          progress={progress}
          minutesLeft={minutesToCurrentStop}
          dropsAfterThis={totalStops - stopIndex}
          onStart={startRide}
          onArrived={markArrived}
          onConfirmDrop={() => setProofOpen(true)}
          onHeightChange={handleHeightChange}
        />
      </div>

      {proofOpen && (
        <ProofOfDropSheet
          stop={currentStop}
          onClose={() => setProofOpen(false)}
          onConfirm={(proof) => {
            completeDrop(proof);
            setProofOpen(false);
          }}
        />
      )}
    </div>
  );
}
