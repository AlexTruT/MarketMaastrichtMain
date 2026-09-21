import Link from "next/link";
import { customerTotals, formatEuro } from "@/lib/pricing";
import type { Order, OrderItemWithProduct, OrderStatus } from "@/lib/types";

function compactRange(min: number, max: number): string {
  if (min === max) return formatEuro(min);
  return `${formatEuro(min)}–${formatEuro(max).slice(1)}`;
}

function statusLabel(status: OrderStatus): string {
  switch (status) {
    case "new":
      return "With the shopper";
    case "picking":
      return "Being picked";
    case "ready":
      return "Packed";
    case "out":
      return "On the way";
    case "delivered":
      return "Delivered";
  }
}

function whereLine(order: Order): string {
  if (order.fulfilment === "home") {
    return order.address ?? "Home delivery";
  }
  return order.pickup_point ?? "Pickup";
}

export function BuyerOrderList({
  orders,
}: {
  orders: (Order & { order_items: OrderItemWithProduct[] })[];
}) {
  if (orders.length === 0) {
    return (
      <p className="text-lede rounded-md bg-cobble/30 px-4 py-6 text-ink/65">
        No orders for that number yet. Place one from the market, or try the
        phone you used at checkout.
      </p>
    );
  }

  const name = orders[0].customer_name;

  return (
    <div className="flex flex-col gap-5">
      <div>
        <p className="text-meta text-awning">Buyer profile</p>
        <h2 className="display-md pt-1">{name}</h2>
        <p className="text-meta pt-1 text-ink/60">
          {orders.length === 1
            ? "1 recent order"
            : `${orders.length} recent orders`}{" "}
          · confirmed with a code on this phone
        </p>
      </div>

      <ul className="flex flex-col gap-3">
        {orders.map((order) => {
          const { totalMin, totalMax } = customerTotals(order);
          const crate = `#${String(order.id).padStart(3, "0")}`;
          const itemCount = order.order_items.reduce(
            (sum, item) => sum + item.qty,
            0
          );

          return (
            <li key={order.id}>
              <Link
                href={`/order/${order.id}`}
                className="flex flex-col gap-2 rounded-md bg-paper p-4 ring-1 ring-cobble transition-colors hover:bg-cobble/20 focus-visible:ring-2 focus-visible:ring-awning focus-visible:outline-none"
              >
                <div className="flex items-baseline justify-between gap-3">
                  <span className="price-sign text-base leading-none">
                    {crate}
                  </span>
                  <span className="text-xs font-medium text-awning">
                    {statusLabel(order.status)}
                  </span>
                </div>
                <p className="text-sm font-medium">
                  {order.time_window}
                </p>
                <p className="text-meta text-ink/60">{whereLine(order)}</p>
                <div className="flex items-baseline justify-between gap-3 border-t border-cobble pt-2 text-sm">
                  <span className="text-ink/55">
                    {itemCount === 1 ? "1 item" : `${itemCount} items`}
                  </span>
                  <span className="tabular-nums">
                    {compactRange(totalMin, totalMax)}
                  </span>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
