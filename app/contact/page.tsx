import type { Metadata } from "next";
import { ContactForm } from "@/components/ContactForm";
import { site, waLink } from "@/lib/site";

export const metadata: Metadata = { title: "Contact" };

export default function ContactPage() {
  return (
    <div className="wrap page">
      <div className="page-head">
        <h1>Contact LMS</h1>
        <p className="muted">Ask about stock, a bundle, or a spare before it sells out.</p>
      </div>
      <div className="contact-grid" style={{ display: "grid", gap: 16 }}>
        <ContactForm />
        <aside className="info-card prose">
          <h2>Shop</h2>
          <p>{site.address}</p>
          <p>
            <a href={`tel:+${site.phoneTel}`}>{site.phone}</a>
          </p>
          <p>
            <a href={`mailto:${site.email}`}>{site.email}</a>
          </p>
          <p>
            <a className="wa-btn" href={waLink("Hi LMS, I have a question.")} target="_blank" rel="noreferrer">
              Open WhatsApp
            </a>
          </p>
        </aside>
      </div>
    </div>
  );
}
