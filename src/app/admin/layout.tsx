import { requireAdmin } from "@/lib/auth";
import { AdminShell } from "./AdminShell";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { profile } = await requireAdmin();

  return <AdminShell adminName={profile.name ?? "Admin"}>{children}</AdminShell>;
}
