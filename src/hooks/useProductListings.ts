import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { httpsCallable } from "firebase/functions";
import { functions } from "@/lib/firebase";

export interface ProductListing {
  id: string;
  sellerId: string;
  sellerName: string;
  sellerRole: string;
  commodity: string;
  quantityKg: number;
  quality: "A" | "B" | "C";
  province: string;
  territory: string;
  pricePerKgCdf: number;
  availableFrom: string;
  availableUntil: string;
  description: string;
  photoUrls: string[];
  status: "active" | "matched" | "sold" | "expired" | "cancelled";
  createdAt: string;
}

export interface BuyerOrder {
  id: string;
  buyerId: string;
  buyerName: string;
  buyerRole: string;
  commodity: string;
  quantityKg: number;
  maxPricePerKgCdf: number;
  deliveryProvince: string;
  deliveryTerritory: string;
  neededBy: string;
  description: string;
  status: "open" | "fulfilled" | "cancelled";
  createdAt: string;
  matchCount?: number;
}

export interface BourseMatch {
  id: string;
  listingId: string;
  orderId: string;
  sellerId: string;
  buyerId: string;
  commodity: string;
  quantityKg: number;
  sellerPricePerKgCdf?: number;
  buyerMaxPricePerKgCdf?: number;
  status:
    | "pending_negotiation"
    | "agreed"
    | "contracted"
    | "shipped"
    | "completed";
  agreedPricePerKgCdf?: number;
  totalCdf?: number;
  contractId?: string;
  negotiations?: {
    id: string;
    proposedBy: string;
    proposerRole?: string;
    proposedPricePerKgCdf: number;
    message: string;
    status?: string;
    createdAt: string;
  }[];
  createdAt: string;
}

export interface BourseContract {
  id: string;
  matchId: string;
  sellerId: string;
  buyerId: string;
  commodity: string;
  quantityKg: number;
  pricePerKgCdf: number;
  totalCdf: number;
  deliveryLocation: string;
  paymentTerms: string;
  status: "pending_signatures" | "active" | "shipped" | "fulfilled";
  escrowStatus?: "funded" | "released" | null;
  sellerSignedAt?: string | null;
  buyerSignedAt?: string | null;
  createdAt: string;
}

export function useProductListings(filters?: { commodity?: string; province?: string }) {
  return useQuery({
    queryKey: ["product-listings", filters],
    queryFn: async (): Promise<ProductListing[]> => {
      const call = httpsCallable<typeof filters, { listings: ProductListing[] }>(
        functions,
        "getProductListings",
      );
      return (await call(filters ?? {})).data.listings ?? [];
    },
    staleTime: 60_000,
  });
}

export function useMyProductListings() {
  return useQuery({
    queryKey: ["my-product-listings"],
    queryFn: async (): Promise<ProductListing[]> => {
      const call = httpsCallable<Record<string, never>, { listings: ProductListing[] }>(
        functions,
        "getMyProductListings",
      );
      return (await call({})).data.listings ?? [];
    },
    staleTime: 30_000,
  });
}

export function useBuyerOrders(filters?: { commodity?: string }) {
  return useQuery({
    queryKey: ["buyer-orders", filters],
    queryFn: async (): Promise<BuyerOrder[]> => {
const call = httpsCallable<typeof filters, { orders: BuyerOrder[] }>(
        functions,
        "getBuyerOrders",
      );
      return (await call(filters ?? {})).data.orders ?? [];
    },
    staleTime: 60_000,
  });
}

export function useMyMatches(role: "buyer" | "seller") {
  return useQuery({
    queryKey: ["my-matches", role],
    queryFn: async (): Promise<BourseMatch[]> => {
const call = httpsCallable<{ role: string }, { matches: BourseMatch[] }>(
        functions,
        "getMatches",
      );
      return (await call({ role })).data.matches ?? [];
    },
    staleTime: 15_000,
    refetchInterval: 15_000,
  });
}

export function useMyContracts() {
  return useQuery({
    queryKey: ["my-contracts"],
    queryFn: async (): Promise<BourseContract[]> => {
const call = httpsCallable<Record<string, never>, { contracts: BourseContract[] }>(
        functions,
        "getMyContracts",
      );
      return (await call({})).data.contracts ?? [];
    },
    staleTime: 30_000,
  });
}

export function useCreateProductListing() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      commodity: string;
      quantityKg: number;
      quality: "A" | "B" | "C";
      province: string;
      territory: string;
      pricePerKgCdf: number;
      availableFrom: string;
      availableUntil: string;
      description?: string;
    }) => {
      const call = httpsCallable<typeof payload, { listingId: string }>(
        functions,
        "createProductListing",
      );
      return (await call(payload)).data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["my-product-listings"] });
      qc.invalidateQueries({ queryKey: ["product-listings"] });
    },
  });
}

export function useCreateBuyerOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      commodity: string;
      quantityKg: number;
      maxPricePerKgCdf: number;
      deliveryProvince: string;
      deliveryTerritory?: string;
      neededBy: string;
      description?: string;
    }) => {
      const call = httpsCallable<typeof payload, { orderId: string; matchCount: number }>(
        functions,
        "createBuyerOrder",
      );
      return (await call(payload)).data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["buyer-orders"] });
      qc.invalidateQueries({ queryKey: ["my-matches"] });
    },
  });
}

export function useProposePrice() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      matchId: string;
      proposedPricePerKgCdf: number;
      message?: string;
    }) => {
      const call = httpsCallable<typeof payload, { negotiationId: string }>(
        functions,
        "proposePrice",
      );
      return (await call(payload)).data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["my-matches"] }),
  });
}

export function useAcceptPrice() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { matchId: string; negotiationId?: string }) => {
      const call = httpsCallable<typeof payload, { ok: boolean }>(functions, "acceptPrice");
      return (await call(payload)).data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["my-matches"] }),
  });
}

export function useGenerateContract() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { matchId: string }) => {
      const call = httpsCallable<typeof payload, { contractId: string }>(
        functions,
        "generateContract",
      );
      return (await call(payload)).data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["my-matches"] });
      qc.invalidateQueries({ queryKey: ["my-contracts"] });
    },
  });
}

export function useSignContract() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { contractId: string }) => {
      const call = httpsCallable<typeof payload, { status: string }>(functions, "signContract");
      return (await call(payload)).data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["my-contracts"] }),
  });
}

export function useFundEscrow() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { contractId: string; method: "wallet" | "mobile_money" }) => {
      const call = httpsCallable<typeof payload, { success: boolean; escrowStatus: string }>(
        functions,
        "fundEscrow",
      );
      return (await call(payload)).data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["my-contracts"] }),
  });
}

export function useConfirmShipment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { contractId: string; shipmentNote?: string }) => {
const call = httpsCallable<typeof payload, { success: boolean }>(
        functions,
        "confirmShipment",
      );
      return (await call(payload)).data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["my-contracts"] }),
  });
}

export function useConfirmDelivery() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { contractId: string }) => {
      const call = httpsCallable<typeof payload, { success: boolean }>(
        functions,
        "confirmDelivery",
      );
      return (await call(payload)).data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["my-contracts"] });
      qc.invalidateQueries({ queryKey: ["my-product-listings"] });
    },
  });
}
