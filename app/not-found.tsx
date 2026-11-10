import Link from "next/link";

export default function NotFound() {
  return (
    <div className="wrap page">
      <div className="page-head">
        <h1>That page is not on the shelf.</h1>
        <p className="muted">The link may be old, or the product was removed from the catalog.</p>
        <p>
          <Link className="enquiry" href="/shop">
            Back to the shop
          </Link>
        </p>
      </div>
    </div>
  );
}
