"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Copy, Loader2, Sparkles } from "lucide-react";
import { PaywallModal } from "@/components/paywall/paywall-modal";
import { TONE_OPTIONS, type Tone } from "@/lib/types";

export function DashboardWorkspace({
  initialCredits,
  initialIsPro,
}: {
  initialCredits: number;
  initialIsPro: boolean;
}) {
  const router = useRouter();
  const [review, setReview] = useState("");
  const [tone, setTone] = useState<Tone>("professional");
  const [reply, setReply] = useState("");
  const [credits, setCredits] = useState(initialCredits);
  const [isPro, setIsPro] = useState(initialIsPro);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paywallOpen, setPaywallOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  async function onGenerate() {
    setError(null);

    if (!isPro && credits < 1) {
      setPaywallOpen(true);
      return;
    }

    if (review.trim().length < 10) {
      setError("Paste a review with at least 10 characters.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ review, tone }),
      });

      const data = (await response.json()) as {
        reply?: string;
        credits?: number | null;
        is_pro?: boolean;
        error?: string;
        code?: string;
      };

      if (response.status === 402 || data.code === "PAYWALL") {
        setCredits(0);
        setPaywallOpen(true);
        router.refresh();
        return;
      }

      if (!response.ok || !data.reply) {
        throw new Error(data.error ?? "Generation failed.");
      }

      setReply(data.reply);
      if (typeof data.is_pro === "boolean") setIsPro(data.is_pro);
      if (typeof data.credits === "number") setCredits(data.credits);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  async function onCopy() {
    if (!reply) return;
    await navigator.clipboard.writeText(reply);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <>
      <div className="mx-auto w-full max-w-3xl space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-950">
            Rescue a review
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Paste the buyer&apos;s complaint, pick a tone, and generate a public
            English reply.
          </p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <label
            htmlFor="review"
            className="mb-2 block text-sm font-medium text-slate-700"
          >
            Negative review
          </label>
          <textarea
            id="review"
            value={review}
            onChange={(event) => setReview(event.target.value)}
            rows={8}
            placeholder="Paste the Amazon or Etsy review here..."
            className="w-full resize-y rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm leading-relaxed text-slate-800 outline-none ring-indigo-500/20 transition placeholder:text-slate-400 focus:border-indigo-400 focus:bg-white focus:ring-4"
          />

          <p className="mb-3 mt-5 text-sm font-medium text-slate-700">
            Reply tone
          </p>
          <div className="grid gap-3 sm:grid-cols-3">
            {TONE_OPTIONS.map((option) => {
              const selected = tone === option.value;
              return (
                <label
                  key={option.value}
                  className={`cursor-pointer rounded-2xl border p-4 transition ${
                    selected
                      ? "border-indigo-300 bg-indigo-50/80 shadow-glow"
                      : "border-slate-200 bg-white hover:border-slate-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="tone"
                    value={option.value}
                    checked={selected}
                    onChange={() => setTone(option.value)}
                    className="sr-only"
                  />
                  <p className="text-sm font-semibold text-slate-900">
                    {option.label}
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-slate-500">
                    {option.description}
                  </p>
                </label>
              );
            })}
          </div>

          {error ? (
            <p className="mt-4 text-sm text-rose-600">{error}</p>
          ) : null}

          <button
            type="button"
            onClick={onGenerate}
            disabled={loading}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-indigo-600 py-4 text-base font-semibold text-white shadow-glow transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Generating reply...
              </>
            ) : (
              <>
                <Sparkles className="h-5 w-5" />
                Generate Reply
              </>
            )}
          </button>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">
                Generated reply
              </h2>
              <p className="text-xs text-slate-500">
                Copy and paste into your Amazon / Etsy response.
              </p>
            </div>
            <button
              type="button"
              onClick={onCopy}
              disabled={!reply}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-600" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  Copy
                </>
              )}
            </button>
          </div>
          <div className="mt-4 min-h-[140px] rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 px-4 py-4 text-sm leading-relaxed text-slate-700">
            {reply || (
              <span className="text-slate-400">
                Your AI-crafted English reply will appear here.
              </span>
            )}
          </div>
        </div>
      </div>

      <PaywallModal open={paywallOpen} onClose={() => setPaywallOpen(false)} />
    </>
  );
}
