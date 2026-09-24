"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { CourierProfile } from "@/lib/courier-types";
import { CLUSTER_META } from "@/lib/courier-mock-data";
import { readCourierSummary } from "@/lib/courier-store";
import { ChevronRight } from "lucide-react";

function courierInitials(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

/** Portrait circle for the courier picker — photo with initials fallback. */
export function CourierAvatar({
  profile,
  size = "md",
}: {
  profile: CourierProfile;
  size?: "sm" | "md" | "lg";
}) {
  const [failed, setFailed] = useState(false);
  const sizeClass =
    size === "lg" ? "size-16 text-xl" : size === "sm" ? "size-9 text-sm" : "size-12 text-base";
  const sizePx = size === "lg" ? 64 : size === "sm" ? 36 : 48;
  const initials = courierInitials(profile.name);
  const showPhoto = Boolean(profile.avatar) && !failed;

  return (
    <span
      className={`relative grid shrink-0 place-items-center overflow-hidden rounded-full bg-awning-tint font-semibold text-awning ring-1 ring-awning/20 ${sizeClass}`}
      aria-hidden
    >
      {showPhoto ? (
        <Image
          src={profile.avatar}
          alt=""
          fill
          sizes={`${sizePx}px`}
          className="object-cover object-[center_20%]"
          onError={() => setFailed(true)}
        />
      ) : (
        initials
      )}
    </span>
  );
}

/** "On the road" or "3 delivered", from this browser's saved demo shift. */
function useShiftStatus(courierId: string): string | null {
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    const summary = readCourierSummary(courierId);
    if (!summary) return;
    if (summary.toGo > 0) {
      setStatus(`On the road · ${summary.toGo} to go`);
    } else if (summary.delivered > 0) {
      setStatus(`${summary.delivered} delivered today`);
    }
  }, [courierId]);

  return status;
}

export function CourierProfileCard({ profile }: { profile: CourierProfile }) {
  const cluster = CLUSTER_META[profile.preferredCluster];
  const shiftStatus = useShiftStatus(profile.id);

  return (
    <Link
      href={`/courier/${profile.id}`}
      className="flex items-center gap-3.5 rounded-xl bg-paper p-4 ring-1 ring-cobble transition-shadow hover:ring-awning/50 active:scale-[0.99]"
    >
      <CourierAvatar profile={profile} size="lg" />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
          <p className="font-medium">{profile.name}</p>
          {shiftStatus && (
            <span className="rounded-full bg-awning-tint px-2 py-0.5 text-[11px] font-semibold text-awning">
              {shiftStatus}
            </span>
          )}
        </div>
        <p className="truncate text-xs text-ink-soft">
          {profile.role} · {profile.vehicle}
        </p>
        <p className="mt-0.5 truncate text-xs text-ink-faint">
          Usually rides {cluster.shortTitle}
        </p>
      </div>
      <ChevronRight aria-hidden className="size-5 shrink-0 text-ink-faint" />
    </Link>
  );
}
