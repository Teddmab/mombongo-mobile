import { useQuery } from "@tanstack/react-query";
import { httpsCallable } from "firebase/functions";
import { transactions as MOCK_TRANSACTIONS, type Transaction } from "@/data/mock";
import { functions, isDevMode } from "@/lib/firebase";

export type { Transaction };

async function fetchTransactions(): Promise<Transaction[]> {
  if (isDevMode()) return MOCK_TRANSACTIONS;
  const call = httpsCallable<Record<string, never>, { transactions: Transaction[] }>(
    functions,
    "getTransactions",
  );
  const result = await call({});
  return result.data.transactions ?? [];
}

export function useTransactions() {
  return useQuery({
    queryKey: ["transactions"],
    queryFn: fetchTransactions,
    staleTime: 60_000,
  });
}
