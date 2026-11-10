"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { CategoryKind } from "@/lib/types";
import { IconChevron } from "./Icons";
import { ProductVisual } from "./ProductVisual";

const slides: { eyebrow: string; title: string; text: string; href: string; cta: string; tone: string; kind: CategoryKind }[] = [
  {
    eyebrow: "RC Cars",
    title: "Weekend race kits are in.",
    text: "Ready-to-run buggies, drift cars and rock crawlers. Charge, bind, and go.",
    href: "/category/rc-cars",
    cta: "Shop cars",
    tone: "#ff7a18",
    kind: "car",
  },
  {
    eyebrow: "RC Drones",
    title: "Stable hover. Clean footage.",
    text: "Camera drones and indoor whoops, with spare props on the shelf.",
    href: "/category/rc-drones",
    cta: "Shop drones",
    tone: "#7c5cff",
    kind: "drone",
  },
  {
    eyebrow: "On the water",
    title: "Self-righting boats for the lake.",
    text: "Speed hulls and scale tugs that come back upright after a hard turn.",
    href: "/category/rc-boats",
    cta: "Shop boats",
    tone: "#1d9bf0",
    kind: "boat",
  },
];

export function Banner() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const slide = slides[index];

  useEffect(() => {
    if (paused) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setInterval(() => setIndex((current) => (current + 1) % slides.length), 5200);
    return () => window.clearInterval(timer);
  }, [paused]);

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
      <button className="banner-nav prev" type="button" aria-label="Previous banner" onClick={() => setIndex((current) => (current + slides.length - 1) % slides.length)}>
        <IconChevron dir="left" />
      </button>
      <button className="banner-nav next" type="button" aria-label="Next banner" onClick={() => setIndex((current) => (current + 1) % slides.length)}>
        <IconChevron dir="right" />
      </button>
      <div className="dots">
        {slides.map((item, dot) => (
          <button key={item.href} className={`dot-btn ${dot === index ? "on" : ""}`} type="button" aria-label={`Show ${item.eyebrow}`} onClick={() => setIndex(dot)} />
        ))}
      </div>
    </section>
  );
}
