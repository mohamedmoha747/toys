"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  return (
    <form
      className="login-card"
      onSubmit={async (event) => {
        event.preventDefault();
        setError("");
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || "Login failed");
          return;
        }
        router.push(data.user.role === "customer" ? "/account" : "/admin");
        router.refresh();
      }}
    >
      <img className="auth-logo" src="/lm-logo.png" alt="Limee enterprise" />
      <h1>Login</h1>
      <label className="field"><span>Email</span><input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required /></label>
      <label className="field"><span>Password</span><input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required /></label>
      {error ? <p className="form-error">{error}</p> : null}
      <button className="primary" type="submit">Login</button>
      <p className="muted">New here? <Link className="linkish" href="/register">Create an account</Link></p>
    </form>
  );
}
