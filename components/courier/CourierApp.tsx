"use client";

import React, { useEffect, useState } from "react";
import type { CourierProfile } from "@/lib/courier-types";
import { CourierStoreProvider, useCourierStore } from "@/lib/courier-store";
import { CourierTopBar } from "./CourierTopBar";
import { CourierTabBar, type CourierTab } from "./CourierTabBar";
import { HubView } from "./HubView";
import { RouteView } from "./RouteView";
import { EarningsView } from "./EarningsView";

function CourierShell({ profile }: { profile: CourierProfile }) {
  const { ready, batches, myStops, deliveredStops, incomingAlert, dismissAlert } =
    useCourierStore();
  const [tab, setTab] = useState<CourierTab>("hub");

  // Land on the map as soon as there is something to ride.
  useEffect(() => {
    if (myStops.length > 0) setTab("route");
  }, [myStops.length > 0]);

  const poolCount = batches.reduce((sum, batch) => sum + batch.stops.length, 0);

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-canvas">
      <CourierTopBar
        profile={profile}
        dropsDone={deliveredStops.length}
        totalDrops={deliveredStops.length + myStops.length}
      />

      {incomingAlert && (
        <button
          type="button"
          onClick={dismissAlert}
          className="animate-drop-in z-30 shrink-0 bg-price px-4 py-2.5 text-left text-xs font-semibold"
        >
          🔔 {incomingAlert}
        </button>
      )}

      <main
        className={`relative min-h-0 flex-1 ${
          tab === "route" ? "overflow-hidden" : "overflow-y-auto pb-6"
        }`}
      >
        {!ready ? (
          <p className="px-4 py-12 text-center text-sm text-ink-soft">
            Opening your shift…
          </p>
        ) : tab === "hub" ? (
          <HubView onClaimed={() => setTab("route")} />
        ) : tab === "route" ? (
          <RouteView onGoToHub={() => setTab("hub")} />
        ) : (
          <EarningsView />
        )}
      </main>

      <CourierTabBar
        active={tab}
        onChange={setTab}
        badges={{ hub: poolCount, route: myStops.length }}
      />
    </div>
  );
}

export function CourierApp({ profile }: { profile: CourierProfile }) {
  return (
    <CourierStoreProvider courierId={profile.id}>
      <CourierShell profile={profile} />
    </CourierStoreProvider>
  );
}
