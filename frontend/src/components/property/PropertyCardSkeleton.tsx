export default function PropertyCardSkeleton() {
  return (
    <div className="card overflow-hidden">
      <div className="aspect-[4/3] shimmer" />
      <div className="p-4 space-y-3">
        <div className="h-4 w-3/4 shimmer rounded" />
        <div className="h-3 w-1/2 shimmer rounded" />
        <div className="border-t border-ink-100 pt-3 flex justify-between">
          <div className="h-3 w-14 shimmer rounded" />
          <div className="h-3 w-14 shimmer rounded" />
          <div className="h-3 w-16 shimmer rounded" />
        </div>
      </div>
    </div>
  );
}
