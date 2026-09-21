"use client";

import React, { useEffect, useState } from "react";
import type { DeliveryStop, ProofOfDrop } from "@/lib/courier-types";

type GpsStatus = "locating" | "found" | "unavailable";

export function ProofOfDropSheet({
  stop,
  onClose,
  onConfirm,
}: {
  stop: DeliveryStop;
  onClose: () => void;
  onConfirm: (proof: Omit<ProofOfDrop, "capturedAt">) => void;
}) {
  const [photo, setPhoto] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [gps, setGps] = useState<GpsStatus>("locating");
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    if (!("geolocation" in navigator)) {
      setGps("unavailable");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoords({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setGps("found");
      },
      () => setGps("unavailable"),
      { enableHighAccuracy: true, timeout: 6000 },
    );
  }, []);

  const readPhoto = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => setPhoto(reader.result as string);
    reader.readAsDataURL(file);
  };

  const confirm = () => {
    onConfirm({
      photoDataUrl: photo ?? undefined,
      latitude: coords?.lat ?? stop.coords[0],
      longitude: coords?.lng ?? stop.coords[1],
      notes: notes.trim() || undefined,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="animate-fade-in absolute inset-0 bg-black/45"
      />

      <div className="animate-sheet-up relative w-full max-w-160 rounded-t-sheet bg-paper pb-[env(safe-area-inset-bottom)]">
        <div className="flex items-start justify-between gap-3 border-b border-cobble px-4 py-3.5">
          <div className="min-w-0">
            <h2 className="text-lg leading-tight font-bold">Proof of drop</h2>
            <p className="truncate text-xs text-ink-soft">
              {stop.packageNumber} · {stop.address.split(",")[0]}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-canvas text-ink-soft"
          >
            ✕
          </button>
        </div>

        <div className="max-h-[68dvh] overflow-y-auto px-4 py-4">
          {photo ? (
            <div className="relative overflow-hidden rounded-xl bg-black">
              <img
                src={photo}
                alt="The package on the doorstep"
                className="max-h-56 w-full object-cover"
              />
              <button
                type="button"
                onClick={() => setPhoto(null)}
                className="absolute top-2 right-2 rounded-full bg-black/65 px-3 py-1.5 text-xs font-semibold text-white"
              >
                Retake
              </button>
            </div>
          ) : (
            <label className="flex min-h-40 cursor-pointer flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-cobble bg-canvas px-4 text-center active:scale-[0.99]">
              <span className="text-3xl" aria-hidden>
                📷
              </span>
              <span className="text-sm font-bold text-awning">
                Photograph the doorstep
              </span>
              <span className="max-w-60 text-xs text-ink-soft">
                The customer gets this picture, so make sure the crate is in frame.
              </span>
              <input
                type="file"
                accept="image/*"
                capture="environment"
                onChange={readPhoto}
                className="hidden"
              />
            </label>
          )}

          <div className="mt-3 flex items-center gap-2 rounded-xl bg-canvas px-3 py-2.5 text-xs">
            <span
              className={`h-2 w-2 shrink-0 rounded-full ${
                gps === "found"
                  ? "bg-awning"
                  : gps === "locating"
                    ? "animate-pulse bg-price"
                    : "bg-ink-faint"
              }`}
              aria-hidden
            />
            {gps === "found" && coords && (
              <span>
                Location stamped at {coords.lat.toFixed(4)},{" "}
                {coords.lng.toFixed(4)}
              </span>
            )}
            {gps === "locating" && <span>Getting your location…</span>}
            {gps === "unavailable" && (
              <span>No GPS. We will stamp the delivery address instead.</span>
            )}
          </div>

          <label className="mt-3 block">
            <span className="text-xs font-bold">Note for the customer</span>
            <input
              type="text"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Left behind the planters, as you asked"
              className="mt-1.5 min-h-12 w-full rounded-xl bg-canvas px-3 text-sm outline-none ring-1 ring-cobble focus:ring-2 focus:ring-awning"
            />
          </label>

          <button
            type="button"
            onClick={confirm}
            className="mt-4 min-h-14 w-full rounded-xl bg-awning text-base font-bold text-white active:scale-[0.99]"
          >
            Delivered, next drop
          </button>
          <p className="mt-2 text-center text-[11px] text-ink-faint">
            A photo is not required. Skip it if the customer took the crate from
            your hands.
          </p>
        </div>
      </div>
    </div>
  );
}
