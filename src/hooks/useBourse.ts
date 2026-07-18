import { useQuery } from "@tanstack/react-query";
import { httpsCallable } from "firebase/functions";
import {
  bourseOpportunities as MOCK_OPPS,
  bourseTicker as MOCK_TICKER,
  type BourseOpportunity,
  type BourseTicker,
} from "@/data/mock";
import { functions, isDevMode } from "@/lib/firebase";

export type { BourseOpportunity, BourseTicker };

function normalizeOpportunity(raw: Record<string, unknown>): BourseOpportunity {
  return {
    id: String(raw.id ?? ""),
    title: String(raw.title ?? ""),
    type: (raw.type as BourseOpportunity["type"]) ?? "transport",
    origin: String(raw.origin ?? ""),
    destination: raw.destination ? String(raw.destination) : undefined,
    volume: String(raw.volume ?? ""),
    price: String(raw.price ?? ""),
    commission: Number(raw.commission ?? 0),
    duration: String(raw.duration ?? ""),
    spotsLeft: Number(raw.spotsLeft ?? 0),
    spotsTotal: Number(raw.spotsTotal ?? 0),
  };
}

function normalizeTicker(raw: Record<string, unknown>): BourseTicker {
  return {
    symbol: String(raw.symbol ?? raw.id ?? ""),
    price: String(raw.price ?? ""),
    change: Number(raw.change ?? 0),
  };
}

export function useBourseOpportunities() {
  return useQuery({
    queryKey: ["bourse-opportunities"],
    queryFn: async (): Promise<BourseOpportunity[]> => {
      if (isDevMode()) return MOCK_OPPS;
      const call = httpsCallable<Record<string, never>, { opportunities: Record<string, unknown>[] }>(
        functions,
        "getBourseOpportunities",
      );
      const result = await call({});
      return (result.data.opportunities ?? []).map(normalizeOpportunity);
    },
    staleTime: 60_000,
  });
}

export function useBoursePrices() {
  return useQuery({
    queryKey: ["bourse-prices"],
    queryFn: async (): Promise<BourseTicker[]> => {
      if (isDevMode()) return MOCK_TICKER;
      const call = httpsCallable<Record<string, never>, { prices: Record<string, unknown>[] }>(
        functions,
        "getBoursePrices",
      );
      const result = await call({});
      return (result.data.prices ?? []).map(normalizeTicker);
    },
    staleTime: 30_000,
    refetchInterval: 30_000,
  });
}

/** Alias UI — même données que useBoursePrices */
export function useBourseTicker() {
  return useBoursePrices();
}

export function useBourseOpportunity(id: string | undefined) {
  return useQuery({
    queryKey: ["bourse-opportunity", id],
    queryFn: async (): Promise<BourseOpportunity | null> => {
      if (isDevMode()) return MOCK_OPPS.find((o) => o.id === id) ?? MOCK_OPPS[0] ?? null;
      if (!id) return null;
      const call = httpsCallable<{ id: string }, { opportunity: Record<string, unknown> | null }>(
        functions,
        "getBourseOpportunity",
      );
      const result = await call({ id });
      const opp = result.data.opportunity;
      return opp ? normalizeOpportunity({ ...opp, id: opp.id ?? id }) : null;
    },
    enabled: Boolean(id),
    staleTime: 60_000,
  });
}
