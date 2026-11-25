import { describe, expect, it } from "vitest";
import {
  feeFor,
  minOrderMessage,
  minOrderShortfall,
  serviceFee,
} from "@/lib/pricing";

describe("the service fee", () => {
  it("is 15% of the bag", () => {
    expect(serviceFee(2000)).toBe(300);
  });

  it("never goes above €8", () => {
    expect(serviceFee(10000)).toBe(800);
  });

  it("rounds to whole cents", () => {
    expect(serviceFee(1999)).toBe(300);
  });
});

describe("the minimum order", () => {
  it("is met at exactly €15", () => {
    expect(minOrderShortfall(1500)).toBe(0);
  });

  it("tells you how much more to add below €15", () => {
    expect(minOrderShortfall(1250)).toBe(250);
    expect(minOrderMessage(250)).toBe("Minimum order is €15. Add €2.50 more.");
  });
});

describe("delivery", () => {
  it("costs €4.50 to your door", () => {
    expect(feeFor("home")).toBe(450);
  });

  it("is free at the pickup point", () => {
    expect(feeFor("pickup")).toBe(0);
  });
});
