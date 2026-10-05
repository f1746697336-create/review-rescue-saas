import { NextResponse } from "next/server";
import { grantFreeCredits } from "@/lib/credits";
import { getClientIp } from "@/lib/ip";
import { canRegisterFromIp, recordSignupIp } from "@/lib/signup-limit";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { FREE_CREDITS } from "@/lib/types";

export async function POST(request: Request) {
  const body = (await request.json()) as {
    email?: string;
    password?: string;
  };

  const email = body.email?.trim().toLowerCase() ?? "";
  const password = body.password ?? "";

  if (!email || !email.includes("@")) {
    return NextResponse.json({ error: "Enter a valid email." }, { status: 400 });
  }

  if (password.length < 6) {
    return NextResponse.json(
      { error: "Password must be at least 6 characters." },
      { status: 400 },
    );
  }

  const ip = getClientIp(request);

  try {
    const allowed = await canRegisterFromIp(ip);
    if (!allowed) {
      return NextResponse.json(
        {
          error:
            "Too many accounts were created from this network today. Try again tomorrow.",
        },
        { status: 429 },
      );
    }
  } catch {
    return NextResponse.json(
      { error: "Signup is temporarily unavailable. Please try again." },
      { status: 503 },
    );
  }

  const admin = createAdminClient();
  const { data: created, error: createError } = await admin.auth.admin.createUser(
    {
      email,
      password,
      email_confirm: true,
    },
  );

  if (createError || !created.user) {
    return NextResponse.json(
      { error: createError?.message ?? "Could not create account." },
      { status: 400 },
    );
  }

  try {
    await recordSignupIp(ip);
    await grantFreeCredits(created.user.id, FREE_CREDITS, email);
  } catch {
    // Account exists; credits/IP logging can be retried by support if needed.
  }

  const supabase = await createClient();
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (signInError) {
    return NextResponse.json(
      { error: "Account created. Please sign in." },
      { status: 201 },
    );
  }

  return NextResponse.json({ ok: true });
}
