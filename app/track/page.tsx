import type { Metadata } from "next";
import { TrackForm } from "@/components/TrackForm";

export const metadata: Metadata = { title: "Track order" };

export default function TrackPage() {
  return (
    <div className="wrap page" style={{ maxWidth: 640 }}>
      <div className="page-head">
        <h1>Track your order</h1>
        <p className="muted">Enter the order ID from your Limee Toys confirmation.</p>
      </div>
      <TrackForm />
    </div>
  );
}
