"use client";

import { useState } from "react";

export function TrackForm() {
  const [value, setValue] = useState("");
  const [result, setResult] = useState<{ code: string; status: string; items: string[]; grandTotal: number } | null | undefined>(undefined);

  return (
    <form
      className="stack-form"
      onSubmit={async (event) => {
        event.preventDefault();
        const res = await fetch(`/api/orders/track?code=${encodeURIComponent(value.trim())}`);
        const data = await res.json();
        setResult(res.ok ? data.order : null);
      }}
    >
      <label className="field">
        <span>Order ID</span>
        <input value={value} onChange={(event) => setValue(event.target.value)} placeholder="LT1008" aria-label="Order ID" required />
      </label>
      <button className="primary" type="submit">Track</button>
      {result ? (
        <article className="info-card">
          <p className="status">{result.status}</p>
          <p>{result.items.join(", ")}</p>
          <p className="muted">Order {result.code}</p>
        </article>
      ) : null}
      {result === null ? <p className="form-error">No order with that ID yet.</p> : null}
    </form>
  );
}
