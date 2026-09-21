"use client";

import React, { useCallback, useState } from "react";
import { useCourierStore } from "@/lib/courier-store";
import { CLUSTER_META, MARKT_HUB } from "@/lib/courier-mock-data";
import { formatEuro, SHIFT_RATES } from "@/lib/courier";
import { RouteMap } from "./RouteMap";
import { RouteSheet } from "./RouteSheet";
import { ProofOfDropSheet } from "./ProofOfDropSheet";

export function RouteView({ onGoToHub }: { onGoToHub: () => void }) {
  const {
    myStops,
    currentStop,
    deliveredStops,
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

  if (!currentStop) {
    const finished = deliveredStops.length > 0;

    return (
      <div className="flex h-full flex-col items-center justify-center px-6 text-center">
        <span className="text-5xl" aria-hidden>
          {finished ? "🎉" : "🚲"}
        </span>
        <h2 className="mt-4 text-xl font-bold">
          {finished ? "Route finished" : "No crate in your bag yet"}
        </h2>
        <p className="mt-1.5 max-w-70 text-sm text-ink-soft">
          {finished
            ? `${deliveredStops.length} ${deliveredStops.length === 1 ? "drop" : "drops"} delivered with proof. That is ${formatEuro(deliveredStops.length * SHIFT_RATES.dropBonusCents)} in drop bonus.`
            : "Pick up a neighbourhood crate at the Markt hub and the route appears here."}
        </p>
        <button
          type="button"
          onClick={onGoToHub}
          className="mt-5 min-h-13 rounded-xl bg-awning px-6 text-sm font-bold text-white active:scale-[0.99]"
        >
          {finished ? "Take another crate" : "Go to the Markt hub"}
        </button>
      </div>
    );
  }

  const totalStops = myStops.length + deliveredStops.length;
  const stopIndex = deliveredStops.length + 1;
  const clusterTitle = CLUSTER_META[currentStop.cluster].shortTitle;

  // The leg starts wherever the courier finished the last drop.
  const previousStop = deliveredStops[deliveredStops.length - 1];
  const originAddress = previousStop?.address ?? MARKT_HUB.address;
  const originLabel = previousStop
    ? previousStop.address.split(",")[0]
    : MARKT_HUB.name;

  return (
    <div className="relative h-full overflow-hidden">
      <RouteMap
        stop={currentStop}
        originAddress={originAddress}
        originLabel={originLabel}
        bottomInset={Math.round(sheetHeight)}
      />

      {/* Stays below the proof-of-drop sheet, which sits at z-50. */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 mx-auto max-w-160">
        <RouteSheet
          stop={currentStop}
          stopIndex={stopIndex}
          totalStops={totalStops}
          clusterTitle={clusterTitle}
          progress={progress}
          minutesLeft={minutesToCurrentStop}
          dropsAfterThis={myStops.length - 1}
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
