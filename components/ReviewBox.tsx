"use client";

import { useState } from "react";
import type { ReviewView } from "@/lib/types";

export function ReviewBox({ productId, reviews }: { productId: string; reviews: ReviewView[] }) {
  const [items, setItems] = useState(reviews);
  const [rating, setRating] = useState(5);
  const [text, setText] = useState("");
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");

  return (
    <section className="section">
      <h2 className="section-title">Reviews</h2>
      <div className="cart-list" style={{ marginTop: 12 }}>
        {items.length === 0 ? <p className="empty">No published reviews yet.</p> : null}
        {items.map((review) => (
          <article key={review.id} className="info-card">
            <strong>{"★".repeat(review.rating)}</strong> {review.authorName}
            <p>{review.text}</p>
          </article>
        ))}
      </div>
      <form
        className="stack-form"
        style={{ marginTop: 12, maxWidth: 520 }}
        onSubmit={async (event) => {
          event.preventDefault();
          setMessage("");
          const res = await fetch("/api/reviews", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ productId, authorName: name, rating, text }),
          });
          const data = await res.json();
          if (!res.ok) {
            setMessage(data.error || "Could not save the review");
            return;
          }
          setMessage("Thanks. A moderator will publish it after a check.");
          setText("");
          if (data.review?.approved) setItems([data.review, ...items]);
        }}
      >
        <label className="field"><span>Your name</span><input value={name} onChange={(event) => setName(event.target.value)} required /></label>
        <label className="field">
          <span>Rating</span>
          <select value={rating} onChange={(event) => setRating(Number(event.target.value))}>
            {[5, 4, 3, 2, 1].map((value) => <option key={value} value={value}>{value} stars</option>)}
          </select>
        </label>
        <label className="field"><span>Review</span><textarea rows={3} value={text} onChange={(event) => setText(event.target.value)} /></label>
        <button className="primary" type="submit">Submit review</button>
        {message ? <p className="muted">{message}</p> : null}
      </form>
    </section>
  );
}
