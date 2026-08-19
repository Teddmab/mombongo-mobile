import { useQuery } from "@tanstack/react-query";
import { httpsCallable } from "firebase/functions";
import { functions } from "@/lib/firebase";

export interface Farmer {
  id: string;
  name: string;
  location: string;
  surface: number;
  crops: string[];
  experience: number;
  trustScore: number;
  needed: number;
  raised: number;
  story: string;
  avatar: string;
  image?: string;
}

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
