export default function Loading() {
  return (
    <div className="container py-8">
      <div className="aspect-[16/9] shimmer rounded-2xl mb-8" />
      <div className="grid lg:grid-cols-[1fr_360px] gap-10">
        <div className="space-y-4">
          <div className="h-8 w-3/4 shimmer rounded" />
          <div className="h-4 w-1/2 shimmer rounded" />
          <div className="h-10 w-32 shimmer rounded mt-6" />
          <div className="grid grid-cols-4 gap-3 mt-6">
            {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-20 shimmer rounded-lg" />)}
          </div>
        </div>
        <div className="h-80 shimmer rounded-2xl" />
      </div>
    </div>
  );
}
