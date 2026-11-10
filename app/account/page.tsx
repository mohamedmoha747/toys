"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { inr } from "@/lib/format";
import type { OrderView } from "@/lib/types";

export default function AccountPage() {
  const [account, setAccount] = useState<{ name: string; email: string; mobile: string; addresses: { line: string }[] } | null>(null);
  const [orders, setOrders] = useState<OrderView[]>([]);
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [address, setAddress] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (!data.user) {
          window.location.href = "/login";
          return;
        }
        setAccount(data.user);
        setName(data.user.name);
        setMobile(data.user.mobile);
        setAddress(data.user.addresses?.[0]?.line || "");
      });
    fetch("/api/account")
      .then((res) => res.json())
      .then((data) => setOrders(data.orders || []));
  }, []);

  if (!account) return <div className="wrap page"><p className="loading-note">Loading account…</p></div>;

  return (
    <div className="wrap page">
      <div className="page-head">
        <h1>My account</h1>
        <p className="muted">{account.email}</p>
      </div>
      <form
        className="stack-form"
        style={{ maxWidth: 560 }}
        onSubmit={async (event) => {
          event.preventDefault();
          const res = await fetch("/api/account", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, mobile, address }),
          });
          setMessage(res.ok ? "Profile saved." : "Could not save.");
        }}
      >
        <label className="field"><span>Name</span><input value={name} onChange={(event) => setName(event.target.value)} /></label>
        <label className="field"><span>Mobile</span><input value={mobile} onChange={(event) => setMobile(event.target.value)} /></label>
        <label className="field"><span>Address</span><textarea rows={3} value={address} onChange={(event) => setAddress(event.target.value)} /></label>
        <button className="primary" type="submit">Save profile</button>
        {message ? <p className="muted">{message}</p> : null}
      </form>
      <h2 style={{ marginTop: 28 }}>Orders</h2>
      <div className="cart-list" style={{ marginTop: 10 }}>
        {orders.length === 0 ? <p className="empty">No orders yet. <Link className="linkish" href="/shop">Shop toys</Link></p> : null}
        {orders.map((order) => (
          <article key={order.id} className="info-card">
            <strong>{order.code}</strong> · {order.status}
            <p>{order.items.map((item) => `${item.qty} × ${item.name}`).join(", ")}</p>
            <p>{inr(order.grandTotal)} · {order.paymentPreference === "upi" ? "UPI" : "Cash on delivery"}</p>
          </article>
        ))}
      </div>
      <button
        className="ghost"
        style={{ marginTop: 16 }}
        type="button"
        onClick={async () => {
          await fetch("/api/auth/logout", { method: "POST" });
          window.location.href = "/";
        }}
      >
        Log out
      </button>
    </div>
  );
}
