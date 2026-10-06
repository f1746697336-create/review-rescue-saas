"use client";

import { Check } from "lucide-react";
import { UpgradeButton } from "@/components/paywall/upgrade-button";
import { FREE_CREDITS, PRO_PRICE_USD } from "@/lib/types";

export function PaywallModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  if (!open) return null;

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
            <p className="text-sm font-medium text-slate-500">
              <span>Free Tier</span>
            </p>
            <p className="mt-2 text-3xl font-semibold text-slate-900">
              <span>$0/mo</span>
            </p>
            <p className="mt-1 text-sm text-slate-500">
              <span>{FREE_CREDITS} replies total</span>
            </p>
            <ul className="mt-4 space-y-2 text-sm text-slate-600">
              <li className="flex gap-2">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                <span>Three AI replies forever</span>
              </li>
              <li className="flex gap-2">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                <span>Standard generation speed</span>
              </li>
            </ul>
            <button
              type="button"
              disabled
              className="mt-6 w-full rounded-xl border border-slate-200 bg-white py-2.5 text-sm font-medium text-slate-400"
            >
              <span>Current plan</span>
            </button>
          </div>

          <div className="rounded-2xl border border-indigo-200 bg-indigo-50/70 p-5 shadow-glow">
            <p className="text-sm font-medium text-indigo-700">
              <span>Pro Tier</span>
            </p>
            <p className="mt-2 text-3xl font-semibold text-slate-900">
              <span>
                ${PRO_PRICE_USD}
                <span className="text-base font-medium text-slate-500">/mo</span>
              </span>
            </p>
            <p className="mt-1 text-sm text-slate-600">
              <span>Unlimited replies</span>
            </p>
            <ul className="mt-4 space-y-2 text-sm text-slate-700">
              <li className="flex gap-2">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-indigo-600" />
                <span>Unlimited generations</span>
              </li>
              <li className="flex gap-2">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-indigo-600" />
                <span>Priority support</span>
              </li>
            </ul>
            <UpgradeButton />
          </div>
        </div>
      </div>
    </div>
  );
}
