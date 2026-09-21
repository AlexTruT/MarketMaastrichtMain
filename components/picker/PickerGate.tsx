"use client";

import { useEffect, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  checkPickerAccess,
  unlockPickerAccess,
} from "@/app/picker/unlock-actions";

export function PickerGate({ children }: { children: ReactNode }) {
  const [state, setState] = useState<"loading" | "locked" | "open">("loading");
  const [secret, setSecret] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    checkPickerAccess().then(({ unlocked }) => {
      setState(unlocked ? "open" : "locked");
    });
  }, []);

  async function handleUnlock(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    const result = await unlockPickerAccess(secret);
    setSubmitting(false);
    if ("error" in result) {
      toast.error(result.error);
      return;
    }
    setState("open");
  }

  if (state === "loading") {
    return <p className="p-4 text-muted-foreground">Loading…</p>;
  }

  if (state === "locked") {
    return (
      <form
        onSubmit={handleUnlock}
        className="flex max-w-sm flex-col gap-3 p-4 text-[18px]"
      >
        <h1 className="display-lg">Picker unlock</h1>
        <p className="text-sm text-muted-foreground">
          Enter the shared picker secret to load orders and update prices on
          this device.
        </p>
        <Input
          type="password"
          autoComplete="current-password"
          value={secret}
          onChange={(e) => setSecret(e.target.value)}
          placeholder="PICKER_SECRET"
          className="h-12"
        />
        <Button type="submit" size="lg" disabled={submitting || !secret.trim()}>
          {submitting ? "Checking…" : "Unlock"}
        </Button>
      </form>
    );
  }

  return <>{children}</>;
}
