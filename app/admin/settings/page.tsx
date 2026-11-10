import { SettingsView } from "@/components/admin/BusinessViews";
import { AdminShell } from "@/components/admin/AdminShell";
import { requireStaffPage } from "@/lib/guard";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const session = await requireStaffPage();
  return <AdminShell name={session.name} role={session.role}><SettingsView superadmin={session.role === "superadmin"} /></AdminShell>;
}
