import Link from "next/link";
import { Logo } from "@/components/logo";
import { AuthForm } from "@/components/auth/auth-form";

export default function SignupPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6 py-16">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <Logo />
        <h1 className="mt-8 text-2xl font-semibold tracking-tight text-slate-900">
          Start with 3 free replies
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Email and password only. Your free credits are granted on signup.
        </p>
        <div className="mt-8">
          <AuthForm mode="signup" />
        </div>
        <p className="mt-6 text-center text-xs text-slate-400">
          <Link href="/" className="hover:text-slate-600">
            Back to home
          </Link>
        </p>
      </div>
    </main>
  );
}
