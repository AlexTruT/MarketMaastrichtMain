import { notFound } from "next/navigation";
import Link from "next/link";
import { getOrder } from "@/lib/data";
import { canViewOrder } from "@/lib/order-access";
import {
  customerTotals,
  formatEuro,
  markupCents,
  midpoint,
} from "@/lib/pricing";
import { Produce } from "@/components/shared/Produce";

export default async function OrderConfirmationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const orderId = Number(id);
  if (!Number.isInteger(orderId)) notFound();

  const order = await getOrder(orderId);
  if (!order) notFound();

  const allowed = await canViewOrder(order);
  if (!allowed) {
    return (
      <div className="page-narrow flex flex-1 flex-col px-4 pt-8 pb-12">
        <h1 className="display-lg max-w-[16ch]">Sign in to view this order</h1>
        <p className="max-w-[48ch] pt-3 text-lede text-ink/70">
          Order details are only shown on the device that placed them, or after
          you confirm the phone number from your pickup ticket.
        </p>
        <div className="mt-9 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/profile"
            className="inline-flex h-12 items-center justify-center rounded-md bg-awning px-6 text-sm font-medium text-paper transition-colors hover:bg-awning/90 focus-visible:ring-2 focus-visible:ring-awning focus-visible:outline-none"
          >
            Verify your phone
          </Link>
          <Link
            href="/"
            className="inline-flex h-12 items-center justify-center rounded-md ring-1 ring-cobble px-6 text-sm font-medium transition-colors hover:bg-cobble/40 focus-visible:ring-2 focus-visible:ring-awning focus-visible:outline-none"
          >
            Back to the market
          </Link>
        </div>
      </div>
    );
  }

  const { subtotalMin, subtotalMax, fee } = customerTotals(order);
  // Stored order keeps real min/max; confirmation shows midpoints.
  const displaySubtotal = midpoint(subtotalMin, subtotalMax);
  const displayMarkup = markupCents(displaySubtotal);
  const displayTotal = displaySubtotal + displayMarkup + fee;
  // A bare "1" on a yellow card reads as a stray mark, not a label. Crates
  // on the hub bench are numbered with the same padding.
  const crateLabel = `#${String(order.id).padStart(3, "0")}`;

  // A real sequence, so it is numbered. Friday morning, in order.
  const steps = [
    {
      time: "09:00",
      text: "Our shopper walks the Markt with every list of the day.",
    },
    {
      time: "11:30",
      text: `Your crate is packed at the Merret pickup point and labelled ${crateLabel}.`,
    },
    {
      time: order.time_window.split(" to ")[0],
      text:
        order.fulfilment === "home"
          ? `A courier picks up the crate at the Merret pickup point and rides it to ${order.address}.`
          : "It is waiting for you at the Merret pickup point by the Markt.",
    },
  ];

  return (
    <div className="page-narrow flex flex-1 flex-col px-4 pt-8 pb-12">
      <h1 className="display-lg max-w-[16ch]">Order placed</h1>
      <p className="max-w-[48ch] pt-3 text-lede text-ink/70">
        Our shopper buys your order Friday morning. Your crate carries this
        number from the stall to{" "}
        {order.fulfilment === "home" ? order.address : order.pickup_point}.
      </p>

      <span className="price-sign mt-7 self-start text-[1.75rem] leading-tight tracking-wide">
        {crateLabel}
      </span>

      <ol className="mt-10">
        {steps.map((step, i) => (
          <li key={step.time} className="flex gap-4">
            <div className="flex w-7 flex-col items-center">
              <span className="grid size-7 shrink-0 place-items-center rounded-full bg-awning text-xs font-semibold text-paper tabular-nums">
                {i + 1}
              </span>
              {i < steps.length - 1 && (
                <span
                  aria-hidden
                  className="mt-1.5 w-px min-h-8 flex-1 bg-cobble"
                />
              )}
            </div>
            <div className={i < steps.length - 1 ? "pb-8" : "pb-2"}>
              <p className="text-sm font-medium tabular-nums text-ink">
                {step.time}
              </p>
              <p className="max-w-[44ch] pt-1 text-lede text-ink/70">
                {step.text}
              </p>
            </div>
          </li>
        ))}
      </ol>

      <h2 className="display-md border-t border-cobble pt-8">
        What you asked for
      </h2>
      <ul className="pt-4">
        {order.order_items.map((item) => (
          <li
            key={item.id}
            className="flex items-center gap-3.5 border-b border-cobble py-3.5 first:border-t"
          >
            <span className="relative size-10 shrink-0 overflow-hidden rounded-sm bg-paper ring-1 ring-cobble/50">
              <Produce
                name={item.product.name}
                category={item.product.category}
              />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{item.product.name}</p>
              <p className="text-xs text-ink/55">
                {item.qty} × {item.product.unit}
              </p>
            </div>
            <span className="shrink-0 text-sm tabular-nums">
              {formatEuro(
                midpoint(
                  item.unit_min_cents * item.qty,
                  item.unit_max_cents * item.qty
                )
              )}
            </span>
          </li>
        ))}
      </ul>

      <dl className="flex flex-col gap-2.5 pt-6 text-sm">
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
            {order.fulfilment === "home" ? "Delivery" : "Pickup"}
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

      <div className="mt-9 flex flex-col gap-3 sm:flex-row">
        <Link
          href={`/profile?phone=${encodeURIComponent(order.phone)}`}
          className="inline-flex h-12 items-center justify-center rounded-md bg-awning px-6 text-sm font-medium text-paper transition-colors hover:bg-awning/90 focus-visible:ring-2 focus-visible:ring-awning focus-visible:outline-none"
        >
          Open your profile
        </Link>
        <Link
          href="/"
          className="inline-flex h-12 items-center justify-center rounded-md ring-1 ring-cobble px-6 text-sm font-medium transition-colors hover:bg-cobble/40 focus-visible:ring-2 focus-visible:ring-awning focus-visible:outline-none"
        >
          Back to the market
        </Link>
      </div>
    </div>
  );
}
