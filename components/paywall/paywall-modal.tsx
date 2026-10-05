"use client";

import { useState } from "react";
import { Check, Loader2 } from "lucide-react";
import { startStripeCheckout } from "@/lib/checkout";
import { FREE_CREDITS, PRO_PRICE_USD } from "@/lib/types";

export function PaywallModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  async function onUpgrade() {
    setError(null);
    setLoading(true);
    try {
      await startStripeCheckout();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Checkout failed.");
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Close paywall"
      />
      <div className="relative w-full max-w-2xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl">
        <div className="bg-gradient-to-r from-indigo-600 to-violet-600 px-8 py-6 text-white">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-indigo-100">
            You&apos;ve used your free replies
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight">
            Unlock unlimited ReviewRescue
          </h2>
          <p className="mt-1 text-sm text-indigo-100">
            Keep converting angry buyers into public proof you care.
          </p>
        </div>

        <div className="grid gap-4 p-6 sm:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <p className="text-sm font-medium text-slate-500">Free Tier</p>
            <p className="mt-2 text-3xl font-semibold text-slate-900">$0/mo</p>
            <p className="mt-1 text-sm text-slate-500">
              {FREE_CREDITS} replies total
            </p>
            <ul className="mt-4 space-y-2 text-sm text-slate-600">
              <li className="flex gap-2">
                <Check className="mt-0.5 h-4 w-4 text-slate-400" />
                Three AI replies forever
              </li>
              <li className="flex gap-2">
                <Check className="mt-0.5 h-4 w-4 text-slate-400" />
                Standard generation speed
              </li>
            </ul>
            <button
              type="button"
              disabled
              className="mt-6 w-full rounded-xl border border-slate-200 bg-white py-2.5 text-sm font-medium text-slate-400"
            >
              Current plan
            </button>
          </div>

          <div className="rounded-2xl border border-indigo-200 bg-indigo-50/70 p-5 shadow-glow">
            <p className="text-sm font-medium text-indigo-700">Pro Tier</p>
            <p className="mt-2 text-3xl font-semibold text-slate-900">
              ${PRO_PRICE_USD}
              <span className="text-base font-medium text-slate-500">/mo</span>
            </p>
            <p className="mt-1 text-sm text-slate-600">Unlimited replies</p>
            <ul className="mt-4 space-y-2 text-sm text-slate-700">
              <li className="flex gap-2">
                <Check className="mt-0.5 h-4 w-4 text-indigo-600" />
                Unlimited generations
              </li>
              <li className="flex gap-2">
                <Check className="mt-0.5 h-4 w-4 text-indigo-600" />
                Priority support
              </li>
            </ul>
            <button
              type="button"
              onClick={onUpgrade}
              disabled={loading}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-70"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Redirecting to Stripe...
                </span>
              ) : (
                <span>Upgrade to Pro — $15/mo</span>
              )}
            </button>
          </div>
        </div>

        {error ? (
          <p className="px-6 pb-6 text-center text-sm text-rose-600">{error}</p>
        ) : (
          <p className="px-6 pb-6 text-center text-xs text-slate-400">
            Stripe Checkout opens in a secure session. Cancel anytime.
          </p>
        )}
      </div>
    </div>
  );
}
