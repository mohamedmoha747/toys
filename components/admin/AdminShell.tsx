"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { IconClose, IconMenu } from "../Icons";

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
  ["My Profile", "/admin/account"],
  ["Settings", "/admin/settings"],
];

export function AdminShell({ name, role, children }: { name: string; role: string; children: React.ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const items = links.filter(([label]) => role === "superadmin" || label !== "Finance");
  const current = items.find(([, href]) => href === pathname)?.[0] ?? "Admin";

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/admin/login";
  }

  const nav = (
    <>
      <div className="admin-who">
        <strong>{name}</strong>
        <span className="muted">{role}</span>
        <button className="admin-logout" type="button" onClick={logout}>
          Log out
        </button>
      </div>
      {items.map(([label, href]) => (
        <Link key={href} href={href} className={pathname === href ? "on" : ""}>
          {label}
        </Link>
      ))}
    </>
  );

  return (
    <div className="admin-frame">
      <header className="admin-bar">
        <button className="icon-btn" type="button" aria-label="Open admin menu" onClick={() => setOpen(true)}>
          <IconMenu />
        </button>
        <strong>{current}</strong>
        <button className="admin-logout" type="button" onClick={logout}>
          Log out
        </button>
      </header>
      {open ? (
        <div className="admin-backdrop" onClick={() => setOpen(false)}>
          <aside className="admin-drawer" role="dialog" aria-label="Admin menu" onClick={(event) => event.stopPropagation()}>
            <div className="admin-drawer-head">
              <strong>Admin</strong>
              <button className="icon-btn" type="button" aria-label="Close admin menu" onClick={() => setOpen(false)}>
                <IconClose />
              </button>
            </div>
            {nav}
          </aside>
        </div>
      ) : null}
      <aside className="admin-nav">{nav}</aside>
      <div className="admin-main">{children}</div>
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
