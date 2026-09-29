export type Tone = "professional" | "apologetic" | "refund_replace";

export type Profile = {
  id: string;
  email: string | null;
  credits: number;
  is_pro: boolean;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  created_at: string;
};

export const FREE_CREDITS = 3;
export const PRO_PRICE_USD = 15;

export function creditProgress(credits: number, isPro: boolean) {
  if (isPro) return 100;
  return Math.max(0, Math.min(100, (credits / FREE_CREDITS) * 100));
}

export const TONE_OPTIONS: {
  value: Tone;
  label: string;
  description: string;
}[] = [
  {
    value: "professional",
    label: "Professional",
    description: "Calm, brand-safe, and concise.",
  },
  {
    value: "apologetic",
    label: "Apologetic",
    description: "Empathetic and relationship-first.",
  },
  {
    value: "refund_replace",
    label: "Refund / Replace",
    description: "Offer a clear make-good next step.",
  },
];
