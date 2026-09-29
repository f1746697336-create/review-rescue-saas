import Link from "next/link";
import { ShieldCheck } from "lucide-react";

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/" className="flex items-center gap-2.5">
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-glow">
        <ShieldCheck className="h-5 w-5" />
      </span>
      {!compact && (
        <span className="text-[15px] font-semibold tracking-tight text-slate-900">
          ReviewRescue <span className="text-indigo-600">AI</span>
        </span>
      )}
    </Link>
  );
}
