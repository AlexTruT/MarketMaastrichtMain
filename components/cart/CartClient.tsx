"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { QtyStepper } from "@/components/shared/QtyStepper";
import { Produce } from "@/components/shared/Produce";
import { cn } from "@/lib/utils";
import { useCart } from "@/lib/cart";
import {
  feeFor,
  formatEuro,
  isComingSoon,
  isDealActive,
  lineTotals,
  markupCents,
  midpoint,
  orderTotals,
} from "@/lib/pricing";
import { placeOrder } from "@/app/cart/actions";
import type { Fulfilment, Product, Substitution } from "@/lib/types";

const TIME_WINDOWS = ["12:00 to 13:00", "13:00 to 14:00", "14:00 to 15:00"];
const PICKUP_POINTS = ["Merret pickup point, Markt"];
const DEFAULT_PICKUP_POINT = PICKUP_POINTS[0];
const SUBSTITUTIONS: { value: Substitution; label: string; note: string }[] = [
  {
    value: "substitute",
    label: "Pick something close",
    note: "Our shopper swaps in the nearest thing on the market.",
  },
  {
    value: "skip",
    label: "Leave it out",
    note: "You are not charged for anything we could not find.",
  },
  { value: "call", label: "Call me", note: "We ring you from the stall." },
];
const CHECKOUT_KEY = "merret-checkout";

type FieldError = "address" | "pickup" | "name" | "phone" | "form";

function phoneLooksCallable(phone: string): boolean {
  return phone.replace(/\D/g, "").length >= 8;
}

function Choice({
  checked,
  onSelect,
  title,
  note,
  trailing,
}: {
  checked: boolean;
  onSelect: () => void;
  title: string;
  note?: string;
  trailing?: string;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={checked}
      onClick={onSelect}
      className={cn(
        "flex min-h-11 w-full items-center gap-3 rounded-sm px-3.5 py-3 text-left transition-colors focus-visible:ring-2 focus-visible:ring-awning focus-visible:outline-none",
        checked
          ? "bg-awning/8 ring-1 ring-awning"
          : "bg-cobble/30 hover:bg-cobble/50"
      )}
    >
      <span
        aria-hidden
        className={cn(
          "grid size-5 shrink-0 place-items-center rounded-full border-2 transition-colors",
          checked ? "border-awning" : "border-ink/25"
        )}
      >
        {checked && <span className="size-2.5 rounded-full bg-awning" />}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-medium">{title}</span>
        {note && (
          <span className="block pt-0.5 text-xs text-ink/55">{note}</span>
        )}
      </span>
      {trailing && (
        <span className="shrink-0 text-sm tabular-nums">
          {trailing}
        </span>
      )}
    </button>
  );
}

function Field({
  label,
  htmlFor,
  error,
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-meta text-ink/60" htmlFor={htmlFor}>
        {label}
      </label>
      {children}
      {error ? (
        <p id={`${htmlFor}-error`} className="text-meta text-maastricht-red">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function focusField(id: string) {
  const el = document.getElementById(id);
  el?.focus();
  el?.scrollIntoView({ block: "center", behavior: "smooth" });
}

type CartClientProps = {
  products: Product[];
  todayIso: string;
};

export function CartClient({ products, todayIso }: CartClientProps) {
  const today = useMemo(() => new Date(todayIso), [todayIso]);
  const { items, setQty, remove, clear, ready } = useCart();
  const router = useRouter();
  const restored = useRef(false);
  const [draftReady, setDraftReady] = useState(false);

  const [fulfilment, setFulfilment] = useState<Fulfilment>("home");
  const [address, setAddress] = useState("");
  const [pickupPoint, setPickupPoint] = useState(DEFAULT_PICKUP_POINT);
  const [timeWindow, setTimeWindow] = useState(TIME_WINDOWS[0]);
  const [substitution, setSubstitution] = useState<Substitution>("substitute");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [prunedStale, setPrunedStale] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<FieldError, string>>>({});

  const byId = useMemo(
    () => new Map(products.map((p) => [p.id, p])),
    [products]
  );

  useEffect(() => {
    if (restored.current) return;
    restored.current = true;
    try {
      const raw = window.localStorage.getItem(CHECKOUT_KEY);
      if (raw) {
        const draft = JSON.parse(raw) as {
          fulfilment?: Fulfilment;
          address?: string;
          pickupPoint?: string;
          timeWindow?: string;
          substitution?: Substitution;
          name?: string;
          phone?: string;
          note?: string;
        };
        if (draft.fulfilment === "home" || draft.fulfilment === "pickup") {
          setFulfilment(draft.fulfilment);
        }
        if (typeof draft.address === "string") setAddress(draft.address);
        if (
          typeof draft.pickupPoint === "string" &&
          PICKUP_POINTS.includes(draft.pickupPoint)
        ) {
          setPickupPoint(draft.pickupPoint);
        }
        if (
          typeof draft.timeWindow === "string" &&
          TIME_WINDOWS.includes(draft.timeWindow)
        ) {
          setTimeWindow(draft.timeWindow);
        }
        if (
          draft.substitution === "substitute" ||
          draft.substitution === "skip" ||
          draft.substitution === "call"
        ) {
          setSubstitution(draft.substitution);
        }
        if (typeof draft.name === "string") setName(draft.name);
        if (typeof draft.phone === "string") setPhone(draft.phone);
        if (typeof draft.note === "string") setNote(draft.note);
      }
    } catch {
      // Draft is a convenience. A bad payload just means empty fields.
    }
    setDraftReady(true);
  }, []);

  useEffect(() => {
    if (!draftReady) return;
    try {
      window.localStorage.setItem(
        CHECKOUT_KEY,
        JSON.stringify({
          fulfilment,
          address,
          pickupPoint,
          timeWindow,
          substitution,
          name,
          phone,
          note,
        })
      );
    } catch {
      // Same as the cart: private mode just skips persistence.
    }
  }, [
    draftReady,
    fulfilment,
    address,
    pickupPoint,
    timeWindow,
    substitution,
    name,
    phone,
    note,
  ]);

  useEffect(() => {
    let removed = false;
    for (const item of items) {
      const product = byId.get(item.productId);
      if (!product || isComingSoon(product, today)) {
        remove(item.productId);
        removed = true;
      }
    }
    if (removed) setPrunedStale(true);
  }, [items, byId, today, remove]);

  const lines = items
    .map((item) => ({ item, product: byId.get(item.productId) }))
    .filter(
      (line): line is { item: (typeof items)[number]; product: Product } =>
        !!line.product && !isComingSoon(line.product, today)
    );

  let subtotalMin = 0;
  let subtotalMax = 0;
  for (const { item, product } of lines) {
    const line = lineTotals(product, item.qty, today);
    subtotalMin += line.min;
    subtotalMax += line.max;
  }
  // placeOrder still stores real min/max; checkout UI shows midpoints.
  const { fee } = orderTotals(subtotalMin, subtotalMax, fulfilment);
  const displaySubtotal = midpoint(subtotalMin, subtotalMax);
  const displayMarkup = markupCents(displaySubtotal);
  const displayTotal = displaySubtotal + displayMarkup + fee;

  function clearError(field: FieldError) {
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }

  function validate(): FieldError | null {
    const next: Partial<Record<FieldError, string>> = {};
    if (fulfilment === "home" && !address.trim()) {
      next.address = "Add an address for home delivery.";
    }
    if (fulfilment === "pickup" && !pickupPoint) {
      next.pickup = "Choose a pickup point.";
    }
    if (!name.trim()) {
      next.name = "Add your name so we know whose bag this is.";
    }
    if (!phone.trim() || !phoneLooksCallable(phone)) {
      next.phone = "Add a phone number so our shopper can reach you.";
    }
    setErrors(next);
    const order: FieldError[] = ["address", "pickup", "name", "phone"];
    return order.find((key) => next[key]) ?? null;
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const first = validate();
    if (first) {
      focusField(first === "pickup" ? "pickup" : first);
      return;
    }
    if (lines.length === 0) {
      setErrors({ form: "Your bag is empty. Add something from the market." });
      return;
    }

    setSubmitting(true);
    setErrors({});
    let navigating = false;
    try {
      const result = await placeOrder({
        items: lines.map(({ item }) => ({
          productId: item.productId,
          qty: item.qty,
        })),
        customerName: name,
        phone,
        fulfilment,
        address: fulfilment === "home" ? address : null,
        pickupPoint: fulfilment === "pickup" ? pickupPoint : null,
        timeWindow,
        substitution,
        note: note || null,
      });

      if ("error" in result) {
        setErrors({ form: result.error });
        toast.error(result.error);
        return;
      }

      navigating = true;
      clear();
      router.push(`/order/${result.orderId}`);
    } catch {
      const message = "Could not place your order. Check your connection and try again.";
      setErrors({ form: message });
      toast.error(message);
    } finally {
      if (!navigating) setSubmitting(false);
    }
  }

  if (!ready || (lines.length === 0 && submitting)) {
    return (
      <div
        className="page-narrow flex flex-1 flex-col px-4 pt-8"
        aria-busy="true"
      >
        <h1 className="display-lg">Your bag</h1>
        <p className="pt-3 text-lede text-ink/55">
          {submitting ? "Placing your order…" : "Opening your bag…"}
        </p>
      </div>
    );
  }

  if (lines.length === 0) {
    return (
      <div className="page-narrow flex flex-1 flex-col items-start px-4 pt-8 pb-8">
        <h1 className="display-lg">Your bag is empty</h1>
        <p className="text-lede max-w-[46ch] pt-3 text-ink/70">
          The market is open Friday from 9.
        </p>
        {prunedStale ? (
          <p className="text-meta max-w-[46ch] pt-3 text-maastricht-red">
            Some items were no longer available and were removed from your bag.
          </p>
        ) : null}
        <Link
          href="/"
          className="mt-7 inline-flex h-12 items-center rounded-md bg-awning px-6 text-sm font-medium text-paper transition-transform duration-150 ease-out focus-visible:ring-2 focus-visible:ring-awning focus-visible:ring-offset-2 focus-visible:ring-offset-paper focus-visible:outline-none active:scale-[0.99]"
        >
          Browse the market
        </Link>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="page-narrow flex flex-1 flex-col"
    >
      <div className="px-4 pt-8">
        <h1 className="display-lg">Your bag</h1>

        <ul className="pt-6">
          {lines.map(({ item, product }) => {
            const line = lineTotals(product, item.qty, today);
            const deal = isDealActive(product, today);
            return (
              <li
                key={product.id}
                className="flex items-center gap-3.5 border-b border-cobble py-3.5 first:border-t"
              >
                <span className="relative size-12 shrink-0 overflow-hidden rounded-sm bg-paper ring-1 ring-cobble/50">
                  <Produce name={product.name} category={product.category} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">
                    {product.name}
                  </p>
                  <p className="text-xs text-ink/55">
                    {product.unit} · {formatEuro(midpoint(line.min, line.max))}
                  </p>
                  {deal && product.deal_note ? (
                    <p className="pt-0.5 text-xs text-maastricht-red">
                      {product.deal_note}
                    </p>
                  ) : null}
                  {!product.stall_id ? (
                    <p className="pt-0.5 text-xs text-ink/45">
                      Picked by our shopper at the best stall of the day
                    </p>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => remove(product.id)}
                    className="mt-0.5 -ml-1 inline-flex items-center px-1 py-1 text-xs text-ink/45 underline underline-offset-2 hover:text-maastricht-red focus-visible:ring-2 focus-visible:ring-awning focus-visible:outline-none"
                  >
                    Remove
                  </button>
                </div>
                <QtyStepper
                  name={product.name}
                  qty={item.qty}
                  onChange={(qty) => setQty(product.id, qty)}
                />
              </li>
            );
          })}
        </ul>

        {prunedStale && (
          <p className="max-w-[54ch] pt-3 text-meta text-maastricht-red">
            Some items were no longer available and were removed from your bag.
          </p>
        )}
      </div>

      <div className="mt-10 flex flex-col gap-9 bg-cobble/25 px-4 py-9">
        <section>
          <h2 className="display-md">How you want it</h2>
          <div
            role="radiogroup"
            aria-label="Fulfilment"
            className="flex flex-col gap-2 pt-4"
          >
            <Choice
              checked={fulfilment === "home"}
              onSelect={() => {
                setFulfilment("home");
                clearError("pickup");
              }}
              title="Home delivery"
              note="A courier brings it in your window."
              trailing={formatEuro(feeFor("home"))}
            />
            <Choice
              checked={fulfilment === "pickup"}
              onSelect={() => {
                setFulfilment("pickup");
                setPickupPoint(DEFAULT_PICKUP_POINT);
                clearError("address");
                clearError("pickup");
              }}
              title="Pickup by the Markt"
              note="Collect it in the centre. No delivery fee."
              trailing="Free"
            />
          </div>

          {fulfilment === "home" ? (
            <div className="pt-4">
              <Field
                label="Delivery address"
                htmlFor="address"
                error={errors.address}
              >
                <Input
                  id="address"
                  className="h-12"
                  autoComplete="street-address"
                  value={address}
                  aria-invalid={errors.address ? true : undefined}
                  aria-describedby={errors.address ? "address-error" : undefined}
                  onChange={(e) => {
                    setAddress(e.target.value);
                    clearError("address");
                  }}
                  placeholder="Street and number"
                />
              </Field>
            </div>
          ) : (
            <div
              id="pickup"
              role="radiogroup"
              aria-label="Pickup point"
              aria-invalid={errors.pickup ? true : undefined}
              aria-describedby={errors.pickup ? "pickup-error" : undefined}
              tabIndex={-1}
              className="flex flex-col gap-2 pt-4 focus:outline-none"
            >
              {PICKUP_POINTS.map((point) => (
                <Choice
                  key={point}
                  checked={pickupPoint === point}
                  onSelect={() => {
                    setPickupPoint(point);
                    clearError("pickup");
                  }}
                  title={point}
                  note="A short walk from the Friday stalls."
                />
              ))}
              {errors.pickup ? (
                <p id="pickup-error" className="text-meta text-maastricht-red">
                  {errors.pickup}
                </p>
              ) : null}
            </div>
          )}
        </section>

        <section>
          <h2 className="display-md">When</h2>
          <div
            role="radiogroup"
            aria-label="Delivery window"
            className="flex flex-wrap gap-2 pt-4"
          >
            {TIME_WINDOWS.map((w) => (
              <button
                key={w}
                type="button"
                role="radio"
                aria-checked={timeWindow === w}
                onClick={() => setTimeWindow(w)}
                className={cn(
                  "h-11 rounded-full px-4 text-sm tabular-nums transition-colors focus-visible:ring-2 focus-visible:ring-awning focus-visible:ring-offset-2 focus-visible:ring-offset-paper focus-visible:outline-none",
                  timeWindow === w
                    ? "bg-awning font-medium text-paper"
                    : "bg-paper text-ink/70 ring-1 ring-cobble hover:bg-cobble/40"
                )}
              >
                {w.replace(" to ", "–")}
              </button>
            ))}
          </div>
        </section>

        <section>
          <h2 className="display-md">If a stall has sold out</h2>
          <div
            role="radiogroup"
            aria-label="Substitutions"
            className="flex flex-col gap-2 pt-4"
          >
            {SUBSTITUTIONS.map((s) => (
              <Choice
                key={s.value}
                checked={substitution === s.value}
                onSelect={() => setSubstitution(s.value)}
                title={s.label}
                note={s.note}
              />
            ))}
          </div>
        </section>

        <section className="flex flex-col gap-4">
          <h2 className="display-md">Who to hand it to</h2>
          <Field label="Name" htmlFor="name" error={errors.name}>
            <Input
              id="name"
              className="h-12"
              autoComplete="name"
              value={name}
              aria-invalid={errors.name ? true : undefined}
              aria-describedby={errors.name ? "name-error" : undefined}
              onChange={(e) => {
                setName(e.target.value);
                clearError("name");
              }}
            />
          </Field>
          <Field label="Phone" htmlFor="phone" error={errors.phone}>
            <Input
              id="phone"
              type="tel"
              inputMode="tel"
              className="h-12"
              autoComplete="tel"
              placeholder="06 1234 5601"
              value={phone}
              aria-invalid={errors.phone ? true : undefined}
              aria-describedby={errors.phone ? "phone-error" : undefined}
              onChange={(e) => {
                setPhone(e.target.value);
                clearError("phone");
              }}
            />
          </Field>
          <Field label="Anything our shopper should know" htmlFor="note">
            <Textarea
              id="note"
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Ripe for tonight, ring the top bell…"
            />
          </Field>
        </section>
      </div>

      <div className="px-4 py-9">
        <dl className="flex flex-col gap-2.5 text-sm">
          <div className="flex items-baseline justify-between gap-4">
            <dt className="text-ink/60">Groceries</dt>
            <dd className="tabular-nums">{formatEuro(displaySubtotal)}</dd>
          </div>
          <div className="flex items-baseline justify-between gap-4">
            <dt className="text-ink/60">Online markup 15%</dt>
            <dd className="tabular-nums">{formatEuro(displayMarkup)}</dd>
          </div>
          <div className="flex items-baseline justify-between gap-4">
            <dt className="text-ink/60">
              {fulfilment === "home" ? "Delivery" : "Pickup"}
            </dt>
            <dd className="tabular-nums">
              {fee === 0 ? "Free" : formatEuro(fee)}
            </dd>
          </div>
        </dl>

        <div className="mt-5 flex items-center justify-between gap-4 border-t border-cobble pt-6">
          <p className="display-md">Total</p>
          <span className="price-sign text-[1.75rem] leading-tight">
            {formatEuro(displayTotal)}
          </span>
        </div>

        {errors.form ? (
          <p
            role="alert"
            className="mt-5 text-lede text-maastricht-red"
          >
            {errors.form}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={submitting}
          aria-busy={submitting}
          className="mt-7 h-14 w-full rounded-md bg-awning text-base font-medium text-paper transition-transform duration-150 ease-out focus-visible:ring-2 focus-visible:ring-awning focus-visible:ring-offset-2 focus-visible:ring-offset-paper focus-visible:outline-none active:scale-[0.99] disabled:pointer-events-none disabled:opacity-60"
        >
          {submitting ? "Placing your order…" : "Place order"}
        </button>
        <p className="pt-3 text-center text-xs text-ink/50">
          Nothing is charged now. You pay when the crate is handed over.
        </p>
      </div>
    </form>
  );
}
