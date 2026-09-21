import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import type { PickerOrder } from "@/lib/types";

export async function GET() {
  const { data, error } = await supabase
    .from("orders")
    .select(
      "*, order_items(*, product:products(*, stall:stalls(*)))"
    )
    .in("status", ["new", "picking"])
    .order("id", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ orders: (data ?? []) as PickerOrder[] });
}
