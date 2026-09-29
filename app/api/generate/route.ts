import { NextResponse } from "next/server";
import { generateReviewReply } from "@/lib/ai";
import { consumeCredit, getProfile } from "@/lib/credits";
import { createClient } from "@/lib/supabase/server";
import type { Tone } from "@/lib/types";

const TONES: Tone[] = ["professional", "apologetic", "refund_replace"];

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as { review?: string; tone?: Tone };
  const review = body.review?.trim() ?? "";
  const tone = body.tone;

  if (!review || review.length < 10) {
    return NextResponse.json(
      { error: "Paste a review that is at least 10 characters." },
      { status: 400 },
    );
  }

  if (!tone || !TONES.includes(tone)) {
    return NextResponse.json({ error: "Select a valid tone." }, { status: 400 });
  }

  const profile = await getProfile();
  if (!profile) {
    return NextResponse.json(
      { error: "Profile not found. Complete signup and retry." },
      { status: 404 },
    );
  }

  if (!profile.is_pro && profile.credits < 1) {
    return NextResponse.json(
      { error: "No credits remaining.", code: "PAYWALL" },
      { status: 402 },
    );
  }

  const consumed = await consumeCredit(user.id, profile.is_pro);
  if (!consumed.ok) {
    return NextResponse.json(
      { error: "No credits remaining.", code: "PAYWALL" },
      { status: 402 },
    );
  }

  try {
    const reply = await generateReviewReply(review, tone);
    return NextResponse.json({
      reply,
      credits: profile.is_pro ? null : consumed.remaining,
      is_pro: profile.is_pro,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to generate a reply.",
      },
      { status: 500 },
    );
  }
}
