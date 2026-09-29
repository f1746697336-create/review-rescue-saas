import { redirect } from "next/navigation";
import { DashboardWorkspace } from "@/components/dashboard/workspace";
import { getProfile } from "@/lib/credits";
import { createClient } from "@/lib/supabase/server";
import { FREE_CREDITS } from "@/lib/types";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const profile = await getProfile();

  return (
    <DashboardWorkspace
      initialCredits={profile?.credits ?? FREE_CREDITS}
      initialIsPro={profile?.is_pro ?? false}
    />
  );
}
