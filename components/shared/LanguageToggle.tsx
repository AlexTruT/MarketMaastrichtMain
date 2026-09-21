"use client";

import { useEffect, useId, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const SITE_ORIGIN = "https://merret.vercel.app";

type Lang = "en" | "nl";

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
 * Compact language dropdown. NL opens the current page in Google Translate
 * website mode; EN returns to the original Merret URL.
 */
export function LanguageToggle() {
  const [lang, setLang] = useState<Lang>("en");
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const listId = useId();

  useEffect(() => {
    setLang(isTranslatedView() ? "nl" : "en");
  }, []);

  useEffect(() => {
    if (!open) return;

    function onPointerDown(e: PointerEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  function selectLang(next: Lang) {
    setOpen(false);

    if (next === "en") {
      const url = originalPageUrl();
      if (url !== window.location.href) {
        window.location.assign(url);
        return;
      }
      setLang("en");
      return;
    }

    if (isTranslatedView()) {
      setLang("nl");
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

  const label = lang === "nl" ? "NL" : "EN";

  return (
    <div ref={rootRef} className="relative shrink-0 text-sm sm:text-lede">
      <button
        type="button"
        aria-label="Language"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "inline-flex min-h-11 items-end gap-0.5 px-2 pb-1 font-normal text-ink/65 transition-colors duration-150 ease-out",
          "hover:text-awning focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-awning",
          open && "text-awning"
        )}
      >
        <span>{label}</span>
        <ChevronDown
          className={cn(
            "mb-0.5 size-3.5 shrink-0 text-ink/45 transition-transform duration-150",
            open && "rotate-180"
          )}
          strokeWidth={2}
          aria-hidden
        />
      </button>

      {open ? (
        <ul
          id={listId}
          role="listbox"
          aria-label="Language"
          className="absolute top-full right-0 z-50 mt-0.5 min-w-[4.5rem] overflow-hidden rounded-md border border-cobble bg-paper py-1 shadow-sm"
        >
          {(["en", "nl"] as const).map((option) => {
            const selected = lang === option;
            return (
              <li key={option} role="option" aria-selected={selected}>
                <button
                  type="button"
                  onClick={() => selectLang(option)}
                  className={cn(
                    "flex min-h-11 w-full items-center px-3 text-left text-sm transition-colors duration-150 ease-out",
                    selected
                      ? "font-medium text-awning"
                      : "text-ink/65 hover:bg-cobble/40 hover:text-awning"
                  )}
                >
                  {option.toUpperCase()}
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
