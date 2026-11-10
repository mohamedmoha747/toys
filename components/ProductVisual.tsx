import type { CSSProperties } from "react";
import type { CategoryKind } from "@/lib/types";

export function KindIcon({ kind }: { kind: CategoryKind }) {
  if (kind === "drone") {
    return (
      <svg viewBox="0 0 48 48" aria-hidden="true">
        <circle cx="24" cy="24" r="5" fill="currentColor" />
        <path d="M24 19 10 8M24 19l14-11M24 29 10 40M24 29l14 11" stroke="currentColor" strokeWidth="2" />
        <circle cx="8" cy="7" r="4" fill="none" stroke="currentColor" strokeWidth="2" />
        <circle cx="40" cy="7" r="4" fill="none" stroke="currentColor" strokeWidth="2" />
        <circle cx="8" cy="41" r="4" fill="none" stroke="currentColor" strokeWidth="2" />
        <circle cx="40" cy="41" r="4" fill="none" stroke="currentColor" strokeWidth="2" />
      </svg>
    );
  }
  if (kind === "boat") {
    return (
      <svg viewBox="0 0 48 48" aria-hidden="true">
        <path d="M6 28h36l-4 8H10L6 28z" fill="currentColor" />
        <path d="M18 28V18h12l6 10" fill="none" stroke="currentColor" strokeWidth="2" />
        <path d="M8 40c4 2 8 2 12 0s8-2 12 0 8 2 12 0" fill="none" stroke="currentColor" strokeWidth="2" />
      </svg>
    );
  }
  if (kind === "plane") {
    return (
      <svg viewBox="0 0 48 48" aria-hidden="true">
        <path d="M4 26 22 22 30 8l4 2-4 12 12 4 4 4-6 2-8-2-6 8-4-2 4-8L6 30l-2-4z" fill="currentColor" />
      </svg>
    );
  }
  if (kind === "heli") {
    return (
      <svg viewBox="0 0 48 48" aria-hidden="true">
        <path d="M8 16h32" stroke="currentColor" strokeWidth="2" />
        <rect x="16" y="18" width="16" height="10" rx="4" fill="currentColor" />
        <path d="M32 23h10M24 28v6M18 34h12" stroke="currentColor" strokeWidth="2" />
      </svg>
    );
  }
  if (kind === "parts") {
    return (
      <svg viewBox="0 0 48 48" aria-hidden="true">
        <rect x="10" y="14" width="28" height="18" rx="3" fill="none" stroke="currentColor" strokeWidth="2" />
        <path d="M16 14v-3h6v3M26 14v-3h6v3M14 32v3h4M30 32v3h4" stroke="currentColor" strokeWidth="2" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true">
      <path d="M8 28c4-8 8-12 14-12h8c4 0 7 2 10 6l4 6H8z" fill="currentColor" />
      <circle cx="16" cy="32" r="4" fill="none" stroke="currentColor" strokeWidth="2" />
      <circle cx="34" cy="32" r="4" fill="none" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

function Scene({ kind }: { kind: CategoryKind }) {
  if (kind === "drone") {
    return (
      <g fill="#fff">
        <circle cx="180" cy="140" r="22" />
        <path d="M180 118 70 48M180 118l110-70M180 162 70 230M180 162l112 62" stroke="#fff" strokeWidth="8" />
        <circle cx="62" cy="42" r="22" fill="none" stroke="#fff" strokeWidth="6" />
        <circle cx="298" cy="42" r="22" fill="none" stroke="#fff" strokeWidth="6" />
        <circle cx="62" cy="236" r="22" fill="none" stroke="#fff" strokeWidth="6" />
        <circle cx="300" cy="230" r="22" fill="none" stroke="#fff" strokeWidth="6" />
        <circle cx="180" cy="140" r="8" fill="#111" />
      </g>
    );
  }
  if (kind === "boat") {
    return (
      <g fill="#fff">
        <path d="M40 150h280l-28 48H70L40 150z" />
        <path d="M120 150V96h90l48 54" fill="none" stroke="#fff" strokeWidth="10" />
        <path d="M30 214c28 14 48 14 76 0s48-14 76 0 48 14 76 0 40-12 70 0" fill="none" stroke="#fff" strokeWidth="6" opacity=".7" />
      </g>
    );
  }
  if (kind === "plane") {
    return (
      <path
        fill="#fff"
        d="M20 150 150 132l48-78 22 10-28 74 78 22 24 20-34 10-52-14-36 48-22-8 24-50L28 176z"
      />
    );
  }
  if (kind === "heli") {
    return (
      <g fill="#fff" stroke="#fff">
        <path d="M40 78h280" strokeWidth="8" />
        <rect x="132" y="96" width="96" height="54" rx="22" fill="#fff" stroke="none" />
        <path d="M228 122h70" strokeWidth="8" />
        <path d="M180 150v36M140 188h80" strokeWidth="8" />
        <circle cx="250" cy="70" r="10" fill="#fff" stroke="none" />
      </g>
    );
  }
  if (kind === "parts") {
    return (
      <g fill="none" stroke="#fff" strokeWidth="8">
        <rect x="78" y="78" width="204" height="120" rx="16" />
        <path d="M118 78V58h36v20M206 78V58h36v20M108 198v22h28M224 198v22h28" />
        <path d="M118 138h124" strokeWidth="6" />
      </g>
    );
  }
  return (
    <g fill="#fff">
      <path d="M36 176c28-62 62-84 108-84h62c22 0 40 10 62 36l34 46c8 10 20 16 34 16h8v28H78c-20 0-36-14-42-32v-10z" />
      <path d="M150 104h52l20 36H132l18-36z" fill="#111" opacity=".85" />
      <circle cx="132" cy="214" r="28" fill="#111" />
      <circle cx="132" cy="214" r="10" fill="#fff" />
      <circle cx="262" cy="214" r="28" fill="#111" />
      <circle cx="262" cy="214" r="10" fill="#fff" />
    </g>
  );
}

export function ProductVisual({
  kind,
  tone,
  className = "",
}: {
  kind: CategoryKind;
  tone: string;
  className?: string;
}) {
  return (
    <div className={`visual ${className}`} style={{ "--tone": tone } as CSSProperties}>
      <svg className="scene" viewBox="0 0 360 280" aria-hidden="true">
        <Scene kind={kind} />
      </svg>
    </div>
  );
}
