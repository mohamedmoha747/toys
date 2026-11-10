import { AdminShell } from "@/components/admin/AdminShell";
import { DashboardView } from "@/components/admin/DashboardView";
import { requireStaffPage } from "@/lib/guard";

export const dynamic = "force-dynamic";

export default async function AdminHome() {
  const session = await requireStaffPage();
  return (
    <AdminShell name={session.name} role={session.role}>
      <DashboardView />
    </AdminShell>
  );
}
