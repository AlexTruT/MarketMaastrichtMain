import { notFound } from "next/navigation";
import Link from "next/link";
import { getOrder } from "@/lib/data";
import { buttonVariants } from "@/components/ui/button";
import { formatEuro, formatRange } from "@/lib/pricing";

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

  const totalMin = order.subtotal_min_cents + order.fee_cents;
  const totalMax = order.subtotal_max_cents + order.fee_cents;

  return (
    <div className="flex flex-1 flex-col gap-6 p-4">
      <section className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold">Order placed</h1>
        <p className="text-muted-foreground">
          Order #{order.id} · {order.time_window}
        </p>
        <p className="text-muted-foreground">
          {order.fulfilment === "home"
            ? `Delivered to ${order.address}`
            : `Pickup at ${order.pickup_point}`}
        </p>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-lg font-bold">Items</h2>
        <ul className="flex flex-col divide-y divide-cobble border-y border-cobble">
          {order.order_items.map((item) => (
            <li key={item.id} className="flex items-center gap-3 py-3">
              <span className="text-2xl">{item.product.emoji}</span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium leading-tight">
                  {item.product.name}
                </p>
                <p className="text-sm text-muted-foreground">
                  {item.qty} × {item.product.unit}
                </p>
              </div>
              <span className="text-sm">
                {formatRange(
                  item.unit_min_cents * item.qty,
                  item.unit_max_cents * item.qty
                )}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className="flex flex-col gap-1 border-t border-cobble pt-4 text-sm">
        <div className="flex items-center justify-between">
          <span>Subtotal</span>
          <span>
            {formatRange(order.subtotal_min_cents, order.subtotal_max_cents)}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span>Fee</span>
          <span>{formatEuro(order.fee_cents)}</span>
        </div>
        <div className="flex items-center justify-between text-lg font-bold">
          <span>Total</span>
          <span>{formatRange(totalMin, totalMax)}</span>
        </div>
      </section>

      <p className="rounded-md border border-cobble bg-cobble/20 p-3 text-sm">
        Our shopper buys your order Friday morning.
      </p>

      <Link href="/" className={buttonVariants({ size: "lg" })}>
        Back to the market
      </Link>
    </div>
  );
}
