import Stripe from "stripe";
import { PRO_PRICE_USD } from "@/lib/types";

export function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error("STRIPE_SECRET_KEY is not configured.");
  }

  return new Stripe(key, {
    apiVersion: "2025-02-24.acacia",
    typescript: true,
  });
}

export async function createProCheckoutSession(params: {
  userId: string;
  email: string;
  successUrl: string;
  cancelUrl: string;
  stripeCustomerId?: string | null;
}) {
  const stripe = getStripe();
  const priceId = process.env.STRIPE_PRO_PRICE_ID;

  const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = priceId
    ? [{ price: priceId, quantity: 1 }]
    : [
        {
          quantity: 1,
          price_data: {
            currency: "usd",
            unit_amount: PRO_PRICE_USD * 100,
            recurring: { interval: "month" },
            product_data: {
              name: "ReviewRescue AI Pro",
              description: "Unlimited AI review replies",
            },
          },
        },
      ];

  return stripe.checkout.sessions.create({
    mode: "subscription",
    ...(params.stripeCustomerId
      ? { customer: params.stripeCustomerId }
      : { customer_email: params.email }),
    line_items: lineItems,
    success_url: params.successUrl,
    cancel_url: params.cancelUrl,
    client_reference_id: params.userId,
    metadata: {
      user_id: params.userId,
    },
    subscription_data: {
      metadata: {
        user_id: params.userId,
      },
    },
  });
}

export function stripeId(value: unknown): string | null {
  if (!value) return null;
  if (typeof value === "string") return value;
  if (
    typeof value === "object" &&
    "id" in value &&
    typeof (value as { id: unknown }).id === "string"
  ) {
    return (value as { id: string }).id;
  }
  return null;
}
