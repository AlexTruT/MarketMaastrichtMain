import { getProducts } from "@/lib/data";
import { CartClient } from "@/components/cart/CartClient";

export default async function CartPage() {
  const products = await getProducts();
  return <CartClient products={products} todayIso={new Date().toISOString()} />;
}
