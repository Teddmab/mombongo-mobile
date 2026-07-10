import { useQuery } from "@tanstack/react-query";
import { httpsCallable } from "firebase/functions";
import { products as MOCK_PRODUCTS, type Product } from "@/data/mock";
import { functions, isDevMode } from "@/lib/firebase";

async function fetchProduct(id: string): Promise<Product | null> {
  if (isDevMode()) {
    return MOCK_PRODUCTS.find((p) => p.id === id) ?? null;
  }
  const call = httpsCallable<{ id: string }, { product: Product | null }>(
    functions,
    "getProduct",
  );
  const result = await call({ id });
  return result.data.product;
}

export function useProduct(productId?: string) {
  return useQuery({
    queryKey: ["product", productId],
    queryFn: () => fetchProduct(productId!),
    enabled: Boolean(productId),
    staleTime: 300_000,
  });
}
