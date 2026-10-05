import { createAdminClient } from "@/lib/supabase/admin";
import { hashIp } from "@/lib/ip";

export const MAX_SIGNUPS_PER_IP_PER_DAY = 2;
const WINDOW_MS = 24 * 60 * 60 * 1000;

export async function canRegisterFromIp(ip: string): Promise<boolean> {
  const supabase = createAdminClient();
  const since = new Date(Date.now() - WINDOW_MS).toISOString();

  const { count, error } = await supabase
    .from("signup_ip_log")
    .select("id", { count: "exact", head: true })
    .eq("ip_hash", hashIp(ip))
    .gte("created_at", since);

  if (error) {
    throw new Error(error.message);
  }

  return (count ?? 0) < MAX_SIGNUPS_PER_IP_PER_DAY;
}

export async function recordSignupIp(ip: string): Promise<void> {
  const supabase = createAdminClient();
  const { error } = await supabase.from("signup_ip_log").insert({
    ip_hash: hashIp(ip),
  });

  if (error) {
    throw new Error(error.message);
  }
}
