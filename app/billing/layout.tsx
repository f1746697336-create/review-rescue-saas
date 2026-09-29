import { AppShell } from "@/components/dashboard/app-shell";

export default function BillingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppShell>{children}</AppShell>;
}
