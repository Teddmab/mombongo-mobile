import { useQuery } from "@tanstack/react-query";
import { httpsCallable } from "firebase/functions";
import { farmers as MOCK_FARMERS, type Farmer } from "@/data/mock";
import { functions, isDevMode } from "@/lib/firebase";

export type { Farmer };

/** Shape renvoyée par les Cloud Functions getFarmers / getFarmer */
export interface FarmerListing {
  id: string;
  name: string;
  region: string;
  cropType: string;
  farmSizeHa: number;
  requestedAmountUsd: number;
  disbursedAmountUsd: number;
  status: "pending" | "approved" | "active" | "completed";
  nextHarvestDate?: { seconds: number };
  photoUrl?: string;
  experienceYears?: number;
  trustScore?: number;
  story?: string;
}

export function listingToFarmer(f: FarmerListing): Farmer {
  const initials = f.name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0] ?? "")
    .join("")
    .toUpperCase();
  return {
    id: f.id,
    name: f.name,
    location: f.region,
    surface: f.farmSizeHa,
    crops: f.cropType ? [f.cropType] : [],
    experience: f.experienceYears ?? 0,
    trustScore: f.trustScore ?? 90,
    needed: f.requestedAmountUsd,
    raised: f.disbursedAmountUsd,
    story: f.story ?? "",
    avatar: initials || "🌾",
    image: f.photoUrl,
  };
}

function mockToListing(f: (typeof MOCK_FARMERS)[number]): FarmerListing {
  return {
    id: f.id,
    name: f.name,
    region: f.location,
    cropType: f.crops[0] ?? "Cultures variées",
    farmSizeHa: f.surface,
    requestedAmountUsd: f.needed,
    disbursedAmountUsd: f.raised,
    status: f.raised >= f.needed ? "completed" : f.raised > 0 ? "active" : "approved",
    photoUrl: f.image,
    experienceYears: f.experience,
    trustScore: f.trustScore,
    story: f.story,
  };
}

function normalizeListing(raw: Record<string, unknown>): FarmerListing {
  return {
    id: String(raw.id ?? ""),
    name: String(raw.name ?? ""),
    region: String(raw.region ?? raw.location ?? ""),
    cropType: String(raw.cropType ?? (Array.isArray(raw.crops) ? raw.crops[0] : "") ?? ""),
    farmSizeHa: Number(raw.farmSizeHa ?? raw.surface ?? 0),
    requestedAmountUsd: Number(raw.requestedAmountUsd ?? raw.needed ?? 0),
    disbursedAmountUsd: Number(raw.disbursedAmountUsd ?? raw.raised ?? 0),
    status: (raw.status as FarmerListing["status"]) ?? "approved",
    nextHarvestDate: raw.nextHarvestDate as FarmerListing["nextHarvestDate"],
    photoUrl: (raw.photoUrl as string) ?? (raw.image as string) ?? undefined,
    experienceYears: Number(raw.experienceYears ?? raw.experience ?? 0),
    trustScore: Number(raw.trustScore ?? 90),
    story: (raw.story as string) ?? "",
  };
}

export function useFarmers(filters?: { cropType?: string; region?: string }) {
  return useQuery({
    queryKey: ["farmers", filters],
    queryFn: async (): Promise<Farmer[]> => {
      if (isDevMode()) {
        let results = MOCK_FARMERS.map(mockToListing);
        if (filters?.cropType) {
          results = results.filter((f) => f.cropType === filters.cropType);
        }
        if (filters?.region) {
          results = results.filter((f) => f.region.includes(filters.region!));
        }
        return results.map(listingToFarmer);
      }
      const result = await httpsCallable<
        typeof filters,
        { farmers: Record<string, unknown>[] }
      >(
        functions,
        "getFarmers",
      )(filters ?? {});
      return (result.data.farmers ?? []).map((r) => listingToFarmer(normalizeListing(r)));
    },
    staleTime: 60_000,
  });
}

export function useFarmer(id: string | undefined) {
  return useQuery({
    queryKey: ["farmer", id],
    enabled: Boolean(id),
    queryFn: async (): Promise<Farmer | null> => {
      if (isDevMode()) {
        const mock = MOCK_FARMERS.find((f) => f.id === id);
        return mock ? listingToFarmer(mockToListing(mock)) : null;
      }
      const result = await httpsCallable<
        { id: string },
        { farmer: Record<string, unknown> | null }
      >(
        functions,
        "getFarmer",
      )({ id: id! });
      const farmer = result.data.farmer;
      return farmer ? listingToFarmer(normalizeListing({ ...farmer, id: farmer.id ?? id })) : null;
    },
    staleTime: 60_000,
  });
}
