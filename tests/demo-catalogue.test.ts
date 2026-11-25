import { existsSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { demoCatalogue } from "@/lib/data";
import { getNextMarketFriday, isComingSoon, isDealActive } from "@/lib/pricing";

const today = new Date("2026-11-25T12:00:00Z");
const { products, stalls, demo } = demoCatalogue(today);

describe("the built-in demo catalogue", () => {
  it("is marked as demo so the site can say so", () => {
    expect(demo).toBe(true);
  });

  it("has the full seed market: every stall and its products", () => {
    expect(stalls.length).toBe(14);
    expect(products.length).toBe(64);
  });

  it("only links products to stalls that exist", () => {
    const ids = new Set(stalls.map((s) => s.id));
    for (const p of products) {
      if (p.stall_id !== null) expect(ids.has(p.stall_id)).toBe(true);
    }
  });

  it("has no two products with the same id", () => {
    expect(new Set(products.map((p) => p.id)).size).toBe(products.length);
  });

  it("keeps every price range the right way round", () => {
    for (const p of products) expect(p.price_max_cents).toBeGreaterThanOrEqual(p.price_min_cents);
  });

  it("shows some deals this week and some as coming soon", () => {
    expect(products.filter((p) => isDealActive(p, today)).length).toBeGreaterThan(0);
    expect(products.filter((p) => isComingSoon(p, today)).length).toBeGreaterThan(0);
  });

  it("schedules coming-soon deals for the week after the next market", () => {
    const next = getNextMarketFriday(today).toISOString().slice(0, 10);
    for (const p of products.filter((x) => isComingSoon(x, today))) {
      expect(p.deal_starts_on! > next).toBe(true);
    }
  });

  it("keeps coming-soon deals in the future whatever today is", () => {
    const later = new Date("2027-06-02T12:00:00Z");
    const soon = demoCatalogue(later).products.filter((p) => isComingSoon(p, later));
    expect(soon.length).toBeGreaterThan(0);
  });
});

describe("product photos", () => {
  it("exist on disk for every product in the demo market", async () => {
    const { photoKey } = await import("@/components/shared/Produce");
    for (const p of products) {
      const key = photoKey(p.name, p.category);
      expect(existsSync(`public/produce/${key}.webp`), `${p.name}: ${key}`).toBe(true);
    }
  });
});
