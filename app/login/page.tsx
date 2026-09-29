import Link from "next/link";
import { Logo } from "@/components/logo";
import { AuthForm } from "@/components/auth/auth-form";

export default function LoginPage() {
  return (
    <main className="grid min-h-screen bg-slate-50 lg:grid-cols-2">
      <div className="hidden flex-col justify-between bg-slate-950 p-10 text-white lg:flex">
        <Logo />
        <div>
          <p className="text-3xl font-semibold tracking-tight">
            Reply to every 1-star review like a PR team.
          </p>
          <p className="mt-3 max-w-md text-sm text-slate-300">
            Three free replies. Then upgrade when you are ready to protect the
            storefront at scale.
          </p>
        </div>
        <p className="text-xs text-slate-500">Built for Amazon & Etsy sellers.</p>
      </div>
      <div className="flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="mb-8 lg:hidden">
            <Logo />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            Welcome back
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Sign in to open the dashboard.
          </p>
          <div className="mt-8">
            <AuthForm mode="login" />
          </div>
          <p className="mt-6 text-center text-xs text-slate-400">
            <Link href="/" className="hover:text-slate-600">
              Back to home
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
