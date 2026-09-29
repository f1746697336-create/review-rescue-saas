import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createProCheckoutSession } from "@/lib/stripe";

export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !user.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const origin =
    process.env.NEXT_PUBLIC_APP_URL ??
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

  try {
    const session = await createProCheckoutSession({
      userId: user.id,
      email: user.email,
      successUrl: `${origin}/billing?status=success`,
      cancelUrl: `${origin}/billing?status=cancelled`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to start Stripe Checkout.",
      },
      { status: 500 },
    );
  }
}
