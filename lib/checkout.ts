"use client";

export const LEMON_SQUEEZY_CHECKOUT_URL =
  "https://maxtracker.lemonsqueezy.com/checkout/buy/9ca0aaa3-594c-4554-bb11-b80aaa495dc3";

export function openProCheckout() {
  window.open(LEMON_SQUEEZY_CHECKOUT_URL, "_blank");
}

/*
export async function startStripeCheckout() {
  const response = await fetch("/api/checkout", { method: "POST" });
  const data = (await response.json()) as { url?: string; error?: string };

  if (!response.ok || !data.url) {
    throw new Error(data.error ?? "Unable to start Stripe Checkout.");
  }

  window.location.assign(data.url);
}
*/
