import Link from "next/link";

export function Brand() {
  return (
    <Link href="/" className="brand" aria-label="Limee Toys home">
      <img src="/limee-logo.jpg" alt="" className="brand-logo" />
      <span className="brand-text">
        <span className="brand-mark">Limee Toys</span>
        <span className="brand-tag">Toy Store</span>
      </span>
    </Link>
  );
}
