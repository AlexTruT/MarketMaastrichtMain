"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { CourierProfile } from "@/lib/courier-types";
import { CLUSTER_META } from "@/lib/courier-mock-data";

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

export function CourierProfileCard({ profile }: { profile: CourierProfile }) {
  const cluster = CLUSTER_META[profile.preferredCluster];

  return (
    <Link
      href={`/courier/${profile.id}`}
      className="flex items-center gap-3.5 rounded-md bg-paper p-4 ring-1 ring-cobble active:scale-[0.99]"
    >
      <CourierAvatar profile={profile} size="lg" />
      <div className="min-w-0 flex-1">
        <p className="font-medium">{profile.name}</p>
        <p className="truncate text-xs text-ink-soft">
          {profile.role} · {profile.vehicle}
        </p>
        <p className="mt-0.5 truncate text-xs text-ink-faint">
          Usually rides {cluster.shortTitle}
        </p>
      </div>
      <span className="shrink-0 text-ink-faint" aria-hidden>
        →
      </span>
    </Link>
  );
}
