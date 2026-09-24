"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import type { DeliveryStop, ProofOfDrop } from "@/lib/courier-types";
import { Camera, Check, Loader2, X } from "lucide-react";

type GpsStatus = "locating" | "found" | "unavailable";

/** Long edge of the saved proof photo. Plenty for "is the crate there". */
const PROOF_MAX_SIDE = 900;

/**
 * Shrink a camera photo to a small JPEG data URL. A raw phone photo is
 * several megabytes as base64 and would blow the localStorage quota the
 * shift is saved in; this lands around 60 to 120 KB.
 */
async function compressPhoto(file: File): Promise<string> {
  const url = URL.createObjectURL(file);
  try {
    const image = new window.Image();
    image.src = url;
    await image.decode();

    const scale = Math.min(
      1,
      PROOF_MAX_SIDE / Math.max(image.naturalWidth, image.naturalHeight),
    );
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(image.naturalWidth * scale);
    canvas.height = Math.round(image.naturalHeight * scale);
    const context = canvas.getContext("2d");
    if (!context) throw new Error("No canvas");
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/jpeg", 0.72);
  } finally {
    URL.revokeObjectURL(url);
  }
}

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
  const [processing, setProcessing] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

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

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const readPhoto = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    // Reset so picking the same file again after "Retake" still fires.
    event.target.value = "";
    if (!file) return;

    setProcessing(true);
    setPhotoError(null);
    try {
      setPhoto(await compressPhoto(file));
    } catch {
      setPhotoError("That photo could not be read. Try again, or skip it.");
    } finally {
      setProcessing(false);
    }
  };

  const confirm = () => {
    if (submitted || processing) return;
    setSubmitted(true);
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

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Proof of drop"
        className="animate-sheet-up relative w-full max-w-160 rounded-t-sheet bg-paper pb-[env(safe-area-inset-bottom)]">
        <div className="flex items-start justify-between gap-3 border-b border-cobble px-4 py-3.5">
          <div className="min-w-0">
            <h2 className="display-sm">Proof of drop</h2>
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
            <X aria-hidden className="size-4.5" />
          </button>
        </div>

        <div className="max-h-[68dvh] overflow-y-auto px-4 py-4">
          {photo ? (
            <div className="relative h-56 overflow-hidden rounded-md bg-ink">
              <Image
                src={photo}
                alt="The package on the doorstep"
                fill
                unoptimized
                sizes="(max-width: 640px) 100vw, 640px"
                className="object-cover"
              />
              <button
                type="button"
                onClick={() => setPhoto(null)}
                className="absolute top-2 right-2 rounded-md bg-ink/65 px-3 py-1.5 text-xs font-semibold text-paper"
              >
                Retake
              </button>
            </div>
          ) : (
            <label
              className={`flex min-h-40 cursor-pointer flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-cobble bg-canvas px-4 text-center active:scale-[0.99] focus-within:ring-2 focus-within:ring-awning ${
                processing ? "pointer-events-none opacity-70" : ""
              }`}
            >
              {processing ? (
                <Loader2 aria-hidden className="size-8 animate-spin text-awning" />
              ) : (
                <Camera aria-hidden className="size-8 text-awning" />
              )}
              <span className="text-sm font-bold text-awning">
                {processing ? "Saving the photo…" : "Photograph the doorstep"}
              </span>
              <span className="max-w-60 text-xs text-ink-soft">
                The customer gets this picture, so make sure the crate is in frame.
              </span>
              <input
                type="file"
                accept="image/*"
                capture="environment"
                onChange={(event) => void readPhoto(event)}
                className="sr-only"
              />
            </label>
          )}

          {photoError && (
            <p role="alert" className="mt-2 text-xs font-semibold text-maastricht-red">
              {photoError}
            </p>
          )}

          <div className="mt-3 flex items-center gap-2 rounded-xl bg-canvas px-3 py-2.5 text-xs">
            <span
              className={`h-2 w-2 shrink-0 rounded-full ${
                gps === "found"
                  ? "bg-awning"
                  : gps === "locating"
                    ? "animate-pulse bg-price-yellow"
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
            disabled={submitted || processing}
            className="mt-4 flex min-h-14 w-full items-center justify-center gap-2 rounded-xl bg-awning text-base font-bold text-white active:scale-[0.99] disabled:opacity-70"
          >
            <Check aria-hidden className="size-5" />
            {photo ? "Delivered with photo" : "Delivered, handed over"}
          </button>
          <p className="mt-2 text-center text-[11px] text-ink-faint">
            No photo needed when the customer took the crate from your hands.
          </p>
        </div>
      </div>
    </div>
  );
}
