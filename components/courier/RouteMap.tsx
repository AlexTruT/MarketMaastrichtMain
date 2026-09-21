"use client";

import React, { useState } from "react";
import type { DeliveryStop } from "@/lib/courier-types";
import { googleDirectionsEmbedUrl } from "@/lib/courier";

interface RouteMapProps {
  /**
   * The one drop the courier is riding to. Later stops are deliberately not
   * passed in: each address is revealed only when its turn comes.
   */
  stop: DeliveryStop;
  /** Where this leg starts: the hub, or the door of the previous drop. */
  originAddress: string;
  originLabel: string;
  /**
   * Height of the sheet covering the bottom edge. Google frames the route in
   * the middle of the iframe, so we shrink the iframe instead of letting the
   * sheet hide the destination.
   */
  bottomInset: number;
}

export function RouteMap({
  stop,
  originAddress,
  originLabel,
  bottomInset,
}: RouteMapProps) {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className="absolute inset-0 bg-cobble">
      <div
        className="absolute inset-x-0 top-0"
        style={{ bottom: Math.max(0, bottomInset - 20) }}
      >
        {/* Remounted per stop so Google rebuilds the cycling route each time. */}
        <iframe
          key={stop.id}
          title={`Cycling route from ${originLabel} to ${stop.address}`}
          src={googleDirectionsEmbedUrl(originAddress, stop.address)}
          onLoad={() => setLoaded(true)}
          referrerPolicy="no-referrer-when-downgrade"
          className="h-full w-full border-0"
        />
      </div>

      {!loaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-cobble text-sm text-ink-soft">
          Building the cycling route…
        </div>
      )}
    </div>
  );
}
