import { httpsCallable } from "firebase/functions";
import { functions } from "@/lib/firebase";

export type WalletPaymentType = "support" | "reserve" | "subscribe";

const processWalletPaymentFn = httpsCallable<
  { amountUsd: number; type: WalletPaymentType; referenceId?: string },
  { success: boolean }
>(functions, "processWalletPayment");

const createBourseInvestmentFn = httpsCallable<
  { opportunityId: string; amountCdf: number },
  { success: boolean }
>(functions, "createBourseInvestment");

const createFinancingApplicationFn = httpsCallable<
  { farmerId: string; amountUsd: number },
  { success: boolean }
>(functions, "createFinancingApplication");

const submitAgentReportFn = httpsCallable<
  {
    farmerId: string;
    recommendations: string;
    visitDate?: string;
    cropCondition?: number;
    growthStage?: string;
    surfaceHa?: number;
    problems?: string[];
    disbursedUsd?: number;
    additionalNeedUsd?: number;
    nextVisitDate?: string;
    photoUrls?: string[];
  },
  { success: boolean }
>(functions, "submitAgentReport");

const registerFcmTokenFn = httpsCallable<{ token: string }, { success: boolean }>(
  functions,
  "registerFcmToken",
);

const submitUserActionFn = httpsCallable<
  { actionType: string; payload: Record<string, unknown> },
  { success: boolean; actionId: string }
>(functions, "submitUserAction");

const getAgentReportUploadUrlFn = httpsCallable<
  { filename: string; contentType: string },
  { uploadUrl: string; path: string }
>(functions, "getAgentReportUploadUrl");

export async function processWalletPayment(payload: {
  amountUsd: number;
  type: WalletPaymentType;
  referenceId?: string;
}) {
  const { data } = await processWalletPaymentFn(payload);
  return data;
}

export async function createBourseInvestment(payload: {
  opportunityId: string;
  amountCdf: number;
}) {
  const { data } = await createBourseInvestmentFn(payload);
  return data;
}

export async function createFinancingApplication(payload: {
  farmerId: string;
  amountUsd: number;
}) {
  const { data } = await createFinancingApplicationFn(payload);
  return data;
}

export async function submitAgentReport(
  payload: Parameters<typeof submitAgentReportFn>[0] extends infer P ? P : never,
) {
  const { data } = await submitAgentReportFn(payload as never);
  return data;
}

export async function registerFcmToken(token: string) {
  const { data } = await registerFcmTokenFn({ token });
  return data;
}

/** Persiste une action métier (formulaires marché / bourse / financement) */
export async function submitUserAction(
  actionType: string,
  payload: Record<string, unknown>,
) {
  const { data } = await submitUserActionFn({ actionType, payload });
  return data;
}

/** URL signée pour upload photo de rapport agent */
export async function getAgentReportUploadUrl(payload: {
  filename: string;
  contentType: string;
}) {
  const { data } = await getAgentReportUploadUrlFn(payload);
  return data;
}

export function firebaseErrorMessage(err: unknown, fallback: string): string {
  if (err && typeof err === "object" && "message" in err) {
    const msg = String((err as { message: string }).message);
    if (msg.includes("Insufficient") || msg.includes("insuffisant")) {
      return "Solde insuffisant. Rechargez votre wallet.";
    }
    if (msg.includes("unauthenticated") || msg.includes("Login")) {
      return "Connexion requise.";
    }
    return msg.replace(/^Firebase:\s*/i, "").slice(0, 160) || fallback;
  }
  return fallback;
}
