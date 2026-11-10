"use client";

import { useEffect, useState } from "react";
import { inr } from "@/lib/format";
import { adminJson } from "./AdminShell";

type Dash = {
  orders: number;
  pending: number;
  delivered: number;
  sales: number;
  collected: number;
  deliveryIncome: number;
  pendingCollection: number;
  products: number;
  customers: number;
  stockValue: number;
  lowStock: number;
  outOfStock: number;
  cogs?: number;
  expenses?: number;
  grossProfit?: number;
  netProfit?: number;
  series: { day: string; amount: number }[];
  activity: { id: string; action: string; detail: string; userName: string }[];
};

export function DashboardView() {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [data, setData] = useState<Dash | null>(null);
  const [error, setError] = useState("");

  function load(start = from, end = to) {
    const params = new URLSearchParams();
    if (start) params.set("from", start);
    if (end) params.set("to", end);
    adminJson(`/api/admin/dashboard?${params}`)
      .then(setData)
      .catch((err: Error) => setError(err.message));
  }

  useEffect(() => {
    load();
    // first paint uses today's numbers
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!data) return <p className="loading-note">{error || "Loading dashboard…"}</p>;
  const max = Math.max(...data.series.map((item) => item.amount), 1);
  const cards: [string, string][] = [
    ["Orders", String(data.orders)],
    ["Sales", inr(data.sales)],
    ["Collected", inr(data.collected)],
    ["Pending orders", String(data.pending)],
    ["Delivered", String(data.delivered)],
    ["Products", String(data.products)],
    ["Customers", String(data.customers)],
    ["Stock value", inr(data.stockValue)],
    ["Low stock", String(data.lowStock)],
    ["Out of stock", String(data.outOfStock)],
    ["Delivery income", inr(data.deliveryIncome)],
    ["Not yet collected", inr(data.pendingCollection)],
  ];
  if (data.netProfit != null) {
    cards.push(["Cost of goods", inr(data.cogs || 0)], ["Expenses", inr(data.expenses || 0)], ["Gross profit", inr(data.grossProfit || 0)], ["Net profit", inr(data.netProfit || 0)]);
  }

  return (
    <div>
      <h1>Overview</h1>
      <form className="admin-toolbar" onSubmit={(event) => { event.preventDefault(); load(); }}>
        <input type="date" value={from} onChange={(event) => setFrom(event.target.value)} aria-label="From" />
        <input type="date" value={to} onChange={(event) => setTo(event.target.value)} aria-label="To" />
        <button className="primary" type="submit">Filter</button>
      </form>
      <div className="stats">
        {cards.map(([label, value]) => (
          <article key={label} className="stat"><span>{label}</span><strong>{value}</strong></article>
        ))}
      </div>
      <section className="panel" style={{ marginTop: 16 }}>
        <h2>Sales by day</h2>
        {data.series.length === 0 ? <p className="muted">No sales in this range.</p> : null}
        {data.series.map((item) => (
          <div className="bar-line" key={item.day}>
            <span>{item.day}</span>
            <div className="bar" style={{ width: `${Math.max(8, (item.amount / max) * 100)}%` }} />
            <strong>{inr(item.amount)}</strong>
          </div>
        ))}
      </section>
      <section className="panel" style={{ marginTop: 16 }}>
        <h2>Recent activity</h2>
        <ul className="activity-list">
          {data.activity.map((item) => (
            <li key={item.id}>
              <strong>{item.action}</strong>
              <span>{item.detail}</span>
              <small>{item.userName}</small>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
