"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2 } from "lucide-react";
import { startStripeCheckout } from "@/lib/checkout";
import { FREE_CREDITS, PRO_PRICE_USD } from "@/lib/types";

export default function BillingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    const status = new URLSearchParams(window.location.search).get("status");
    if (status === "cancelled") {
      setNotice("Checkout was cancelled. You can upgrade whenever you are ready.");
      return;
    }
    if (status !== "success") return;

    setNotice("Payment received. Unlocking Pro on your account...");
    let tries = 0;
    const timer = window.setInterval(async () => {
      tries += 1;
      try {
        const response = await fetch("/api/credits");
        const data = (await response.json()) as { is_pro?: boolean };
        if (data.is_pro) {
          window.clearInterval(timer);
          setNotice("You are Pro. Unlimited replies are now unlocked.");
          router.refresh();
          return;
        }
      } catch {
        // Keep polling while Stripe webhook settles.
      }
      if (tries >= 12) {
        window.clearInterval(timer);
        setNotice(
          "Payment succeeded. If Pro is not unlocked in a minute, refresh this page.",
        );
        router.refresh();
      }
    }, 1500);

    return () => window.clearInterval(timer);
  }, [router]);

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
    <div className="mx-auto w-full max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-950">
          Billing
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Manage your plan. Upgrade to Pro for unlimited reply generation.
        </p>
      </div>

      {notice ? (
        <p className="rounded-2xl border border-indigo-100 bg-indigo-50 px-4 py-3 text-sm text-indigo-800">
          {notice}
        </p>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-3xl border border-slate-200 bg-white p-6">
          <p className="text-sm font-medium text-slate-500">Free Tier</p>
          <p className="mt-2 text-4xl font-semibold text-slate-900">$0/mo</p>
          <p className="mt-1 text-sm text-slate-500">
            {FREE_CREDITS} replies total
          </p>
          <ul className="mt-5 space-y-2 text-sm text-slate-600">
            <li className="flex gap-2">
              <Check className="mt-0.5 h-4 w-4 text-slate-400" />
              Tone presets included
            </li>
            <li className="flex gap-2">
              <Check className="mt-0.5 h-4 w-4 text-slate-400" />
              One-click copy replies
            </li>
          </ul>
        </div>

        <div className="rounded-3xl border border-indigo-200 bg-indigo-50/50 p-6 shadow-glow">
          <p className="text-sm font-medium text-indigo-700">Pro Tier</p>
          <p className="mt-2 text-4xl font-semibold text-slate-900">
            ${PRO_PRICE_USD}
            <span className="text-base font-medium text-slate-500">/mo</span>
          </p>
          <p className="mt-1 text-sm text-slate-600">
            Unlimited replies + priority support
          </p>
          <ul className="mt-5 space-y-2 text-sm text-slate-700">
            <li className="flex gap-2">
              <Check className="mt-0.5 h-4 w-4 text-indigo-600" />
              Unlimited Generate Reply
            </li>
            <li className="flex gap-2">
              <Check className="mt-0.5 h-4 w-4 text-indigo-600" />
              Priority email support
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
              <span>Upgrade with Stripe</span>
            )}
          </button>
        </div>
      </div>

      {error ? <p className="text-sm text-rose-600">{error}</p> : null}
    </div>
  );
}
