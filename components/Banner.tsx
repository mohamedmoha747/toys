"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { CategoryKind } from "@/lib/types";
import { IconChevron } from "./Icons";
import { ProductVisual } from "./ProductVisual";

const slides: { eyebrow: string; title: string; text: string; href: string; cta: string; tone: string; kind: CategoryKind }[] = [
  {
    eyebrow: "Remote control",
    title: "Weekend race toys are in.",
    text: "Ready-to-run cars for the living room and the park.",
    href: "/category/remote-control-cars",
    cta: "Shop cars",
    tone: "#ff7a18",
    kind: "car",
  },
  {
    eyebrow: "Learning",
    title: "Toys that teach while they play.",
    text: "Letters, shapes and first gadgets for curious kids.",
    href: "/category/educational-toys",
    cta: "Shop learning",
    tone: "#7c5cff",
    kind: "drone",
  },
  {
    eyebrow: "Soft toys",
    title: "A friend for bedtime.",
    text: "Cuddly toys for naps, stories and the first day of school.",
    href: "/category/soft-toys",
    cta: "Shop soft toys",
    tone: "#1d9bf0",
    kind: "boat",
  },
];

export function Banner({ slides: incoming }: { slides?: typeof slides }) {
  const deck = incoming?.length ? incoming : slides;
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const slide = deck[index] || deck[0];

  useEffect(() => {
    if (paused || deck.length < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setInterval(() => setIndex((current) => (current + 1) % deck.length), 5200);
    return () => window.clearInterval(timer);
  }, [paused, deck.length]);

  return (
    <section className="banner" aria-roledescription="carousel" aria-label="Featured collections" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      <div className="banner-viewport">
        <div className="banner-slide" style={{ ["--tone" as string]: slide.tone }}>
          <div className="wrap banner-inner">
            <div className="banner-copy">
              <p className="eyebrow">{slide.eyebrow}</p>
              <h2>{slide.title}</h2>
              <p>{slide.text}</p>
              <Link className="enquiry" href={slide.href}>
                {slide.cta}
              </Link>
            </div>
            <div className="banner-art">
              <ProductVisual kind={slide.kind} tone={slide.tone} />
            </div>
          </div>
        </div>
      </div>
      <button className="banner-nav prev" type="button" aria-label="Previous banner" onClick={() => setIndex((current) => (current + deck.length - 1) % deck.length)}>
        <IconChevron dir="left" />
      </button>
      <button className="banner-nav next" type="button" aria-label="Next banner" onClick={() => setIndex((current) => (current + 1) % deck.length)}>
        <IconChevron dir="right" />
      </button>
      <div className="dots">
        {deck.map((item, dot) => (
          <button key={item.href} className={`dot-btn ${dot === index ? "on" : ""}`} type="button" aria-label={`Show ${item.eyebrow}`} onClick={() => setIndex(dot)} />
        ))}
      </div>
    </section>
  );
}
