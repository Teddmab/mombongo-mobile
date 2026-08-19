import { useQuery } from "@tanstack/react-query";
import { httpsCallable } from "firebase/functions";
import { functions } from "@/lib/firebase";
import type { Product } from "@/hooks/useProducts";

async function fetchProduct(id: string): Promise<Product | null> {
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
