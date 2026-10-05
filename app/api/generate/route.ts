import { streamReviewReply } from "@/lib/ai";
import { consumeCredit, getProfile, refundCredit } from "@/lib/credits";
import { createClient } from "@/lib/supabase/server";
import type { Tone } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const TONES: Tone[] = ["professional", "apologetic", "refund_replace"];

function guardEmptyStream(
  source: ReadableStream<Uint8Array>,
  onEmpty: () => Promise<void>,
): ReadableStream<Uint8Array> {
  const reader = source.getReader();
  let bytes = 0;
  let settled = false;

  const finishIfEmpty = async () => {
    if (settled) return;
    settled = true;
    if (bytes === 0) await onEmpty();
  };

  return new ReadableStream<Uint8Array>({
    async pull(controller) {
      try {
        const { done, value } = await reader.read();
        if (done) {
          await finishIfEmpty();
          controller.close();
          return;
        }
        if (value?.byteLength) bytes += value.byteLength;
        controller.enqueue(value);
      } catch (error) {
        await finishIfEmpty();
        controller.error(error);
      }
    },
    async cancel() {
      await reader.cancel();
      await finishIfEmpty();
    },
  });
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as { review?: string; tone?: Tone };
  const review = body.review?.trim() ?? "";
  const tone = body.tone;

  if (!review || review.length < 10) {
    return Response.json(
      { error: "Paste a review that is at least 10 characters." },
      { status: 400 },
    );
  }

  if (!tone || !TONES.includes(tone)) {
    return Response.json({ error: "Select a valid tone." }, { status: 400 });
  }

  const profile = await getProfile();
  if (!profile) {
    return Response.json(
      { error: "Profile not found. Complete signup and retry." },
      { status: 404 },
    );
  }

  if (!profile.is_pro && profile.credits < 1) {
    return Response.json(
      { error: "No credits remaining.", code: "PAYWALL" },
      { status: 402 },
    );
  }

  const consumed = await consumeCredit(user.id, profile.is_pro);
  if (!consumed.ok) {
    return Response.json(
      { error: "No credits remaining.", code: "PAYWALL" },
      { status: 402 },
    );
  }

  try {
    const stream = guardEmptyStream(await streamReviewReply(review, tone), async () => {
      if (!profile.is_pro) {
        await refundCredit(user.id);
      }
    });
    const remaining = profile.is_pro ? "" : String(consumed.remaining ?? 0);

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        "X-Accel-Buffering": "no",
        "X-Is-Pro": profile.is_pro ? "true" : "false",
        "X-Credits-Remaining": remaining,
      },
    });
  } catch (error) {
    if (!profile.is_pro) {
      await refundCredit(user.id);
    }

    return Response.json(
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
