import Link from "next/link";

export function Brand() {
  return (
    <Link href="/" className="brand" aria-label="Limee Toys home">
      <img src="/lm-logo.png" alt="LM" className="brand-logo" />
    </Link>
  );
}
