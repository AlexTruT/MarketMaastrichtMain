"use client";

import React, { useEffect, useState } from "react";
import type { CourierProfile } from "@/lib/courier-types";
import { CourierStoreProvider, useCourierStore } from "@/lib/courier-store";
import { CourierTopBar } from "./CourierTopBar";
import { CourierTabBar, type CourierTab } from "./CourierTabBar";
import { HubView } from "./HubView";
import { RouteView } from "./RouteView";
import { EarningsView } from "./EarningsView";
import { Bell, X } from "lucide-react";

function CourierShell({ profile }: { profile: CourierProfile }) {
  const { ready, batches, myStops, deliveredStops, incomingAlert, dismissAlert } =
    useCourierStore();
  const [tab, setTab] = useState<CourierTab>("hub");
  const hasRoute = myStops.length > 0;

  // Land on the map as soon as there is something to ride.
  useEffect(() => {
    if (hasRoute) setTab("route");
  }, [hasRoute]);

  const poolCount = batches.reduce((sum, batch) => sum + batch.stops.length, 0);

  return (
    // App-like taps: no text selection from a stray double tap and no
    // double-tap zoom delay. The address block opts back in to selection.
    <div className="flex h-dvh touch-manipulation flex-col overflow-hidden bg-paper select-none">
      <CourierTopBar
        profile={profile}
        dropsDone={deliveredStops.length}
        dropsToGo={myStops.length}
      />

      {incomingAlert && (
        <div
          role="status"
          className="animate-drop-in z-30 flex shrink-0 items-center gap-2 bg-price-yellow px-4 py-2 text-xs font-semibold"
        >
          <Bell aria-hidden className="size-4 shrink-0" />
          <span className="min-w-0 flex-1">{incomingAlert}</span>
          <button
            type="button"
            onClick={dismissAlert}
            aria-label="Dismiss"
            className="-mr-2 flex size-8 shrink-0 items-center justify-center rounded-full active:bg-black/10"
          >
            <X aria-hidden className="size-4" />
          </button>
        </div>
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
          <HubView profile={profile} onClaimed={() => setTab("route")} />
        ) : tab === "route" ? (
          <RouteView onGoToHub={() => setTab("hub")} />
        ) : (
          <EarningsView profile={profile} />
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
