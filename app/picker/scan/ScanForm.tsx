"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { formatEuro } from "@/lib/pricing";
import type { Stall } from "@/lib/types";
import { scanPriceBoard, updatePrices, type ReviewRow } from "./actions";

function fileToBase64(file: File): Promise<{ data: string; mediaType: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const [prefix, data] = result.split(",");
      const mediaType = prefix.match(/data:(.*);base64/)?.[1] ?? file.type;
      resolve({ data, mediaType });
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

export function ScanForm({ stalls }: { stalls: Stall[] }) {
  const [stallId, setStallId] = useState(stalls[0]?.id ?? "");
  const [rows, setRows] = useState<ReviewRow[] | null>(null);
  const [approved, setApproved] = useState<Set<number>>(new Set());
  const [scanning, setScanning] = useState(false);
  const [saving, setSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !stallId) return;

    setScanning(true);
    setRows(null);
    try {
      const { data, mediaType } = await fileToBase64(file);
      const result = await scanPriceBoard(stallId, data, mediaType);
      if ("error" in result) {
        toast.error(result.error);
        return;
      }
      setRows(result.rows);
      setApproved(
        new Set(
          result.rows
            .map((row, i) => (row.product ? i : -1))
            .filter((i) => i >= 0)
        )
      );
    } finally {
      setScanning(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  async function handleUpdate() {
    if (!rows) return;
    const updates = rows
      .map((row, i) => ({ row, i }))
      .filter(({ row, i }) => approved.has(i) && row.product)
      .map(({ row }) => ({ productId: row.product!.id, priceCents: row.priceCents }));

    if (updates.length === 0) {
      toast.error("Nothing to update.");
      return;
    }

    setSaving(true);
    const result = await updatePrices(updates);
    setSaving(false);

    if ("error" in result) {
      toast.error(result.error);
      return;
    }

    toast.success(`Updated ${updates.length} price${updates.length === 1 ? "" : "s"}.`);
    setRows(null);
  }

  return (
    <div className="flex flex-col gap-4 p-4 text-[18px]">
      <h1 className="text-2xl font-bold">Scan price board</h1>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium" htmlFor="stall">
          Stall
        </label>
        <select
          id="stall"
          value={stallId}
          onChange={(e) => setStallId(e.target.value)}
          className="h-11 rounded-md border border-cobble bg-paper px-3"
        >
          {stalls.map((stall) => (
            <option key={stall.id} value={stall.id}>
              {stall.emoji} {stall.name}
            </option>
          ))}
        </select>
      </div>

      <label className="flex h-32 cursor-pointer items-center justify-center rounded-md border-2 border-dashed border-cobble p-4 text-center text-muted-foreground">
        {scanning ? "Reading the board…" : "Take or upload a photo"}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={handleFile}
          disabled={scanning || !stallId}
        />
      </label>

      {rows && (
        <div className="flex flex-col gap-3">
          <h2 className="text-lg font-bold">Review</h2>
          {rows.length === 0 && (
            <p className="text-muted-foreground">
              Could not find any prices on that photo. Try again closer to the
              board.
            </p>
          )}
          <ul className="flex flex-col divide-y divide-cobble border-y border-cobble">
            {rows.map((row, i) => (
              <li key={i} className="flex items-center gap-3 py-3">
                {row.product ? (
                  <input
                    type="checkbox"
                    className="h-6 w-6"
                    checked={approved.has(i)}
                    onChange={(e) => {
                      setApproved((prev) => {
                        const next = new Set(prev);
                        if (e.target.checked) next.add(i);
                        else next.delete(i);
                        return next;
                      });
                    }}
                  />
                ) : (
                  <span className="w-6" />
                )}
                <div className="min-w-0 flex-1">
                  <p className="font-medium">
                    {row.product ? row.product.name : row.nameOnBoard}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {row.product
                      ? `${formatEuro(row.product.price_min_cents)} → ${formatEuro(row.priceCents)}`
                      : "New item, not added"}
                  </p>
                </div>
                {row.confidence === "low" && (
                  <span className="rounded-md bg-maastricht-red/10 px-2 py-1 text-xs font-medium text-maastricht-red">
                    Low confidence
                  </span>
                )}
              </li>
            ))}
          </ul>
          <Button
            type="button"
            size="lg"
            disabled={saving || rows.length === 0}
            onClick={handleUpdate}
          >
            {saving ? "Updating…" : "Update prices"}
          </Button>
        </div>
      )}
    </div>
  );
}
