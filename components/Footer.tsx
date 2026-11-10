"use client";

import Link from "next/link";
import { useState } from "react";
import type { Category } from "@/lib/types";
import { site } from "@/lib/site";

export function Footer({ categories }: { categories: Category[] }) {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);

  return (
    <footer className="site-footer">
      <div className="wrap foot-grid">
        <div className="foot-brand">
          <div className="brand" style={{ justifyItems: "start" }}>
            <span className="brand-mark">LMS</span>
            <span className="brand-tag">RC Toys</span>
          </div>
          <p style={{ marginTop: 12 }}>
            Remote-control cars, drones, boats, planes and the parts that keep them running. {site.tagline}
          </p>
        </div>
        <div>
          <h3>Quick links</h3>
          <ul>
            <li><Link href="/">Home</Link></li>
            <li><Link href="/shop">Shop</Link></li>
            <li><Link href="/about">About</Link></li>
            <li><Link href="/contact">Contact</Link></li>
            <li><Link href="/admin">Store admin</Link></li>
          </ul>
        </div>
        <div>
          <h3>Shop with us</h3>
          <ul>
            {categories.map((category) => (
              <li key={category.id}>
                <Link href={`/category/${category.slug}`}>{category.name}</Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3>Customer care</h3>
          <ul>
            <li><Link href="/policies/shipping">Shipping policy</Link></li>
            <li><Link href="/policies/returns">Returns & refunds</Link></li>
            <li><Link href="/policies/privacy">Privacy policy</Link></li>
            <li><Link href="/policies/terms">Terms & conditions</Link></li>
            <li><Link href="/faq">FAQ</Link></li>
          </ul>
          <h3 style={{ marginTop: 18 }}>Get in touch</h3>
          <p>{site.address}</p>
          <p><a href={`mailto:${site.email}`}>{site.email}</a></p>
          <p><a href={`tel:+${site.phoneTel}`}>{site.phone}</a></p>
          <form
            className="news"
            onSubmit={(event) => {
              event.preventDefault();
              if (!email.includes("@")) return;
              setDone(true);
              setEmail("");
            }}
          >
            <h3 style={{ marginTop: 16 }}>Stay updated</h3>
            <p>New kits, spares and weekend offers.</p>
            <div style={{ display: "flex", gap: 8 }}>
              <input
                type="email"
                required
                placeholder="Email address"
                aria-label="Email address"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
              <button type="submit">Join</button>
            </div>
            {done ? <p className="ok-note">You are on the list.</p> : null}
          </form>
        </div>
      </div>
      <div className="wrap legal">© {new Date().getFullYear()} LMS RC Toys. All rights reserved.</div>
    </footer>
  );
}
