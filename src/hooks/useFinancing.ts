import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { httpsCallable } from "firebase/functions";
import { useAuth } from "@/hooks/useAuth";
import { functions } from "@/lib/firebase";
import { createFinancingApplication } from "@/services/actions.service";

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

export interface AgentFarmerCard {
  id: string;
  name: string;
  crop: string;
  region: string;
  stage: string;
  status: "ok" | "attention" | "urgent";
  lastVisit: string;
  daysToHarvest: number;
  surfaceHa: number;
}

export interface CulturalEvent {
  id: string;
  cropType: string;
  eventType: "planting" | "harvest" | "fertilizing" | "irrigation";
  monthStart: number;
  monthEnd: number;
  description: string;
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

/** Finance un agriculteur via wallet USD (`createFinancingApplication`) */
export function useCreateFinancingApplication() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: { farmerId: string; amountUsd: number }) =>
      createFinancingApplication(payload),
    onSuccess: (_data, variables) => {
      void qc.invalidateQueries({ queryKey: ["farmer", variables.farmerId] });
      void qc.invalidateQueries({ queryKey: ["farmers"] });
      void qc.invalidateQueries({ queryKey: ["my-financing"] });
      void qc.invalidateQueries({ queryKey: ["userProfile"] });
    },
  });
}

function daysUntil(ts?: { seconds: number } | number | string | null): number {
  if (!ts) return 30;
  const ms =
    typeof ts === "object" && ts && "seconds" in ts
      ? ts.seconds * 1000
      : typeof ts === "number"
        ? ts
        : Date.parse(String(ts));
  if (!Number.isFinite(ms)) return 30;
  return Math.max(0, Math.ceil((ms - Date.now()) / 86_400_000));
}

function mapFinancingStatusToAgentStatus(
  status?: string,
): AgentFarmerCard["status"] {
  if (status === "pending") return "attention";
  if (status === "approved" || status === "active" || status === "completed") return "ok";
  if (status === "urgent" || status === "attention" || status === "ok") {
    return status;
  }
  return "ok";
}

/** Normalise un doc `farmers` (CF getAgentFarmers) vers la carte UI agent */
export function normalizeAgentFarmerCard(raw: Record<string, unknown>): AgentFarmerCard {
  const harvest = raw.nextHarvestDate as { seconds: number } | number | string | null | undefined;
  return {
    id: String(raw.id ?? ""),
    name: String(raw.name ?? ""),
    crop: String(raw.cropType ?? raw.crop ?? ""),
    region: String(raw.region ?? raw.location ?? ""),
    stage: String(raw.growthStage ?? raw.stage ?? "Suivi"),
    status: mapFinancingStatusToAgentStatus(
      typeof raw.agentStatus === "string"
        ? raw.agentStatus
        : typeof raw.status === "string"
          ? raw.status
          : undefined,
    ),
    lastVisit: String(raw.lastVisit ?? "—"),
    daysToHarvest: Number(raw.daysToHarvest ?? daysUntil(harvest)),
    surfaceHa: Number(raw.farmSizeHa ?? raw.surfaceHa ?? raw.surface ?? 0),
  };
}

/** Agriculteurs assignés à l'agent connecté (`getAgentFarmers`) */
export function useAgentFarmers() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["agent-farmers", user?.uid],
    enabled: Boolean(user?.uid),
    queryFn: async (): Promise<AgentFarmerCard[]> => {
      if (!user?.uid) return [];
      const result = await httpsCallable<
        Record<string, never>,
        { farmers: Record<string, unknown>[] }
      >(
        functions,
        "getAgentFarmers",
      )({});
      return (result.data.farmers ?? []).map((r) =>
        normalizeAgentFarmerCard({ ...r, id: r.id ?? "" }),
      );
    },
    staleTime: 60_000,
  });
}

function normalizeCulturalEvent(raw: Record<string, unknown>): CulturalEvent {
  const eventType = String(raw.eventType ?? "planting");
  const allowed = ["planting", "harvest", "fertilizing", "irrigation"] as const;
  return {
    id: String(raw.id ?? ""),
    cropType: String(raw.cropType ?? ""),
    eventType: (allowed.includes(eventType as (typeof allowed)[number])
      ? eventType
      : "planting") as CulturalEvent["eventType"],
    monthStart: Number(raw.monthStart ?? 1),
    monthEnd: Number(raw.monthEnd ?? 1),
    description: String(raw.description ?? ""),
  };
}

/** Calendrier cultural (`getCulturalEvents`) */
export function useCulturalEvents(cropType?: string) {
  return useQuery({
    queryKey: ["cultural-events", cropType],
    queryFn: async (): Promise<CulturalEvent[]> => {
      const result = await httpsCallable<
        { cropType?: string },
        { events: Record<string, unknown>[] }
      >(
        functions,
        "getCulturalEvents",
      )({ cropType });
      return (result.data.events ?? [])
        .map(normalizeCulturalEvent)
        .sort((a, b) => a.monthStart - b.monthStart);
    },
    staleTime: 3_600_000,
  });
}
