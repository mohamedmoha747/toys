"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  ["Overview", "/admin"],
  ["Products", "/admin/products"],
  ["Categories", "/admin/categories"],
  ["Inventory", "/admin/inventory"],
  ["Orders", "/admin/orders"],
  ["Customers", "/admin/customers"],
  ["Suppliers", "/admin/suppliers"],
  ["Purchases", "/admin/purchases"],
  ["Finance", "/admin/finance"],
  ["Coupons", "/admin/coupons"],
  ["Reviews", "/admin/reviews"],
  ["Reports", "/admin/reports"],
  ["Settings", "/admin/settings"],
];

export function AdminShell({ name, role, children }: { name: string; role: string; children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <div className="admin-frame">
      <aside className="admin-nav">
        <strong style={{ padding: "4px 10px" }}>{name}</strong>
        <span className="muted" style={{ padding: "0 10px 8px" }}>{role}</span>
        {links.filter(([label]) => role === "superadmin" || label !== "Finance").map(([label, href]) => (
          <Link key={href} href={href} className={pathname === href ? "on" : ""}>
            {label}
          </Link>
        ))}
        <button
          className="ghost"
          type="button"
          onClick={async () => {
            await fetch("/api/auth/logout", { method: "POST" });
            window.location.href = "/admin/login";
          }}
        >
          Log out
        </button>
      </aside>
      <div>{children}</div>
    </div>
  );
}

export async function adminJson(url: string, options?: RequestInit) {
  const res = await fetch(url, {
    ...options,
    headers: {
      ...(options?.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
      ...(options?.headers || {}),
    },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Request failed");
  return data;
}
