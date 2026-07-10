import { httpsCallable } from "firebase/functions";
import { functions } from "@/lib/firebase";

const initiateDepositFn = httpsCallable<
  { amountUsd: number; phone: string; operator: string },
  { depositId: string; status: string }
>(functions, "initiateDeposit");

const getDepositStatusFn = httpsCallable<
  { depositId: string },
  { status: string; amountUsd: number }
>(functions, "getDepositStatus");

const initiateWithdrawFn = httpsCallable<
  { amountUsd: number; phone: string; operator: string },
  { payoutId: string; status: string }
>(functions, "initiateWithdraw");

const getWithdrawStatusFn = httpsCallable<
  { payoutId: string },
  { status: string; amountUsd: number }
>(functions, "getWithdrawStatus");

export async function initiateDeposit(payload: {
  amountUsd: number;
  phone: string;
  operator: string;
}) {
  const { data } = await initiateDepositFn({
    ...payload,
    phone: payload.phone.replace(/\s/g, ""),
  });
  return data;
}

export async function getDepositStatus(depositId: string) {
  const { data } = await getDepositStatusFn({ depositId });
  return data;
}

export async function initiateWithdraw(payload: {
  amountUsd: number;
  phone: string;
  operator: string;
}) {
  const { data } = await initiateWithdrawFn({
    ...payload,
    phone: payload.phone.replace(/\s/g, ""),
  });
  return data;
}

export async function getWithdrawStatus(payoutId: string) {
  const { data } = await getWithdrawStatusFn({ payoutId });
  return data;
}
