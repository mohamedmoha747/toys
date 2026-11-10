import type { Metadata } from "next";

export const metadata: Metadata = { title: "FAQ" };

const faqs = [
  {
    q: "Are the cars and drones ready to run?",
    a: "RTR kits include the radio and the running hardware. Charge the pack, bind if the manual asks, and you can drive or fly the same day.",
  },
  {
    q: "Do you ship outside Chennai?",
    a: "Yes. Tamil Nadu orders over ₹2,999 ship free. Other states are quoted on WhatsApp before we pack the box.",
  },
  {
    q: "Can I order on WhatsApp?",
    a: "Yes. Use Enquiry or the button on a product. Send the model name and quantity and we confirm stock and payment.",
  },
  {
    q: "What if a part breaks?",
    a: "Most LMS chassis have arms, turnbuckles and props on the parts shelf. Message the model name and we will check the bin.",
  },
  {
    q: "How do I track an order?",
    a: "Open Track order and enter the LMS order ID from your confirmation message.",
  },
];

export default function FaqPage() {
  return (
    <div className="wrap page">
      <div className="page-head">
        <h1>FAQ</h1>
        <p className="muted">Short answers. WhatsApp us if yours is not here.</p>
      </div>
      {faqs.map((item) => (
        <details key={item.q} className="faq">
          <summary>{item.q}</summary>
          <p>{item.a}</p>
        </details>
      ))}
    </div>
  );
}
