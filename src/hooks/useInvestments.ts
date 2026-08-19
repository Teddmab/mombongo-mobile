import { useQuery } from "@tanstack/react-query";
import { httpsCallable } from "firebase/functions";
import { functions } from "@/lib/firebase";

export interface Investment {
  id: string;
  productId: string;
  name: string;
  location: string;
  amount: number;
  currency: "USD" | "FC";
  roi: number;
  progress: number;
  daysLeft: number;
  harvestDate: string;
  badge?: "BOURSE" | "EXPORT";
  meta?: string;
  category?: string;
}

async function fetchInvestments(): Promise<Investment[]> {
  const call = httpsCallable<Record<string, never>, { investments: Investment[] }>(
    functions,
    "getInvestments",
  );
  const result = await call({});
  return result.data.investments ?? [];
}

export function useInvestments() {
  return useQuery({
    queryKey: ["investments"],
    queryFn: fetchInvestments,
    staleTime: 60_000,
  });
}

export function usePortfolioStats() {
  const { data: investments = [], isLoading } = useInvestments();
  const usdItems = investments.filter((i) => i.currency === "USD");
  const totalUsd = usdItems.reduce((acc, i) => acc + i.amount, 0);
  const estimatedReturnUsd = usdItems.reduce((acc, i) => acc + (i.amount * i.roi) / 100, 0);
  const activeCount = investments.length;
  return { totalUsd, estimatedReturnUsd, activeCount, isLoading };
}
