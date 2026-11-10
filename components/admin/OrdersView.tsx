"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { inr } from "@/lib/format";
import { orderStatuses, type OrderView } from "@/lib/types";
import { adminJson } from "./AdminShell";

export function OrdersView({ superadmin }: { superadmin: boolean }) {
  const [orders, setOrders] = useState<OrderView[]>([]);
  const [status, setStatus] = useState("");
  const [q, setQ] = useState("");
  const [payment, setPayment] = useState("");
  const [error, setError] = useState("");
  const [open, setOpen] = useState<OrderView | null>(null);

  function load() {
    const params = new URLSearchParams();
    if (status) params.set("status", status);
    if (q) params.set("q", q);
    if (payment) params.set("payment", payment);
    adminJson(`/api/admin/orders?${params}`).then((data) => setOrders(data.orders)).catch((err: Error) => setError(err.message));
  }
  useEffect(() => { load(); }, []);

  async function save(patch: Record<string, unknown>) {
    if (!open) return;
    setError("");
    try {
      const data = await adminJson(`/api/admin/orders/${open.id}`, { method: "PATCH", body: JSON.stringify(patch) });
      setOpen(data.order);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Update failed");
    }
  }

  return (
    <div>
      <h1>Orders</h1>
      {error ? <p className="form-error">{error}</p> : null}
      <form className="shop-search" onSubmit={(event) => { event.preventDefault(); load(); }}>
        <input value={q} placeholder="Order ID, name or phone" onChange={(event) => setQ(event.target.value)} />
        <select value={status} onChange={(event) => setStatus(event.target.value)}>
          <option value="">All statuses</option>
          {orderStatuses.map((item) => <option key={item}>{item}</option>)}
        </select>
        <select value={payment} onChange={(event) => setPayment(event.target.value)}>
          <option value="">Any payment</option>
          <option value="cod">Cash on delivery</option>
          <option value="upi">UPI</option>
        </select>
        <button className="primary" type="submit">Filter</button>
      </form>
      <div className="table-wrap" style={{ marginTop: 12 }}>
        <table>
          <thead><tr><th>Order</th><th>Customer</th><th>Status</th><th>Total</th><th>Collected</th><th></th></tr></thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id}>
                <td>{order.code}</td>
                <td>{order.customerName}<div className="muted">{order.mobile}</div></td>
                <td>{order.status}</td>
                <td>{inr(order.grandTotal)}</td>
                <td>{inr(order.amountCollected)}</td>
                <td><button className="text-btn" type="button" onClick={() => setOpen(order)}>Open</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {open ? (
        <section className="panel" style={{ marginTop: 12 }}>
          <h2>{open.code}</h2>
          <p>{open.customerName} · {open.mobile}</p>
          <p>{open.address}</p>
          <p>{open.paymentPreference === "upi" ? "UPI" : "Cash on delivery"} · {open.collectionStatus}</p>
          {open.items.map((item) => <p key={item.productId}>{item.qty} × {item.name} · {inr(item.unitPrice)} = {inr(item.subtotal)}</p>)}
          <p>Delivery {inr(open.deliveryCharge)} · Discount {inr(open.discount)} · Total {inr(open.grandTotal)}</p>
          <pre style={{ whiteSpace: "pre-wrap" }}>{open.whatsappText}</pre>
          <label className="field"><span>Status</span>
            <select value={open.status} onChange={(event) => save({ status: event.target.value })}>
              {orderStatuses.map((item) => <option key={item}>{item}</option>)}
            </select>
          </label>
          <label className="field"><span>Internal note</span><input defaultValue={open.notes} onBlur={(event) => save({ notes: event.target.value })} /></label>
          <label className="field"><span>Cancel / return reason</span><input defaultValue={open.cancelReason} onBlur={(event) => save({ cancelReason: event.target.value })} /></label>
          <label className="field"><span>Amount collected</span><input defaultValue={open.amountCollected} onBlur={(event) => save({ amountCollected: Number(event.target.value) })} /></label>
          {superadmin ? <label className="field"><span>Refund</span><input defaultValue={open.refundAmount} onBlur={(event) => save({ refundAmount: Number(event.target.value), collectionStatus: "refunded" })} /></label> : null}
          <Link className="ghost" href={`/admin/orders/${open.id}`}>Print invoice</Link>
        </section>
      ) : null}
    </div>
  );
}
