"use client";

import React, { useState } from "react";
import type { DeliveryStop } from "@/lib/courier-types";
import { googleDirectionsEmbedUrl } from "@/lib/courier";
import { Loader2 } from "lucide-react";

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
   * Height of the phone sheet covering the bottom edge. Google frames the
   * route in the middle of the iframe, so we shrink the iframe instead of
   * letting the sheet hide the destination. Ignored from lg up.
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
      {/* On a phone the sheet covers the bottom; from lg the sheet is a side
          panel and the map takes the full height. */}
      <div
        className="absolute inset-x-0 top-0 bottom-(--sheet-inset) lg:bottom-0"
        style={
          {
            "--sheet-inset": `${Math.max(0, bottomInset - 20)}px`,
          } as React.CSSProperties
        }
      >
        <iframe
          title={`Cycling route from ${originLabel} to ${stop.address}`}
          src={googleDirectionsEmbedUrl(originAddress, stop.address)}
          onLoad={() => setLoaded(true)}
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
          className="h-full w-full border-0"
        />
      </div>

      {!loaded && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-cobble text-sm text-ink-soft">
          <Loader2 aria-hidden className="size-6 animate-spin text-awning" />
          Building the cycling route…
        </div>
      )}
    </div>
  );
}
