import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import type { PickerOrder } from "@/lib/types";

// This is polled every 5s from /picker, so it must never serve a cached
// response — a stale list would hide new orders from the shopper.
export const dynamic = "force-dynamic";

export async function GET() {
  const { data, error } = await supabase
    .from("orders")
    .select(
      "*, order_items(*, product:products(*, stall:stalls(*)))"
    )
    .in("status", ["new", "picking"])
    .order("id", { ascending: true });

  if (error) {
    console.error("GET /api/picker failed:", error);
    return NextResponse.json(
      { error: "Could not load orders." },
      { status: 500 }
    );
  }

  return NextResponse.json({ orders: (data ?? []) as PickerOrder[] });
}
