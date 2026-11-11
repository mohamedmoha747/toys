"use client";

import { useState } from "react";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("admin@limeetoys.com");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  return (
    <form
      className="login-card admin-login"
      onSubmit={async (event) => {
        event.preventDefault();
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });
        const data = await res.json();
        if (!res.ok || data.user?.role === "customer") {
          setError(data.error || "Staff login only");
          return;
        }
        window.location.href = "/admin";
      }}
    >
      <p className="eyebrow">Limee Toys admin</p>
      <h1>Store login</h1>
      <p className="muted">Super admin: admin@limeetoys.com / limee-admin. Staff: staff@limeetoys.com / staff-demo</p>
      <label className="field"><span>Email</span><input value={email} onChange={(event) => setEmail(event.target.value)} required /></label>
      <label className="field"><span>Password</span><input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required /></label>
      {error ? <p className="form-error">{error}</p> : null}
      <button className="primary" type="submit">Enter admin</button>
    </form>
  );
}
