"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Check, Link2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { joinWaitlist } from "./actions";
import {
  BARRIERS,
  FREQUENCIES,
  looksLikeEmail,
  POSTCODE_MAX,
  USE_MODES,
  type Barrier,
  type Frequency,
  type Lang,
  type UseMode,
} from "./options";

const COPY = {
  nl: {
    language: "Taal",
    headline: "De vrijdagmarkt, bij jou thuis.",
    sub: "We starten binnenkort in Maastricht. Zet je op de wachtlijst en help ons met 4 korte vragen.",
    frequencyQ: "Hoe vaak ga je naar de vrijdagmarkt?",
    frequency: {
      weekly: "Elke week",
      sometimes: "Soms",
      rarely: "Zelden",
      never: "Nooit",
    },
    barriersQ: "Wat houdt je tegen om vaker te gaan?",
    barriersHint: "meerdere mogelijk",
    barriers: {
      hours: "Ik werk of studeer dan",
      access: "Lastig om er te komen",
      crowds: "Te druk",
      overview: "Ik weet niet wat waar te koop is",
      nothing: "Niets, ik ga gewoon",
    },
    useModeQ: "Hoe zou je Merret gebruiken?",
    useMode: {
      pickup: "Ophalen bij een afhaalpunt (gratis)",
      delivery: "Thuisbezorgen (€4,50)",
      unsure: "Weet ik nog niet",
      no: "Waarschijnlijk niet",
    },
    postcode: "Postcode (optioneel)",
    email: "E-mail",
    emailPlaceholder: "jij@voorbeeld.nl",
    consent: "Ja, mail me als Merret start. Je kunt je altijd afmelden.",
    privacy: "Privacy",
    submit: "Zet me op de lijst",
    submitting: "Even geduld",
    pickOne: "Kies een antwoord.",
    badEmail: "Vul een geldig e-mailadres in.",
    needConsent: "Vink dit aan om op de lijst te komen.",
    error: "Dat ging niet goed. Probeer het opnieuw.",
    doneTitle: "Je staat op de lijst.",
    doneBody: "We mailen je zodra we starten. Laat je de buren het weten?",
    share: "Deel",
    copied: "Link gekopieerd",
  },
  en: {
    language: "Language",
    headline: "The Friday market, at your door.",
    sub: "We're launching soon in Maastricht. Join the waitlist and help us with 4 quick questions.",
    frequencyQ: "How often do you go to the Friday market?",
    frequency: {
      weekly: "Every week",
      sometimes: "Sometimes",
      rarely: "Rarely",
      never: "Never",
    },
    barriersQ: "What stops you from going more often?",
    barriersHint: "pick any",
    barriers: {
      hours: "I'm at work or studying then",
      access: "Hard to get there",
      crowds: "Too busy or crowded",
      overview: "I don't know what's sold where",
      nothing: "Nothing, I go anyway",
    },
    useModeQ: "How would you use Merret?",
    useMode: {
      pickup: "Pick up at a pickup point (free)",
      delivery: "Home delivery (€4.50)",
      unsure: "Not sure yet",
      no: "Probably not",
    },
    postcode: "Postcode (optional)",
    email: "Email",
    emailPlaceholder: "you@example.com",
    consent: "Yes, email me when Merret launches. You can unsubscribe anytime.",
    privacy: "Privacy",
    submit: "Put me on the list",
    submitting: "One moment",
    pickOne: "Pick an answer.",
    badEmail: "Enter a valid email address.",
    needConsent: "Tick this to join the list.",
    error: "Something went wrong. Please try again.",
    doneTitle: "You're on the list.",
    doneBody: "We'll email you when we launch. Tell your neighbours?",
    share: "Share",
    copied: "Link copied",
  },
} as const;

type FieldError = "frequency" | "useMode" | "email" | "consent";

const pillBase =
  "inline-flex min-h-11 items-center gap-1.5 rounded-full px-3.5 py-2 text-left text-sm leading-snug transition-[background-color,color,transform] duration-150 ease-out active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-awning focus-visible:ring-offset-2 focus-visible:ring-offset-paper focus-visible:outline-none";
const pillOn = "bg-awning font-medium text-paper";
const pillOff = "bg-cobble/55 text-ink/75 hover:bg-cobble";

function Question({
  id,
  label,
  hint,
  error,
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <fieldset aria-describedby={error ? `${id}-error` : undefined}>
      <legend className="text-sm font-medium text-ink">
        {label}
        {hint ? (
          <span className="font-normal text-ink/55"> ({hint})</span>
        ) : null}
      </legend>
      <div id={id} tabIndex={-1} className="flex flex-wrap gap-2 pt-2 focus:outline-none">
        {children}
      </div>
      {error ? (
        <p id={`${id}-error`} className="pt-2 text-meta text-maastricht-red">
          {error}
        </p>
      ) : null}
    </fieldset>
  );
}

async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Clipboard API needs a secure context and permission; fall back.
    try {
      const area = document.createElement("textarea");
      area.value = text;
      area.setAttribute("readonly", "");
      area.style.position = "fixed";
      area.style.opacity = "0";
      document.body.appendChild(area);
      area.select();
      const ok = document.execCommand("copy");
      area.remove();
      return ok;
    } catch {
      return false;
    }
  }
}

export function WaitlistForm({ source }: { source: string }) {
  const [lang, setLang] = useState<Lang>("nl");
  const [frequency, setFrequency] = useState<Frequency | null>(null);
  const [barriers, setBarriers] = useState<Barrier[]>([]);
  const [useMode, setUseMode] = useState<UseMode | null>(null);
  const [postcode, setPostcode] = useState("");
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<FieldError, true>>>({});
  const [failed, setFailed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [copied, setCopied] = useState(false);
  const doneRef = useRef<HTMLHeadingElement>(null);

  const t = COPY[lang];

  useEffect(() => {
    if (!done) return;
    doneRef.current?.focus();
  }, [done]);

  useEffect(() => {
    if (!copied) return;
    const timer = window.setTimeout(() => setCopied(false), 2500);
    return () => window.clearTimeout(timer);
  }, [copied]);

  function clear(field: FieldError) {
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }

  // "Nothing" and the real barriers exclude each other.
  function toggleBarrier(value: Barrier) {
    setBarriers((prev) => {
      if (prev.includes(value)) return prev.filter((b) => b !== value);
      if (value === "nothing") return ["nothing"];
      return [...prev.filter((b) => b !== "nothing"), value];
    });
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const cleanEmail = email.trim();
    const next: Partial<Record<FieldError, true>> = {};
    if (!frequency) next.frequency = true;
    if (!useMode) next.useMode = true;
    if (!looksLikeEmail(cleanEmail)) next.email = true;
    if (!consent) next.consent = true;
    setErrors(next);
    setFailed(false);

    const first = (["frequency", "useMode", "email", "consent"] as const).find(
      (key) => next[key]
    );
    if (first) {
      // The Checkbox primitive moves `id` onto its hidden input, so focus
      // the visible role="checkbox" element for the consent error.
      const el =
        first === "consent"
          ? document.querySelector<HTMLElement>("#wl-consent-field [role=checkbox]")
          : document.getElementById(`wl-${first}`);
      el?.focus();
      el?.scrollIntoView({ block: "center", behavior: "smooth" });
      return;
    }

    setSubmitting(true);
    try {
      const result = await joinWaitlist({
        email: cleanEmail,
        frequency: frequency!,
        barriers,
        useMode: useMode!,
        postcode,
        lang,
        source,
        consent,
      });
      if (result.ok) {
        setDone(true);
      } else {
        setFailed(true);
      }
    } catch {
      setFailed(true);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleShare() {
    const ok = await copyText(`${window.location.origin}/waitlist`);
    setCopied(ok);
  }

  return (
    // translate="no": the copy is already bilingual, so the header's Google
    // Translate toggle must not translate this Dutch text a second time.
    <section
      translate="no"
      lang={lang}
      className="page-narrow flex flex-col px-4 pt-5 pb-12"
    >
      <div className="flex items-start justify-between gap-3">
        <h1 className="display-lg min-w-0 pt-1">{t.headline}</h1>
        <div
          role="radiogroup"
          aria-label={t.language}
          className="flex shrink-0 rounded-full bg-cobble/55 p-1"
        >
          {(["nl", "en"] as const).map((option) => (
            <button
              key={option}
              type="button"
              role="radio"
              aria-checked={lang === option}
              onClick={() => setLang(option)}
              className={cn(
                "min-h-11 min-w-12 rounded-full px-3 text-sm transition-colors duration-150 ease-out focus-visible:ring-2 focus-visible:ring-awning focus-visible:outline-none",
                lang === option
                  ? "bg-paper font-medium text-ink shadow-sm"
                  : "text-ink/60 hover:text-ink"
              )}
            >
              {option.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {done ? (
        <div className="pt-6">
          <h2
            ref={doneRef}
            tabIndex={-1}
            // Focused by script so screen readers announce the result; the
            // global :focus-visible ring is unlayered, so override inline.
            style={{ outline: "none" }}
            className="display-md text-awning"
          >
            {t.doneTitle}
          </h2>
          <p className="text-lede max-w-[40ch] pt-2 text-ink/70">
            {t.doneBody}
          </p>
          <button
            type="button"
            onClick={handleShare}
            className="mt-6 inline-flex h-12 w-full items-center justify-center gap-2 rounded-md bg-awning px-6 text-sm font-medium text-paper transition-transform duration-150 ease-out focus-visible:ring-2 focus-visible:ring-awning focus-visible:ring-offset-2 focus-visible:ring-offset-paper focus-visible:outline-none active:scale-[0.99] sm:w-auto"
          >
            {copied ? (
              <Check className="size-4" strokeWidth={2} aria-hidden />
            ) : (
              <Link2 className="size-4" strokeWidth={2} aria-hidden />
            )}
            {t.share}
          </button>
          <p role="status" aria-live="polite" className="h-6 pt-2 text-meta text-awning">
            {copied ? t.copied : ""}
          </p>
        </div>
      ) : (
        <>
          <p className="text-lede max-w-[40ch] pt-2 text-ink/70">{t.sub}</p>

          <form
            onSubmit={handleSubmit}
            noValidate
            className="flex flex-col gap-5 pt-5"
          >
            <Question
              id="wl-frequency"
              label={t.frequencyQ}
              error={errors.frequency ? t.pickOne : undefined}
            >
              <div role="radiogroup" aria-label={t.frequencyQ} className="contents">
                {FREQUENCIES.map((value) => (
                  <button
                    key={value}
                    type="button"
                    role="radio"
                    aria-checked={frequency === value}
                    onClick={() => {
                      setFrequency(value);
                      clear("frequency");
                    }}
                    className={cn(pillBase, frequency === value ? pillOn : pillOff)}
                  >
                    {t.frequency[value]}
                  </button>
                ))}
              </div>
            </Question>

            <Question id="wl-barriers" label={t.barriersQ} hint={t.barriersHint}>
              {BARRIERS.map((value) => {
                const on = barriers.includes(value);
                return (
                  <button
                    key={value}
                    type="button"
                    role="checkbox"
                    aria-checked={on}
                    onClick={() => toggleBarrier(value)}
                    className={cn(pillBase, on ? pillOn : pillOff)}
                  >
                    {on ? (
                      <Check className="-ml-1 size-4 shrink-0" strokeWidth={2.25} aria-hidden />
                    ) : null}
                    {t.barriers[value]}
                  </button>
                );
              })}
            </Question>

            <Question
              id="wl-useMode"
              label={t.useModeQ}
              error={errors.useMode ? t.pickOne : undefined}
            >
              <div role="radiogroup" aria-label={t.useModeQ} className="contents">
                {USE_MODES.map((value) => (
                  <button
                    key={value}
                    type="button"
                    role="radio"
                    aria-checked={useMode === value}
                    onClick={() => {
                      setUseMode(value);
                      clear("useMode");
                    }}
                    className={cn(pillBase, useMode === value ? pillOn : pillOff)}
                  >
                    {t.useMode[value]}
                  </button>
                ))}
              </div>
            </Question>

            <div className="flex items-end gap-3">
              <div className="flex w-36 shrink-0 flex-col gap-1.5">
                <label htmlFor="wl-postcode" className="whitespace-nowrap text-meta text-ink/60">
                  {t.postcode}
                </label>
                <Input
                  id="wl-postcode"
                  className="h-12"
                  autoComplete="postal-code"
                  autoCapitalize="characters"
                  maxLength={POSTCODE_MAX}
                  placeholder="6211"
                  value={postcode}
                  onChange={(e) => setPostcode(e.target.value)}
                />
              </div>
              <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                <label htmlFor="wl-email" className="text-meta text-ink/60">
                  {t.email}
                </label>
                <Input
                  id="wl-email"
                  type="email"
                  inputMode="email"
                  className="h-12"
                  autoComplete="email"
                  autoCapitalize="none"
                  spellCheck={false}
                  required
                  placeholder={t.emailPlaceholder}
                  value={email}
                  aria-invalid={errors.email ? true : undefined}
                  aria-describedby={errors.email ? "wl-email-error" : undefined}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    clear("email");
                  }}
                />
              </div>
            </div>
            {errors.email ? (
              <p id="wl-email-error" className="-mt-3 text-meta text-maastricht-red">
                {t.badEmail}
              </p>
            ) : null}

            <div id="wl-consent-field">
              <label className="flex min-h-11 cursor-pointer items-start gap-3 py-1">
                <Checkbox
                  checked={consent}
                  onCheckedChange={(checked) => {
                    setConsent(checked === true);
                    clear("consent");
                  }}
                  aria-invalid={errors.consent ? true : undefined}
                  aria-describedby={errors.consent ? "wl-consent-error" : undefined}
                  className="mt-0.5 size-5"
                />
                <span className="text-sm leading-relaxed text-ink/80">
                  {t.consent}{" "}
                  <Link
                    href="/privacy"
                    target="_blank"
                    rel="noopener"
                    className="-my-3 py-3 text-awning underline underline-offset-2"
                  >
                    {t.privacy}
                  </Link>
                </span>
              </label>
              {errors.consent ? (
                <p id="wl-consent-error" className="pt-1 text-meta text-maastricht-red">
                  {t.needConsent}
                </p>
              ) : null}
            </div>

            <div>
              {failed ? (
                <p role="alert" className="pb-4 text-lede text-maastricht-red">
                  {t.error}
                </p>
              ) : null}
              <button
                type="submit"
                disabled={submitting}
                aria-busy={submitting}
                className="h-14 w-full rounded-md bg-awning px-8 text-base font-medium text-paper transition-transform duration-150 ease-out focus-visible:ring-2 focus-visible:ring-awning focus-visible:ring-offset-2 focus-visible:ring-offset-paper focus-visible:outline-none active:scale-[0.99] disabled:pointer-events-none disabled:opacity-60 sm:w-auto"
              >
                {submitting ? t.submitting : t.submit}
              </button>
            </div>
          </form>
        </>
      )}
    </section>
  );
}
