import { AccountView } from "@/components/admin/AccountView";
import { AdminShell } from "@/components/admin/AdminShell";
import { requireStaffPage } from "@/lib/guard";

export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const session = await requireStaffPage();
  return (
    <AdminShell name={session.name} role={session.role}>
      <AccountView />
    </AdminShell>
  );
}
