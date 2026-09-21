import type { StaticImageData } from "next/image";
import type { ProductCategory, Stall } from "@/lib/types";
import groentePhoto from "@/assets/vrijdagmarkt-groentekraam-maastricht-eighty8things_3475807105.webp";
import fruitPhoto from "@/assets/vrijdagmarkt-fruitboer-horizontaal-maastricht-maison-rowena.webp";
import fishPhoto from "@/assets/markt-vis-maastricht-marketing-hugo-thomassen.webp";
import flowersPhoto from "@/assets/vrijdagmarkt-bloemenkraam-maastricht-eighty8things_958508054.webp";
import stadhuisPhoto from "@/assets/vrijdagmarkt-stadhuis-maastricht-eighty8things_77138142.webp";
import abrikoosPhoto from "@/assets/vrijdagmarkt-abrikoos-maastricht-eighty8things_2366632383.webp";

/**
 * Place-like stall photography from the Maastricht Friday market.
 * Used on `/stalls` thumbs and `/stalls/[id]` heroes — never the
 * studio produce cutouts (those stay on product tiles only).
 */

type SceneKey =
  | "groente"
  | "fruit"
  | "fish"
  | "flowers"
  | "stadhuis"
  | "abrikoos";

type SceneDef = {
  src: StaticImageData;
  alt: string;
};

const SCENES: Record<SceneKey, SceneDef> = {
  groente: {
    src: groentePhoto,
    alt: "A vegetable stall on the Maastricht Friday market",
  },
  fruit: {
    src: fruitPhoto,
    alt: "A fruit stallholder on the Markt",
  },
  fish: {
    src: fishPhoto,
    alt: "Fish stalls during the Friday market",
  },
  flowers: {
    src: flowersPhoto,
    alt: "A flower stall on the Markt",
  },
  stadhuis: {
    src: stadhuisPhoto,
    alt: "The Stadhuis on the Markt during the Friday market",
  },
  abrikoos: {
    src: abrikoosPhoto,
    alt: "Apricots and stone fruit on a Maastricht market stall",
  },
};

/** Prefer stall-specific crops so neighbouring vegetable stalls don't look identical. */
const BY_STALL: Record<string, { key: SceneKey; position?: string }> = {
  sjef: { key: "groente", position: "center 42%" },
  paddestoel: { key: "groente", position: "center 72%" },
  moestuin: { key: "groente", position: "30% 50%" },
  kersenhoek: { key: "fruit", position: "center 40%" },
  boschstraat: { key: "fish", position: "center 45%" },
  hanneke: { key: "stadhuis", position: "center 35%" },
  geit: { key: "stadhuis", position: "70% 40%" },
  mestreech: { key: "abrikoos", position: "center 55%" },
  heuvelland: { key: "flowers", position: "20% 50%" },
  mosae: { key: "flowers", position: "center 40%" },
  kruiden: { key: "flowers", position: "75% 45%" },
  olijf: { key: "abrikoos", position: "15% 50%" },
  speciaal: { key: "abrikoos", position: "80% 45%" },
};

const BY_CATEGORY: Record<ProductCategory, SceneKey> = {
  vegetables: "groente",
  fruit: "fruit",
  fish: "fish",
  flowers: "flowers",
  cheese: "stadhuis",
  bakery: "abrikoos",
  pantry: "abrikoos",
  more: "stadhuis",
};

export type StallScene = {
  src: StaticImageData;
  alt: string;
  /** CSS object-position — vary crops across stalls that share a photo. */
  position: string;
};

export function stallScene(
  stall: Pick<Stall, "id" | "name" | "category">
): StallScene {
  const override = BY_STALL[stall.id];
  const key = override?.key ?? BY_CATEGORY[stall.category];
  const scene = SCENES[key];
  return {
    src: scene.src,
    alt: `${scene.alt} — ${stall.name}`,
    position: override?.position ?? "center center",
  };
}
