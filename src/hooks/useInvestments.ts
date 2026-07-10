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
