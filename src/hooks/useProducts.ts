import { useQuery } from "@tanstack/react-query";
import { httpsCallable } from "firebase/functions";
import { functions } from "@/lib/firebase";

export type Category = "agriculture" | "logistique" | "export";

export interface Product {
  id: string;
  name: string;
  icon: string;
  minInvest: number;
  duration: number;
  roi: number;
  location: string;
  category: Category;
  stock: number;
  unit: string;
  image?: string;
  available: boolean;
  description?: string;
  farmer?: string;
}

async function fetchProducts(): Promise<Product[]> {
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
