"use client";

import { openProCheckout } from "@/lib/checkout";

export function UpgradeButton({ className }: { className?: string }) {
  return (
    <div>
      <button
        type="button"
        translate="no"
        onClick={() => openProCheckout()}
        className={
          className ??
          "mt-6 flex w-full items-center justify-center rounded-xl bg-indigo-600 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
        }
      >
        <span>Upgrade to Pro ($15/mo)</span>
      </button>
      <p className="mt-2 text-center text-[10px] leading-snug text-slate-400">
        After payment, please email us your registered email to activate
        unlimited access.
      </p>
    </div>
  );
}
