import { SuppliersView } from "@/components/admin/BusinessViews";
import { AdminShell } from "@/components/admin/AdminShell";
import { requireStaffPage } from "@/lib/guard";

export const dynamic = "force-dynamic";

export default async function SuppliersPage() {
  const session = await requireStaffPage();
  return <AdminShell name={session.name} role={session.role}><SuppliersView /></AdminShell>;
}
