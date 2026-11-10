"use client";

import { useState } from "react";
import { waLink } from "@/lib/site";

export function ContactForm() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");

  return (
    <form
      className="stack-form"
      onSubmit={(event) => {
        event.preventDefault();
        window.open(
          waLink(`Hi LMS, this is ${name} (${phone}). ${message}`),
          "_blank",
          "noopener,noreferrer",
        );
      }}
    >
      <label className="field">
        <span>Name</span>
        <input required value={name} onChange={(event) => setName(event.target.value)} />
      </label>
      <label className="field">
        <span>Phone</span>
        <input required value={phone} onChange={(event) => setPhone(event.target.value)} inputMode="tel" />
      </label>
      <label className="field">
        <span>Message</span>
        <textarea required rows={5} value={message} onChange={(event) => setMessage(event.target.value)} />
      </label>
      <button className="primary" type="submit">
        Send on WhatsApp
      </button>
    </form>
  );
}
