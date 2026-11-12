import Link from "next/link";

export function Brand() {
  return (
    <Link href="/" className="brand" aria-label="Limee enterprise home">
      <span className="brand-logo-plate">
        <img src="/lm-logo.png" alt="" className="brand-logo" />
      </span>
      <span className="brand-text">
        <span className="brand-mark">Limee enterprise</span>
      </span>
    </Link>
  );
}
