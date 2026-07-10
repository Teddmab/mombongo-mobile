import { useQuery } from "@tanstack/react-query";
import { httpsCallable } from "firebase/functions";
import { products as MOCK_PRODUCTS, type Category, type Product } from "@/data/mock";
import { functions, isDevMode } from "@/lib/firebase";

export type { Product, Category };

async function fetchProducts(): Promise<Product[]> {
  if (isDevMode()) return MOCK_PRODUCTS;
  const call = httpsCallable<Record<string, never>, { products: Product[] }>(
    functions,
    "getProducts",
  );
  const result = await call({});
  return result.data.products ?? [];
}

export function useProducts() {
  return useQuery({
    queryKey: ["products"],
    queryFn: fetchProducts,
    staleTime: 300_000,
  });
}

export function useFeaturedProducts() {
  const { data, ...rest } = useProducts();
  const featured = data?.filter((p) => p.available !== false).slice(0, 4);
  return {
    data: featured?.length ? featured : (data ?? []).slice(0, 4),
    ...rest,
  };
}
