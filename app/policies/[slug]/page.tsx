import type { Metadata } from "next";
import { notFound } from "next/navigation";

const pages: Record<string, { title: string; paragraphs: string[] }> = {
  shipping: {
    title: "Shipping policy",
    paragraphs: [
      "Orders placed before 2 PM on a working day leave the Chennai counter the same evening when the kit is in stock.",
      "Delivery inside Tamil Nadu is free above ₹2,999. Below that, a flat ₹99 covers the courier.",
      "Other states are packed on request. We share the courier charge on WhatsApp before we take payment.",
      "LiPo batteries travel only with a permitted surface courier. Drones and planes go in a double wall box with the props off.",
    ],
  },
  returns: {
    title: "Returns and refunds",
    paragraphs: [
      "Unused kits in the original box can come back within 7 days. Message us the order ID before you ship anything.",
      "Opened LiPo packs, bound radios with a cut bind plug, and crash-damaged parts are not returnable.",
      "If a kit arrives short or dead on arrival, send a photo the same day. We replace the missing part or the whole kit.",
      "Refunds go back to the original payment method within 5 working days after the return reaches the shop.",
    ],
  },
  privacy: {
    title: "Privacy policy",
    paragraphs: [
      "LMS keeps the name, phone number and delivery address you send for an order. We use them to pack, ship and reply.",
      "We do not sell that list. Courier partners see only the label they need.",
      "The newsletter email is used for product notes. Reply stop and we remove it.",
      "Wishlist and cart on this site stay in your browser until you clear them.",
    ],
  },
  terms: {
    title: "Terms and conditions",
    paragraphs: [
      "Prices are in Indian rupees and can change when a shipment lands. The price you confirm on WhatsApp is the price you pay.",
      "Stock on the site updates from the shop counter. If a kit sells between your enquiry and payment, we say so before charging.",
      "Flying and driving these models is your responsibility. Keep drones in line of sight and cars off public roads.",
      "LiPo packs need a balance charger and a fire-safe bag. Do not charge an unattended or damaged pack.",
    ],
  },
};

export function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  return params.then(({ slug }) => ({ title: pages[slug]?.title ?? "Policy" }));
}

export default async function PolicyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = pages[slug];
  if (!page) notFound();
  return (
    <div className="wrap page prose">
      <h1>{page.title}</h1>
      {page.paragraphs.map((paragraph) => (
        <p key={paragraph}>{paragraph}</p>
      ))}
    </div>
  );
}
