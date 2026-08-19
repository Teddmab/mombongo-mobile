import { useQuery } from "@tanstack/react-query";
import { httpsCallable } from "firebase/functions";
import { functions } from "@/lib/firebase";

export interface Transaction {
  id: string;
  type: "deposit" | "withdrawal" | "investment" | "return";
  amount: number;
  currency: "USD" | "FC";
  date: string;
  description: string;
  status: "pending" | "completed" | "failed";
}

async function fetchTransactions(): Promise<Transaction[]> {
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
