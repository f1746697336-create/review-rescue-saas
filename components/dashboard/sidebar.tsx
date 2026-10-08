"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { CreditCard, Home, LogOut } from "lucide-react";
import { Logo } from "@/components/logo";
import { CreditMeter } from "@/components/dashboard/credit-meter";
import { ContactSupport } from "@/components/support/contact-support";
import { createClient } from "@/lib/supabase/client";

const NAV = [
  { href: "/dashboard", label: "Home", icon: Home },
  { href: "/billing", label: "Billing", icon: CreditCard },
];

export function DashboardSidebar({
  credits,
  isPro,
  email,
}: {
  credits: number;
  isPro: boolean;
  email: string | null;
}) {
  const pathname = usePathname();
  const router = useRouter();

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <aside className="flex h-full w-full flex-col border-r border-slate-200 bg-white">
      <div className="border-b border-slate-100 px-5 py-5">
        <Logo />
      </div>

      <nav className="flex flex-1 flex-col gap-1 px-3 py-4">
        {NAV.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                active
                  ? "bg-indigo-50 text-indigo-700"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="space-y-3 border-t border-slate-100 p-4">
        <CreditMeter credits={credits} isPro={isPro} />
        <div className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2.5">
          <p className="truncate text-xs font-medium text-slate-700">
            {email ?? "Signed in"}
          </p>
          <button
            type="button"
            translate="no"
            onClick={signOut}
            className="mt-1.5 inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 transition hover:text-rose-600"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Sign out</span>
          </button>
        </div>
        <ContactSupport className="block text-[11px] leading-relaxed text-slate-500 transition hover:text-indigo-600" />
      </div>
    </aside>
  );
}
