"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useStore } from "@/components/StoreProvider";
import { inr } from "@/lib/format";
import type { ProductView } from "@/lib/types";

export default function CheckoutPage() {
  const { lines, remove } = useStore();
  const [products, setProducts] = useState<ProductView[]>([]);
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [address, setAddress] = useState("");
  const [coupon, setCoupon] = useState("");
  const [payment, setPayment] = useState<"cod" | "upi">("cod");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<{ code: string; url: string; text: string } | null>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (!data.user) return;
        setName(data.user.name || "");
        setMobile(data.user.mobile || "");
        setAddress(data.user.addresses?.[0]?.line || "");
      })
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    const ids = lines.map((line) => line.id).join(",");
    if (!ids) {
      setProducts([]);
      return;
    }
    fetch(`/api/products?ids=${ids}`, { cache: "no-store" })
      .then((res) => res.json())
      .then((data: { products: ProductView[] }) => setProducts(data.products));
  }, [lines]);

  const rows = lines.map((line) => ({ line, product: products.find((item) => item.id === line.id) || null }));
  const known = rows.filter((row) => row.product);

  async function place(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        mobile,
        address,
        couponCode: coupon,
        paymentPreference: payment,
        items: known.map((row) => ({ productId: row.line.id, qty: row.line.qty })),
      }),
    });
    const data = await res.json();
    setBusy(false);
    if (!res.ok) {
      setError(data.error || "Could not place the order");
      return;
    }
    known.forEach((row) => remove(row.line.id));
    setDone({ code: data.order.code, url: data.whatsappUrl, text: data.order.whatsappText });
    window.open(data.whatsappUrl, "_blank", "noopener,noreferrer");
  }

  if (done) {
    return (
      <div className="wrap page">
        <h1>Order {done.code} saved</h1>
        <p className="muted">WhatsApp should be open with the full order. Press Send there. The order is Pending until the shop confirms it.</p>
        <pre className="info-card" style={{ whiteSpace: "pre-wrap" }}>{done.text}</pre>
        <p><a className="wa-btn" href={done.url}>Open WhatsApp again</a></p>
        <p><Link className="linkish" href="/account">View in my account</Link></p>
      </div>
    );
  }

  return (
    <div className="wrap page">
      <div className="page-head">
        <h1>Checkout</h1>
        <p className="muted">We save the order, then open WhatsApp with every line, charge and total.</p>
      </div>
      {known.length === 0 ? (
        <div className="empty">
          <p>Your cart is empty.</p>
          <Link className="linkish" href="/shop">Browse toys</Link>
        </div>
      ) : (
        <form className="contact-grid" style={{ display: "grid", gap: 16 }} onSubmit={place}>
          <div className="stack-form">
            <label className="field"><span>Name</span><input value={name} onChange={(event) => setName(event.target.value)} required /></label>
            <label className="field"><span>Mobile</span><input value={mobile} onChange={(event) => setMobile(event.target.value)} required /></label>
            <label className="field"><span>Delivery address</span><textarea rows={4} value={address} onChange={(event) => setAddress(event.target.value)} required placeholder="House, street, Chennai" /></label>
            <label className="field"><span>Coupon</span><input value={coupon} onChange={(event) => setCoupon(event.target.value)} placeholder="WELCOME10" /></label>
            <label className="field">
              <span>Payment preference</span>
              <select value={payment} onChange={(event) => setPayment(event.target.value as "cod" | "upi")}>
                <option value="cod">Cash on delivery</option>
                <option value="upi">UPI</option>
              </select>
            </label>
            {error ? <p className="form-error">{error}</p> : null}
            <button className="primary" type="submit" disabled={busy}>{busy ? "Saving…" : "Order via WhatsApp"}</button>
          </div>
          <aside className="summary">
            {known.map((row) => (
              <p key={row.line.id}>{row.line.qty} × {row.product?.name} · {inr((row.product?.price || 0) * row.line.qty)}</p>
            ))}
            <p className="muted">Delivery and discounts are calculated when you place the order. Try coupon WELCOME10 on orders over ₹999.</p>
          </aside>
        </form>
      )}
    </div>
  );
}
