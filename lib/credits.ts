import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/types";

type UserRow = {
  id: string;
  email: string | null;
  free_credits: number;
  is_pro: boolean;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  created_at: string;
};

function toProfile(row: UserRow): Profile {
  return {
    id: row.id,
    email: row.email,
    credits: row.free_credits,
    is_pro: row.is_pro,
    stripe_customer_id: row.stripe_customer_id,
    stripe_subscription_id: row.stripe_subscription_id,
    created_at: row.created_at,
  };
}

export async function getProfile(): Promise<Profile | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data, error } = await supabase
    .from("users")
    .select(
      "id, email, free_credits, is_pro, stripe_customer_id, stripe_subscription_id, created_at",
    )
    .eq("id", user.id)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data ? toProfile(data as UserRow) : null;
}

export async function consumeCredit(userId: string, isPro: boolean) {
  if (isPro) {
    return { ok: true as const, remaining: null };
  }

  const supabase = createAdminClient();

  for (let attempt = 0; attempt < 5; attempt += 1) {
    const { data, error } = await supabase
      .from("users")
      .select("free_credits, is_pro")
      .eq("id", userId)
      .single();

    if (error) {
      throw new Error(error.message);
    }

    const current = data as { free_credits: number; is_pro: boolean } | null;
    if (!current) {
      return { ok: false as const, remaining: 0 };
    }

    if (current.is_pro) {
      return { ok: true as const, remaining: null };
    }

    if (current.free_credits < 1) {
      return { ok: false as const, remaining: 0 };
    }

    const { data: updated, error: updateError } = await supabase
      .from("users")
      .update({ free_credits: current.free_credits - 1 })
      .eq("id", userId)
      .eq("free_credits", current.free_credits)
      .select("free_credits")
      .maybeSingle();

    if (updateError) {
      throw new Error(updateError.message);
    }

    const next = updated as { free_credits: number } | null;
    if (next) {
      return { ok: true as const, remaining: next.free_credits };
    }
  }

  return { ok: false as const, remaining: 0 };
}

export async function refundCredit(userId: string) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("users")
    .select("free_credits, is_pro")
    .eq("id", userId)
    .single();

  const row = data as { free_credits: number; is_pro: boolean } | null;
  if (error || !row || row.is_pro) {
    return;
  }

  await supabase
    .from("users")
    .update({ free_credits: row.free_credits + 1 })
    .eq("id", userId)
    .eq("free_credits", row.free_credits);
}

export async function grantFreeCredits(
  userId: string,
  credits: number,
  email?: string | null,
) {
  const supabase = createAdminClient();
  const { data, error: readError } = await supabase
    .from("users")
    .select("id")
    .eq("id", userId)
    .maybeSingle();

  if (readError) {
    throw new Error(readError.message);
  }

  if (data) {
    const { error } = await supabase
      .from("users")
      .update({
        free_credits: credits,
        ...(email ? { email } : {}),
      })
      .eq("id", userId);
    if (error) throw new Error(error.message);
    return;
  }

  const { error } = await supabase.from("users").insert({
    id: userId,
    email: email ?? null,
    free_credits: credits,
    is_pro: false,
  });

  if (error) {
    throw new Error(error.message);
  }
}
