import { FREE_CREDITS } from "@/lib/types";

export const GUMROAD_PRO_CREDITS = 99999;

export type GumroadPayload = Record<string, string>;
export type GumroadAction = "activate" | "revoke" | "ignore";

function asString(value: unknown): string {
  if (value == null) return "";
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  return "";
}

export function flattenGumroadBody(input: unknown): GumroadPayload {
  if (!input || typeof input !== "object") return {};

  const source = input as Record<string, unknown>;
  const nested =
    source.data && typeof source.data === "object"
      ? (source.data as Record<string, unknown>)
      : source;

  const payload: GumroadPayload = {};
  for (const [key, value] of Object.entries(nested)) {
    const text = asString(value);
    if (text) payload[key] = text;
  }
  return payload;
}

export function gumroadEmail(payload: GumroadPayload): string {
  return (
    payload.email ||
    payload.purchaser_email ||
    payload.buyer_email ||
    ""
  )
    .trim()
    .toLowerCase();
}

function isTruthy(value: string | undefined): boolean {
  const normalized = value?.trim().toLowerCase();
  return normalized === "true" || normalized === "1" || normalized === "yes";
}

export function classifyGumroadEvent(payload: GumroadPayload): GumroadAction {
  const resource = (
    payload.resource_name ||
    payload.event ||
    payload.type ||
    ""
  )
    .trim()
    .toLowerCase()
    .replace(/[_-]+/g, " ");

  const cancelled =
    isTruthy(payload.cancelled) ||
    isTruthy(payload.canceled) ||
    isTruthy(payload.subscription_cancelled) ||
    isTruthy(payload.ended) ||
    isTruthy(payload.expired) ||
    isTruthy(payload.dead) ||
    isTruthy(payload.refunded);

  if (
    cancelled ||
    resource.includes("cancel") ||
    resource.includes("ended") ||
    resource.includes("expired") ||
    resource.includes("refund") ||
    resource.includes("dispute")
  ) {
    return "revoke";
  }

  if (
    resource.includes("sale") ||
    resource.includes("subscription") ||
    resource.includes("payment") ||
    resource.includes("ping") ||
    Boolean(payload.subscription_id) ||
    Boolean(payload.sale_id)
  ) {
    return "activate";
  }

  return "ignore";
}

export function gumroadProfileUpdate(action: Exclude<GumroadAction, "ignore">) {
  if (action === "activate") {
    return { is_pro: true, free_credits: GUMROAD_PRO_CREDITS };
  }

  return { is_pro: false, free_credits: FREE_CREDITS };
}
