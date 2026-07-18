import { useQuery } from "@tanstack/react-query";
import { httpsCallable } from "firebase/functions";
import { investments as MOCK_INVESTMENTS, type Investment } from "@/data/mock";
import { functions, isDevMode } from "@/lib/firebase";

export type { Investment };

async function fetchInvestments(): Promise<Investment[]> {
  if (isDevMode()) return MOCK_INVESTMENTS;
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
