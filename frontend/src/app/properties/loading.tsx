import PropertyCardSkeleton from '@/components/property/PropertyCardSkeleton';

export default function Loading() {
  return (
    <div className="container py-8 grid md:grid-cols-[280px_1fr] gap-8">
      <div className="hidden md:block">
        <div className="card p-5 space-y-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="space-y-1.5">
              <div className="h-3 w-20 shimmer rounded" />
              <div className="h-9 w-full shimmer rounded" />
            </div>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
        {Array.from({ length: 9 }).map((_, i) => <PropertyCardSkeleton key={i} />)}
      </div>
    </div>
  );
}
