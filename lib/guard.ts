import { redirect } from "next/navigation";
import { getSession } from "./auth";

export async function requireStaffPage() {
  const session = await getSession();
  if (!session || session.role === "customer") redirect("/admin/login");
  return session;
}
