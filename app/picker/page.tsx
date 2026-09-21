"use client";

import { useCallback, useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { OrderStatus, PickerOrder } from "@/lib/types";
import { PickerGate } from "@/components/picker/PickerGate";
import { setOrderItemActual, setOrderStatus, setProductPicked } from "./actions";
import { toast } from "sonner";
import { formatEuro } from "@/lib/pricing";

const POLL_MS = 5000;
const ZONE_ORDER = ["Stadhuis", "Boschstraat", "Mosae Forum", "General market"];
const STATUS_STEPS: OrderStatus[] = ["picking", "ready", "out", "delivered"];
const STATUS_LABEL: Record<OrderStatus, string> = {
  new: "New",
  picking: "Picking",
  ready: "Ready",
  out: "Out",
  delivered: "Delivered",
};

type ShoppingLine = { productId: number; name: string; qty: number; allPicked: boolean };
type StallGroup = { stallName: string; lines: ShoppingLine[] };
type ZoneGroup = { zone: string; stalls: StallGroup[] };

function buildShoppingList(orders: PickerOrder[]): ZoneGroup[] {
  const byProduct = new Map<
    number,
    { name: string; qty: number; pickedFlags: boolean[]; zone: string; stallName: string }
  >();

  for (const order of orders) {
    for (const item of order.order_items) {
      const product = item.product;
      const zone = product.stall?.zone ?? "General market";
      const stallName = product.stall?.name ?? "Rest of the market";
      const existing = byProduct.get(product.id);
      if (existing) {
        existing.qty += item.qty;
        existing.pickedFlags.push(item.picked);
      } else {
        byProduct.set(product.id, {
          name: product.name,
          qty: item.qty,
          pickedFlags: [item.picked],
          zone,
          stallName,
        });
      }
    }
  }

  const zones = new Map<string, Map<string, ShoppingLine[]>>();
  for (const [productId, entry] of byProduct) {
    const zoneMap = zones.get(entry.zone) ?? new Map<string, ShoppingLine[]>();
    const lines = zoneMap.get(entry.stallName) ?? [];
    lines.push({
      productId,
      name: entry.name,
      qty: entry.qty,
      allPicked: entry.pickedFlags.every(Boolean),
    });
    zoneMap.set(entry.stallName, lines);
    zones.set(entry.zone, zoneMap);
  }

  return ZONE_ORDER.filter((zone) => zones.has(zone)).map((zone) => ({
    zone,
    stalls: Array.from(zones.get(zone)!.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([stallName, lines]) => ({
        stallName,
        lines: lines.sort((a, b) => a.name.localeCompare(b.name)),
      })),
  }));
}

export default function PickerPage() {
  const [orders, setOrders] = useState<PickerOrder[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = useCallback(async () => {
    try {
      const res = await fetch("/api/picker", { cache: "no-store" });
      if (res.status === 401) {
        setOrders([]);
        return;
      }
      const data = await res.json();
      setOrders(data.orders ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, POLL_MS);
    return () => clearInterval(interval);
  }, [fetchOrders]);

  const shoppingList = buildShoppingList(orders);

  async function handleTogglePicked(productId: number, currentlyAllPicked: boolean) {
    // Optimistic update so the row responds instantly.
    setOrders((prev) =>
      prev.map((order) => ({
        ...order,
        order_items: order.order_items.map((item) =>
          item.product.id === productId
            ? { ...item, picked: !currentlyAllPicked }
            : item
        ),
      }))
    );
    await setProductPicked(productId, !currentlyAllPicked);
    fetchOrders();
  }

  async function handleStatus(orderId: number, status: OrderStatus) {
    setOrders((prev) => prev.filter((order) => order.id !== orderId || status === "picking"));
    await setOrderStatus(orderId, status);
    fetchOrders();
  }

  async function handleActual(orderItemId: number, euroInput: string) {
    const euros = Number(euroInput.replace(",", "."));
    if (!Number.isFinite(euros) || euros < 0) {
      toast.error("Enter a valid euro amount.");
      return;
    }
    const cents = Math.round(euros * 100);
    const result = await setOrderItemActual(orderItemId, cents);
    if ("error" in result) {
      toast.error(result.error);
      return;
    }
    toast.success("Actual price saved");
    fetchOrders();
  }

  return (
    <PickerGate>
    <div className="flex flex-1 flex-col p-4 text-[18px]">
      <h1 className="display-lg mb-5">Picker</h1>

      <Tabs defaultValue="list" className="flex flex-1 flex-col">
        <TabsList className="w-full">
          <TabsTrigger value="list" className="flex-1 text-[18px]">
            Shopping list
          </TabsTrigger>
          <TabsTrigger value="orders" className="flex-1 text-[18px]">
            Orders
          </TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="flex flex-col gap-6">
          {loading && <p className="text-muted-foreground">Loading…</p>}
          {!loading && shoppingList.length === 0 && (
            <p className="text-muted-foreground">No open orders right now.</p>
          )}
          {shoppingList.map((group) => (
            <section key={group.zone} className="flex flex-col gap-3">
              <h2 className="display-md text-awning">{group.zone}</h2>
              {group.stalls.map((stall) => (
                <div key={stall.stallName} className="flex flex-col">
                  <h3 className="mb-1 text-sm font-medium text-muted-foreground">
                    {stall.stallName}
                  </h3>
                  <ul className="flex flex-col divide-y divide-cobble border-y border-cobble">
                    {stall.lines.map((line) => (
                      <li key={line.productId}>
                        <label
                          className={cn(
                            "flex w-full items-center gap-4 py-3",
                            line.allPicked && "text-muted-foreground line-through"
                          )}
                        >
                          <Checkbox
                            checked={line.allPicked}
                            onCheckedChange={() =>
                              handleTogglePicked(line.productId, line.allPicked)
                            }
                            className="h-7 w-7"
                          />
                          <span>
                            {line.qty} × {line.name}
                          </span>
                        </label>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </section>
          ))}
        </TabsContent>

        <TabsContent value="orders" className="flex flex-col gap-3">
          {loading && <p className="text-muted-foreground">Loading…</p>}
          {!loading && orders.length === 0 && (
            <p className="text-muted-foreground">No open orders right now.</p>
          )}
          {orders.map((order) => (
            <div
              key={order.id}
              className="flex w-full flex-col gap-2 rounded-md border border-cobble p-4"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold">Order #{order.id}</span>
                <Badge variant="secondary">{STATUS_LABEL[order.status]}</Badge>
              </div>
              <p>{order.time_window}</p>
              <p>
                {order.fulfilment === "home"
                  ? `Home delivery: ${order.address}`
                  : `Pickup: ${order.pickup_point}`}
              </p>
              <p>Substitution: {order.substitution}</p>
              {order.note && <p className="text-muted-foreground">Note: {order.note}</p>}
              <ul className="mt-1 flex flex-col gap-2 text-sm">
                {order.order_items.map((item) => {
                  const ranged = item.unit_min_cents !== item.unit_max_cents;
                  if (!ranged) return null;
                  return (
                    <li
                      key={item.id}
                      className="flex flex-wrap items-center gap-2 rounded-md bg-cobble/30 px-2 py-2"
                    >
                      <span className="min-w-0 flex-1">
                        {item.product.name}{" "}
                        <span className="text-muted-foreground">
                          ({formatEuro(item.unit_min_cents)}–
                          {formatEuro(item.unit_max_cents)})
                        </span>
                      </span>
                      {item.actual_unit_cents != null ? (
                        <span className="tabular-nums">
                          Actual {formatEuro(item.actual_unit_cents)}
                        </span>
                      ) : (
                        <form
                          className="flex items-center gap-2"
                          onSubmit={(e) => {
                            e.preventDefault();
                            const fd = new FormData(e.currentTarget);
                            handleActual(
                              item.id,
                              String(fd.get("actual") ?? "")
                            );
                          }}
                        >
                          <input
                            name="actual"
                            type="text"
                            inputMode="decimal"
                            placeholder="€ actual"
                            className="h-9 w-24 rounded-md border border-cobble bg-paper px-2 text-sm"
                            defaultValue=""
                          />
                          <Button type="submit" size="sm" variant="outline">
                            Set
                          </Button>
                        </form>
                      )}
                    </li>
                  );
                })}
              </ul>
              <div className="mt-2 flex flex-wrap gap-2">
                {STATUS_STEPS.map((status) => (
                  <Button
                    key={status}
                    type="button"
                    variant={order.status === status ? "default" : "outline"}
                    onClick={() => handleStatus(order.id, status)}
                  >
                    {STATUS_LABEL[status]}
                  </Button>
                ))}
              </div>
            </div>
          ))}
        </TabsContent>
      </Tabs>
    </div>
    </PickerGate>
  );
}
