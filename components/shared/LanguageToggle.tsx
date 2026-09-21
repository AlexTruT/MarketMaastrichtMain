"use client";

import { useEffect, useState, type MouseEvent } from "react";
import { cn } from "@/lib/utils";

const SITE_ORIGIN = "https://merret.vercel.app";

/** Decode a `*.translate.goog` host back to the original hostname. */
function decodeTranslateGoogHost(encoded: string): string {
  return encoded.replace(/--/g, "\0").replace(/-/g, ".").replace(/\0/g, "-");
}

function stripTranslateParams(search: string): string {
  if (!search) return "";
  const params = new URLSearchParams(search);
  for (const key of [...params.keys()]) {
    if (key.startsWith("_x_tr_")) params.delete(key);
  }
  const next = params.toString();
  return next ? `?${next}` : "";
}

/** True when the page is being viewed through Google Website Translate. */
export function isTranslatedView(location: Location = window.location): boolean {
  if (location.hostname.endsWith(".translate.goog")) return true;
  if (location.hostname.includes("translate.google.")) {
    return new URLSearchParams(location.search).has("u");
  }
  return new URLSearchParams(location.search).has("_x_tr_tl");
}

/** Original Merret URL for the current page (path + hash preserved). */
export function originalPageUrl(location: Location = window.location): string {
  if (location.hostname.endsWith(".translate.goog")) {
    const encoded = location.hostname.replace(/\.translate\.goog$/, "");
    const host = decodeTranslateGoogHost(encoded);
    return `https://${host}${location.pathname}${stripTranslateParams(location.search)}${location.hash}`;
  }

  if (location.hostname.includes("translate.google.")) {
    const u = new URLSearchParams(location.search).get("u");
    if (u) {
      try {
        return new URL(u).href;
      } catch {
        /* fall through */
      }
    }
  }

  const cleanSearch = stripTranslateParams(location.search);
  return `${location.origin}${location.pathname}${cleanSearch}${location.hash}`;
}

function googleTranslateUrl(pageUrl: string): string {
  return `https://translate.google.com/translate?hl=nl&sl=en&tl=nl&u=${encodeURIComponent(pageUrl)}`;
}

/**
 * Compact EN | NL control. NL opens the current page in Google Translate
 * website mode; EN returns to the original Merret URL.
 */
export function LanguageToggle() {
  const [nlActive, setNlActive] = useState(false);

  useEffect(() => {
    setNlActive(isTranslatedView());
  }, []);

  function goEnglish(e: MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    const url = originalPageUrl();
    if (url !== window.location.href) {
      window.location.assign(url);
      return;
    }
    setNlActive(false);
  }

  function goDutch(e: MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    if (isTranslatedView()) {
      setNlActive(true);
      return;
    }
    // Google cannot fetch localhost — point at the live site path instead.
    const pageUrl =
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1"
        ? `${SITE_ORIGIN}${window.location.pathname}${window.location.search}${window.location.hash}`
        : window.location.href;
    window.location.assign(googleTranslateUrl(pageUrl));
  }

  return (
    <div
      role="group"
      aria-label="Language"
      className="inline-flex shrink-0 items-end gap-0.5 pb-1 text-sm"
    >
      <button
        type="button"
        onClick={goEnglish}
        aria-pressed={!nlActive}
        className={cn(
          "inline-flex min-h-11 items-end px-1.5 transition-colors duration-150 ease-out",
          !nlActive
            ? "font-medium text-awning"
            : "text-ink/65 hover:text-awning"
        )}
      >
        EN
      </button>
      <span className="pb-0.5 text-ink/35" aria-hidden>
        |
      </span>
      <button
        type="button"
        onClick={goDutch}
        aria-pressed={nlActive}
        className={cn(
          "inline-flex min-h-11 items-end px-1.5 transition-colors duration-150 ease-out",
          nlActive
            ? "font-medium text-awning"
            : "text-ink/65 hover:text-awning"
        )}
      >
        NL
      </button>
    </div>
  );
}
