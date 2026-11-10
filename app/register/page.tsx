"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", mobile: "", password: "" });
  const [error, setError] = useState("");

  return (
    <form
      className="login-card"
      onSubmit={async (event) => {
        event.preventDefault();
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || "Could not register");
          return;
        }
        router.push("/account");
        router.refresh();
      }}
    >
      <h1>Create account</h1>
      {(["name", "email", "mobile", "password"] as const).map((field) => (
        <label className="field" key={field}>
          <span>{field}</span>
          <input
            type={field === "password" ? "password" : field === "email" ? "email" : "text"}
            value={form[field]}
            onChange={(event) => setForm({ ...form, [field]: event.target.value })}
            required
          />
        </label>
      ))}
      {error ? <p className="form-error">{error}</p> : null}
      <button className="primary" type="submit">Register</button>
      <p className="muted">Already registered? <Link className="linkish" href="/login">Login</Link></p>
    </form>
  );
}
