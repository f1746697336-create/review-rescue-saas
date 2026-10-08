import { GUMROAD_CHECKOUT_URL } from "@/lib/site";

export function UpgradeButton({ className }: { className?: string }) {
  return (
    <div>
      <a
        href={GUMROAD_CHECKOUT_URL}
        target="_blank"
        rel="noopener noreferrer"
        translate="no"
        className={
          className ??
          "mt-6 flex w-full items-center justify-center rounded-xl bg-indigo-600 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
        }
      >
        <span>Upgrade to Pro ($15/mo)</span>
      </a>
      <p className="mt-2 text-center text-[10px] leading-snug text-slate-400">
        After payment, please email us your registered email. We will manually
        upgrade your account to UNLIMITED credits within 12 hours.
      </p>
    </div>
  );
}
