import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  MessageSquareQuote,
  Sparkles,
  Zap,
} from "lucide-react";
import { Logo } from "@/components/logo";
import { FREE_CREDITS, PRO_PRICE_USD } from "@/lib/types";

export default function LandingPage() {
  return (
    <main className="min-h-screen overflow-hidden bg-white">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[520px] bg-[radial-gradient(ellipse_at_top,_rgba(99,102,241,0.16),_transparent_60%)]" />
      <div className="pointer-events-none absolute inset-0 grid-fade opacity-60" />

      <header className="relative mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <Logo />
        <nav className="flex items-center gap-3">
          <Link
            href="/login"
            className="hidden rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:text-slate-900 sm:inline"
          >
            Sign in
          </Link>
          <Link
            href="/signup"
            className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-glow transition hover:bg-indigo-700"
          >
            <span>Start free</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </nav>
      </header>

      <section className="relative mx-auto max-w-6xl px-6 pb-20 pt-16 sm:pt-24">
        <div className="mx-auto max-w-3xl text-center">
          <p className="inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Built for Amazon & Etsy sellers</span>
          </p>
          <h1 className="mt-6 text-4xl font-semibold tracking-tight text-slate-950 sm:text-6xl sm:leading-[1.05]">
            Turn 1-star reviews into
            <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
              {" "}
              public wins
            </span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-slate-600 sm:text-lg">
            Paste a negative buyer review. Choose a tone. ReviewRescue AI drafts
            a polished English PR reply in seconds — so your storefront always
            looks professional.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 rounded-2xl bg-indigo-600 px-6 py-3.5 text-sm font-semibold text-white shadow-glow transition hover:bg-indigo-700"
            >
              <span>Get {FREE_CREDITS} free replies</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-6 py-3.5 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
            >
              Open dashboard
            </Link>
          </div>
          <p className="mt-4 text-xs text-slate-400">
            No card required · Email signup · Credits start instantly
          </p>
        </div>

        <div className="mx-auto mt-16 max-w-4xl overflow-hidden rounded-3xl border border-slate-200 bg-white/80 shadow-glow backdrop-blur">
          <div className="flex items-center gap-2 border-b border-slate-100 bg-slate-50/80 px-4 py-3">
            <span className="h-2.5 w-2.5 rounded-full bg-rose-400" />
            <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
            <span className="ml-2 text-xs font-medium text-slate-400">
              dashboard / generate
            </span>
          </div>
          <div className="grid gap-0 md:grid-cols-2">
            <div className="border-b border-slate-100 p-6 md:border-b-0 md:border-r">
              <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate-400">
                Negative review
              </p>
              <p className="mt-3 text-sm leading-relaxed text-slate-700">
                “Package arrived late and the color was nothing like the photos.
                Extremely disappointed — would not buy again.”
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                {["Professional", "Apologetic", "Refund / Replace"].map(
                  (tone, index) => (
                    <span
                      key={tone}
                      className={`rounded-full border px-3 py-1 text-xs font-medium ${
                        index === 1
                          ? "border-indigo-200 bg-indigo-50 text-indigo-700"
                          : "border-slate-200 bg-white text-slate-500"
                      }`}
                    >
                      {tone}
                    </span>
                  ),
                )}
              </div>
            </div>
            <div className="bg-gradient-to-br from-indigo-50/50 to-white p-6">
              <p className="text-xs font-medium uppercase tracking-[0.16em] text-indigo-500">
                AI reply
              </p>
              <p className="mt-3 text-sm leading-relaxed text-slate-700">
                Thank you for sharing this — we are truly sorry the delivery and
                color did not meet your expectations. Please message us with your
                order number so we can arrange a replacement or refund right
                away.
              </p>
              <div className="mt-5 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-3 py-2 text-xs font-semibold text-white">
                <Zap className="h-3.5 w-3.5" />
                <span>Generated in under 3s</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-slate-100 bg-slate-50/70 py-20">
        <div className="mx-auto grid max-w-6xl gap-8 px-6 md:grid-cols-3">
          {[
            {
              icon: MessageSquareQuote,
              title: "Paste any angry review",
              body: "Drop in the exact buyer text from Amazon or Etsy. No templates to hunt.",
            },
            {
              icon: Sparkles,
              title: "Pick the right tone",
              body: "Professional, apologetic, or refund/replace — match the moment instantly.",
            },
            {
              icon: CheckCircle2,
              title: "Copy & post with confidence",
              body: "Get a brand-safe English reply ready for your public response thread.",
            },
          ].map((item) => (
            <div key={item.title} className="rounded-2xl border border-slate-200 bg-white p-6">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                <item.icon className="h-5 w-5" />
              </span>
              <h2 className="mt-4 text-lg font-semibold text-slate-900">
                {item.title}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                {item.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto max-w-6xl px-6 text-center">
          <h2 className="text-3xl font-semibold tracking-tight text-slate-950">
            Simple pricing that forces action
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            Start free. Upgrade when your free replies run out.
          </p>
          <div className="mx-auto mt-10 grid max-w-3xl gap-4 sm:grid-cols-2">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 text-left">
              <p className="text-sm font-medium text-slate-500">Free</p>
              <p className="mt-2 text-4xl font-semibold text-slate-900">$0</p>
              <p className="mt-1 text-sm text-slate-500">
                {FREE_CREDITS} replies total
              </p>
            </div>
            <div className="rounded-3xl border border-indigo-200 bg-indigo-50/60 p-6 text-left shadow-glow">
              <p className="text-sm font-medium text-indigo-700">Pro</p>
              <p className="mt-2 text-4xl font-semibold text-slate-900">
                ${PRO_PRICE_USD}
                <span className="text-base font-medium text-slate-500">/mo</span>
              </p>
              <p className="mt-1 text-sm text-slate-600">
                Unlimited replies + priority support
              </p>
            </div>
          </div>
          <Link
            href="/signup"
            className="mt-8 inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            <span>Create your free account</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <footer className="border-t border-slate-100 py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-6 sm:flex-row">
          <Logo />
          <p className="text-xs text-slate-400">
            © {new Date().getFullYear()} ReviewRescue AI. All rights reserved.
          </p>
        </div>
      </footer>
    </main>
  );
}
