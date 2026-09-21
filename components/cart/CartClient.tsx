"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useCart } from "@/lib/cart";
import { feeFor, formatEuro, formatRange, unitRange } from "@/lib/pricing";
import { placeOrder } from "@/app/cart/actions";
import type { Fulfilment, Product, Substitution } from "@/lib/types";

const TIME_WINDOWS = ["12:00 to 13:00", "13:00 to 14:00", "14:00 to 15:00"];
const PICKUP_POINTS = [
  "Randwyck campus",
  "Buurtcentrum Malberg",
  "Merret stand, Markt",
];

type CartClientProps = {
  products: Product[];
  todayIso: string;
};

export function CartClient({ products, todayIso }: CartClientProps) {
  const today = useMemo(() => new Date(todayIso), [todayIso]);
  const { items, setQty, remove, clear } = useCart();
  const router = useRouter();

  const [fulfilment, setFulfilment] = useState<Fulfilment>("home");
  const [address, setAddress] = useState("");
  const [pickupPoint, setPickupPoint] = useState("");
  const [timeWindow, setTimeWindow] = useState(TIME_WINDOWS[0]);
  const [substitution, setSubstitution] = useState<Substitution>("substitute");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const byId = new Map(products.map((p) => [p.id, p]));
  const lines = items
    .map((item) => ({ item, product: byId.get(item.productId) }))
    .filter(
      (line): line is { item: (typeof items)[number]; product: Product } =>
        !!line.product
    );

  let subtotalMin = 0;
  let subtotalMax = 0;
  for (const { item, product } of lines) {
    const { min, max } = unitRange(product, today);
    subtotalMin += min * item.qty;
    subtotalMax += max * item.qty;
  }
  const fee = feeFor(fulfilment);
  const totalMin = subtotalMin + fee;
  const totalMax = subtotalMax + fee;

  if (lines.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-start gap-4 p-4">
        <h1 className="text-2xl font-bold">Cart</h1>
        <p className="text-muted-foreground">
          Your bag is empty. The market is open Friday from 9.
        </p>
        <Link href="/" className={buttonVariants({ size: "lg" })}>
          Browse the market
        </Link>
      </div>
    );
  }

  async function handleSubmit() {
    if (!name.trim()) {
      toast.error("Add your name.");
      return;
    }
    if (!phone.trim()) {
      toast.error("Add a phone number so our shopper can reach you.");
      return;
    }
    if (fulfilment === "home" && !address.trim()) {
      toast.error("Add an address for home delivery.");
      return;
    }
    if (fulfilment === "pickup" && !pickupPoint) {
      toast.error("Choose a pickup point.");
      return;
    }

    setSubmitting(true);
    const result = await placeOrder({
      items,
      customerName: name,
      phone,
      fulfilment,
      address: fulfilment === "home" ? address : null,
      pickupPoint: fulfilment === "pickup" ? pickupPoint : null,
      timeWindow,
      substitution,
      note: note || null,
    });
    setSubmitting(false);

    if ("error" in result) {
      toast.error(result.error);
      return;
    }

    clear();
    router.push(`/order/${result.orderId}`);
  }

  return (
    <div className="flex flex-1 flex-col gap-6 p-4">
      <h1 className="text-2xl font-bold">Cart</h1>

      <ul className="flex flex-col divide-y divide-cobble border-y border-cobble">
        {lines.map(({ item, product }) => {
          const { min, max } = unitRange(product, today);
          return (
            <li key={product.id} className="flex items-center gap-3 py-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-cobble/40 text-2xl">
                {product.emoji}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium leading-tight">
                  {product.name}
                </p>
                <p className="text-sm text-muted-foreground">
                  {formatRange(min * item.qty, max * item.qty)}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  size="icon"
                  variant="outline"
                  aria-label={`Remove one ${product.name}`}
                  onClick={() => setQty(product.id, item.qty - 1)}
                >
                  –
                </Button>
                <span className="w-5 text-center font-medium">
                  {item.qty}
                </span>
                <Button
                  type="button"
                  size="icon"
                  variant="outline"
                  aria-label={`Add one more ${product.name}`}
                  onClick={() => setQty(product.id, item.qty + 1)}
                >
                  +
                </Button>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => remove(product.id)}
              >
                Remove
              </Button>
            </li>
          );
        })}
      </ul>

      <div className="flex items-center justify-between text-lg font-medium">
        <span>Subtotal</span>
        <span>{formatRange(subtotalMin, subtotalMax)}</span>
      </div>

      <section className="flex flex-col gap-4 border-t border-cobble pt-4">
        <h2 className="text-lg font-bold">Checkout</h2>

        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium">Fulfilment</span>
          <RadioGroup
            value={fulfilment}
            onValueChange={(v) => setFulfilment(v as Fulfilment)}
            className="flex flex-col gap-2"
          >
            <label className="flex items-center gap-2">
              <RadioGroupItem value="home" /> Home delivery —{" "}
              {formatEuro(595)}
            </label>
            <label className="flex items-center gap-2">
              <RadioGroupItem value="pickup" /> Pickup point —{" "}
              {formatEuro(195)}
            </label>
          </RadioGroup>
        </div>

        {fulfilment === "home" ? (
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium" htmlFor="address">
              Address
            </label>
            <Input
              id="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Street and number"
            />
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium">Pickup point</span>
            <RadioGroup
              value={pickupPoint}
              onValueChange={setPickupPoint}
              className="flex flex-col gap-2"
            >
              {PICKUP_POINTS.map((point) => (
                <label key={point} className="flex items-center gap-2">
                  <RadioGroupItem value={point} /> {point}
                </label>
              ))}
            </RadioGroup>
          </div>
        )}

        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium">Delivery window</span>
          <RadioGroup
            value={timeWindow}
            onValueChange={setTimeWindow}
            className="flex flex-col gap-2"
          >
            {TIME_WINDOWS.map((w) => (
              <label key={w} className="flex items-center gap-2">
                <RadioGroupItem value={w} /> {w}
              </label>
            ))}
          </RadioGroup>
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium">
            If something is out of stock
          </span>
          <RadioGroup
            value={substitution}
            onValueChange={(v) => setSubstitution(v as Substitution)}
            className="flex flex-col gap-2"
          >
            <label className="flex items-center gap-2">
              <RadioGroupItem value="substitute" /> Substitute with the
              closest match
            </label>
            <label className="flex items-center gap-2">
              <RadioGroupItem value="skip" /> Skip it
            </label>
            <label className="flex items-center gap-2">
              <RadioGroupItem value="call" /> Call me
            </label>
          </RadioGroup>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium" htmlFor="name">
            Name
          </label>
          <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium" htmlFor="phone">
            Phone
          </label>
          <Input
            id="phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium" htmlFor="note">
            Note (optional)
          </label>
          <Textarea id="note" value={note} onChange={(e) => setNote(e.target.value)} />
        </div>

        <div className="flex items-center justify-between border-t border-cobble pt-4 text-sm">
          <span>Fee</span>
          <span>{formatEuro(fee)}</span>
        </div>
        <div className="flex items-center justify-between text-lg font-bold">
          <span>Total</span>
          <span>{formatRange(totalMin, totalMax)}</span>
        </div>

        <Button
          type="button"
          size="lg"
          disabled={submitting}
          onClick={handleSubmit}
        >
          {submitting ? "Placing order…" : "Place order"}
        </Button>
      </section>
    </div>
  );
}
