"use client";

export async function startStripeCheckout() {
  const response = await fetch("/api/checkout", { method: "POST" });
  const data = (await response.json()) as { url?: string; error?: string };

  if (!response.ok || !data.url) {
    throw new Error(data.error ?? "Unable to start Stripe Checkout.");
  }

  window.location.assign(data.url);
}
