import { SkeletonGrid } from "@/components/ProductGrid";

export default function CategoryLoading() {
  return (
    <div className="wrap page">
      <p className="loading-note" role="status">
        Loading category…
      </p>
      <div className="skeleton title-skel" />
      <SkeletonGrid />
    </div>
  );
}
