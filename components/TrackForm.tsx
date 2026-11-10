"use client";

import { useState } from "react";
import { sampleOrders } from "@/lib/orders";

export function TrackForm() {
  const [value, setValue] = useState("");
  const [result, setResult] = useState<(typeof sampleOrders)[number] | null | undefined>(undefined);

  return (
    <form
      className="stack-form"
      onSubmit={(event) => {
        event.preventDefault();
        const found = sampleOrders.find((order) => order.id.toLowerCase() === value.trim().toLowerCase());
        setResult(found ?? null);
      }}
    >
      <label className="field">
        <span>Order ID</span>
        <input value={value} onChange={(event) => setValue(event.target.value)} placeholder="LMS1008" aria-label="Order ID" required />
      </label>
      <button className="primary" type="submit">
        Track
      </button>
      <p className="muted">Try a sample: LMS1008, LMS1004 or LMS0991.</p>
      {result ? (
        <article className="info-card">
          <p className={`status ${result.status === "Delivered" ? "delivered" : result.status === "Shipped" ? "shipped" : "out"}`}>
            {result.status}
          </p>
          <p>{result.items}</p>
          <p>{result.eta}</p>
          <p className="muted">Order {result.id}</p>
        </article>
      ) : null}
      {result === null ? <p className="form-error">No order with that ID yet.</p> : null}
    </form>
  );
}
