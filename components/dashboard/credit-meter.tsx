import { FREE_CREDITS, creditProgress } from "@/lib/types";

export function CreditMeter({
  credits,
  isPro,
}: {
  credits: number;
  isPro: boolean;
}) {
  const progress = creditProgress(credits, isPro);

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3.5">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-slate-600">
          {isPro ? "Pro plan" : "Free credits"}
        </p>
        <p className="text-xs font-semibold text-slate-900">
          {isPro ? "Unlimited" : `${credits}/${FREE_CREDITS}`}
        </p>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-200">
        <div
          className={`h-full rounded-full transition-all ${
            isPro
              ? "bg-gradient-to-r from-indigo-500 to-violet-500"
              : credits === 0
                ? "bg-rose-400"
                : "bg-indigo-500"
          }`}
          style={{ width: `${progress}%` }}
        />
      </div>
      {!isPro ? (
        <p className="mt-2 text-[11px] leading-relaxed text-slate-500">
          Each Generate Reply uses 1 credit.
        </p>
      ) : (
        <p className="mt-2 text-[11px] leading-relaxed text-indigo-600">
          Priority generation unlocked.
        </p>
      )}
    </div>
  );
}
