import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getSettings } from "@/lib/shop";

const titles = { shipping: "Shipping policy", returns: "Returns and refunds", privacy: "Privacy policy", terms: "Terms and conditions" };

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  return { title: titles[slug as keyof typeof titles] || "Policy" };
}

export default async function PolicyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!(slug in titles)) notFound();
  const settings = await getSettings();
  const text = settings.policies[slug as keyof typeof settings.policies];
  return (
    <div className="wrap page prose">
      <h1>{titles[slug as keyof typeof titles]}</h1>
      {text.split("\n").filter(Boolean).map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
    </div>
  );
}
