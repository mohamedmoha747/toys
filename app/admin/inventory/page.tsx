import { InventoryView } from "@/components/admin/CatalogViews";
import { AdminShell } from "@/components/admin/AdminShell";
import { requireStaffPage } from "@/lib/guard";

export const dynamic = "force-dynamic";

export default async function InventoryPage() {
  const session = await requireStaffPage();
  return (
    <AdminShell name={session.name} role={session.role}>
      <InventoryView superadmin={session.role === "superadmin"} />
    </AdminShell>
  );
}
