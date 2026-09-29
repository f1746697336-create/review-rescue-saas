import { redirect } from "next/navigation";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { getProfile } from "@/lib/credits";
import { createClient } from "@/lib/supabase/server";
import { FREE_CREDITS } from "@/lib/types";

export async function AppShell({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const profile = await getProfile();

  return (
    <div className="flex min-h-screen bg-slate-50">
      <div className="sticky top-0 hidden h-screen w-64 shrink-0 lg:block">
        <DashboardSidebar
          credits={profile?.credits ?? FREE_CREDITS}
          isPro={profile?.is_pro ?? false}
          email={profile?.email ?? user.email ?? null}
        />
      </div>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="border-b border-slate-200 bg-white lg:hidden">
          <DashboardSidebar
            credits={profile?.credits ?? FREE_CREDITS}
            isPro={profile?.is_pro ?? false}
            email={profile?.email ?? user.email ?? null}
          />
        </div>
        <main className="flex-1 px-4 py-8 sm:px-8">{children}</main>
      </div>
    </div>
  );
}
