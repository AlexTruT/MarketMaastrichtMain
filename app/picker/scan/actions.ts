"use server";

import Anthropic from "@anthropic-ai/sdk";
import { revalidatePath } from "next/cache";
import { supabase } from "@/lib/supabase";
import { getProductsByStall } from "@/lib/data";
import { requirePickerAccess } from "@/lib/picker-auth";
import type { Product } from "@/lib/types";

type ScannedItem = {
  name_on_board: string;
  price_cents: number;
  unit: string;
  confidence: "high" | "low";
};

export type ReviewRow = {
  nameOnBoard: string;
  unit: string;
  confidence: "high" | "low";
  priceCents: number;
  product: Product | null;
};

const SYSTEM_PROMPT = `You read a handwritten Dutch market price board from a photo. Return JSON only, no prose, in exactly this shape:
{"items":[{"name_on_board":string,"price_cents":integer,"unit":string,"confidence":"high"|"low"}]}
Prices such as "2,50" or "3 voor 5" must be normalised to a price in cents for one unit of what is written on the board. Read every line on the board. If a price or item is unclear, set confidence to "low", otherwise "high".`;

// Case-insensitive contains match in both directions, e.g. "tomaten" on the
// board should match a product named "Tomatoes" if the model translates it,
// and "Old Gouda" should match a board that just says "gouda".
function matchProduct(nameOnBoard: string, products: Product[]): Product | null {
  const needle = nameOnBoard.trim().toLowerCase();
  if (!needle) return null;
  return (
    products.find(
      (p) =>
        p.name.toLowerCase().includes(needle) ||
        needle.includes(p.name.toLowerCase())
    ) ?? null
  );
}

export async function scanPriceBoard(
  stallId: string,
  imageBase64: string,
  mediaType: string
): Promise<{ rows: ReviewRow[] } | { error: string }> {
  if (!process.env.ANTHROPIC_API_KEY) {
    return {
      error: "Price board scanning is not configured on this deployment.",
    };
  }

  try {
    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const message = await anthropic.messages.create({
      model: "claude-sonnet-5",
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "base64",
                media_type: mediaType as
                  | "image/jpeg"
                  | "image/png"
                  | "image/webp"
                  | "image/gif",
                data: imageBase64,
              },
            },
            { type: "text", text: "Read this price board and return the JSON." },
          ],
        },
      ],
    });

    const block = message.content.find((b) => b.type === "text");
    if (!block || block.type !== "text") {
      throw new Error("No text in the model response.");
    }

    const cleaned = block.text
      .trim()
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/, "")
      .replace(/```$/, "")
      .trim();
    const parsed = JSON.parse(cleaned) as { items: ScannedItem[] };

    const products = await getProductsByStall(stallId);
    const rows: ReviewRow[] = parsed.items.map((item) => ({
      nameOnBoard: item.name_on_board,
      unit: item.unit,
      confidence: item.confidence,
      priceCents: item.price_cents,
      product: matchProduct(item.name_on_board, products),
    }));

    return { rows };
  } catch (err) {
    console.error("scanPriceBoard failed:", err);
    return { error: "Could not read this photo. Try again closer to the board." };
  }
}

export async function updatePrices(
  updates: { productId: number; priceCents: number }[]
): Promise<{ ok: true } | { error: string }> {
  const gate = await requirePickerAccess();
  if (gate) return gate;

  if (!Array.isArray(updates) || updates.length === 0) {
    return { error: "Nothing to update." };
  }

  try {
    for (const update of updates) {
      if (
        typeof update.productId !== "number" ||
        !Number.isInteger(update.productId) ||
        update.productId <= 0
      ) {
        return { error: "Invalid product id." };
      }
      if (
        typeof update.priceCents !== "number" ||
        !Number.isInteger(update.priceCents) ||
        !Number.isFinite(update.priceCents) ||
        update.priceCents <= 0
      ) {
        return { error: "Prices must be positive whole-cent amounts." };
      }

      const { data, error } = await supabase
        .from("products")
        .update({
          price_min_cents: update.priceCents,
          price_max_cents: update.priceCents,
        })
        .eq("id", update.productId)
        .select("id")
        .maybeSingle();
      if (error) throw error;
      if (!data) {
        return { error: `Unknown product #${update.productId}.` };
      }
    }
    revalidatePath("/");
    return { ok: true };
  } catch (err) {
    console.error("updatePrices failed:", err);
    return { error: "Could not update prices. Try again." };
  }
}
