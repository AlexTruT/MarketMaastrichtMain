import { describe, expect, it } from "vitest";
import { DEMO_PRODUCTS } from "@/lib/demo-catalogue";
import { demoCatalogue } from "@/lib/data";
import {
  parseDemoOrder,
  serializeDemoOrder,
  withProducts,
  type DemoOrder,
} from "@/lib/demo-order";

const order: DemoOrder = {
  id: 123456,
  created_at: "2026-11-25T10:00:00.000Z",
  customer_name: "Sanne",
  phone: "06 1234 5678",
  fulfilment: "pickup",
  address: null,
  pickup_point: "Merret pickup point, Markt",
  time_window: "12:00–14:00",
  substitution: "substitute",
  note: null,
  subtotal_min_cents: 1800,
  subtotal_max_cents: 2100,
  markup_min_cents: 270,
  markup_max_cents: 315,
  fee_cents: 0,
  lines: [
    { product_id: DEMO_PRODUCTS[0].id, qty: 2, unit_min_cents: 900, unit_max_cents: 1050 },
  ],
};

function tampered(patch: Record<string, unknown>): string {
  return JSON.stringify({ ...JSON.parse(serializeDemoOrder(order)), ...patch });
}

describe("a demo order kept in the browser cookie", () => {
  it("reads back exactly what was saved", () => {
    expect(parseDemoOrder(serializeDemoOrder(order))).toEqual(order);
  });

  it("fits in one cookie even with a full bag of 99 lines", () => {
    const full = {
      ...order,
      note: "x".repeat(600),
      lines: Array.from({ length: 99 }, (_, i) => ({
        product_id: 100 + i,
        qty: 99,
        unit_min_cents: 99999,
        unit_max_cents: 99999,
      })),
    };
    expect(serializeDemoOrder(full).length).toBeLessThan(4000);
  });

  it("is ignored when the cookie is missing", () => {
    expect(parseDemoOrder(undefined)).toBeNull();
  });

  it("is ignored when the cookie is not JSON", () => {
    expect(parseDemoOrder("{not json")).toBeNull();
  });

  it("is ignored when the order id is not a positive whole number", () => {
    expect(parseDemoOrder(tampered({ id: 0 }))).toBeNull();
    expect(parseDemoOrder(tampered({ id: "1" }))).toBeNull();
  });

  it("is ignored when the fulfilment is not home or pickup", () => {
    expect(parseDemoOrder(tampered({ fulfilment: "drone" }))).toBeNull();
  });

  it("is ignored when a money field is negative", () => {
    expect(parseDemoOrder(tampered({ fee_cents: -450 }))).toBeNull();
  });

  it("is ignored when a line has a max price below its min price", () => {
    expect(parseDemoOrder(tampered({ lines: [[1, 1, 500, 400]] }))).toBeNull();
  });

  it("is ignored when a line has zero quantity", () => {
    expect(parseDemoOrder(tampered({ lines: [[1, 0, 500, 500]] }))).toBeNull();
  });

  it("is ignored when it has no lines", () => {
    expect(parseDemoOrder(tampered({ lines: [] }))).toBeNull();
  });

  it("is ignored when the note is longer than checkout allows", () => {
    expect(parseDemoOrder(tampered({ note: "x".repeat(601) }))).toBeNull();
  });

  it("shows each line with its catalogue product and starts as a new order", () => {
    const shown = withProducts(order, demoCatalogue().products);
    expect(shown.status).toBe("new");
    expect(shown.order_items).toHaveLength(1);
    expect(shown.order_items[0].product.name).toBe(DEMO_PRODUCTS[0].name);
    expect(shown.order_items[0].qty).toBe(2);
  });

  it("drops lines whose product is no longer in the catalogue", () => {
    const gone = { ...order, lines: [{ ...order.lines[0], product_id: 99999 }] };
    expect(withProducts(gone, demoCatalogue().products).order_items).toEqual([]);
  });
});
