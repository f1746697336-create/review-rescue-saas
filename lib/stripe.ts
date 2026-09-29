import Stripe from "stripe";

export function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error("STRIPE_SECRET_KEY is not configured.");
  }

  return new Stripe(key, {
    // Pin when your Stripe account / SDK version requires a specific date.
    apiVersion: "2024-12-18.acacia" as Stripe.LatestApiVersion,
  });
}

export async function createProCheckoutSession(params: {
  userId: string;
  email: string;
  successUrl: string;
  cancelUrl: string;
}) {
  const stripe = getStripe();
  const priceId = process.env.STRIPE_PRO_PRICE_ID;

  if (!priceId) {
    throw new Error("STRIPE_PRO_PRICE_ID is not configured.");
  }

  return stripe.checkout.sessions.create({
    mode: "subscription",
    customer_email: params.email,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: params.successUrl,
    cancel_url: params.cancelUrl,
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
