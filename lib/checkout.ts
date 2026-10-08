"use client";

import { GUMROAD_CHECKOUT_URL } from "@/lib/site";

export const PRO_CHECKOUT_URL = GUMROAD_CHECKOUT_URL;

/*
Stripe Checkout is paused. Upgrade buttons now open Gumroad.

export async function startStripeCheckout() {
  const response = await fetch("/api/checkout", { method: "POST" });
  const data = (await response.json()) as { url?: string; error?: string };

  if (!response.ok || !data.url) {
    throw new Error(data.error ?? "Unable to start Stripe Checkout.");
  }

  window.location.assign(data.url);
}

export function openProCheckout() {
  window.open(
    "https://maxtracker.lemonsqueezy.com/checkout/buy/9ca0aaa3-594c-4554-bb11-b80aaa495dc3",
    "_blank",
  );
}
*/
