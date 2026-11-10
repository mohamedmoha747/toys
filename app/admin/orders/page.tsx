import { OrdersView } from "@/components/admin/OrdersView";
import { AdminShell } from "@/components/admin/AdminShell";
import { requireStaffPage } from "@/lib/guard";

export const dynamic = "force-dynamic";

export default async function OrdersPage() {
  const session = await requireStaffPage();
  return (
    <AdminShell name={session.name} role={session.role}>
      <OrdersView superadmin={session.role === "superadmin"} />
    </AdminShell>
  );
}
