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

  const { data, error } = await supabase
    .from("users")
    .select("free_credits")
    .eq("id", userId)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  if ((data?.free_credits ?? 0) < 1) {
    return { ok: false as const, remaining: 0 };
  }

  const { data: updated, error: updateError } = await supabase
    .from("users")
    .update({ free_credits: data.free_credits - 1 })
    .eq("id", userId)
    .gt("free_credits", 0)
    .select("free_credits")
    .single();

  if (updateError || !updated) {
    return { ok: false as const, remaining: 0 };
  }

  return { ok: true as const, remaining: updated.free_credits as number };
}
