import type { PlanCode } from "@/types/admin";

export const PLAN_NAMES: Record<PlanCode, string> = { FREE: "Free", PRO: "Pro", BUSINESS: "Business" };

/** Fils to a dinar amount, for example 15000 → "15 JOD". */
export const money = (fils: number, currency = "JOD") =>
  `${(fils / 1000).toLocaleString("en-GB", { minimumFractionDigits: 0, maximumFractionDigits: 3 })} ${currency}`;

export const day = (value: string | null) =>
  value ? new Date(value).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "—";
