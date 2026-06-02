export default function Loading() {
  return (
    <div className="min-h-screen bg-[#f5f7fb]">
      <div className="max-w-7xl mx-auto px-4 py-6 lg:py-8">
        {/* Breadcrumb */}
        <div className="animate-pulse h-4 bg-gray-200 rounded w-1/3 mb-6" />

        <div className="grid lg:grid-cols-2 gap-6 lg:gap-10">
          {/* Gallery */}
          <div className="animate-pulse space-y-4">
            <div className="aspect-square bg-white border border-gray-100 rounded-2xl" />
            <div className="flex gap-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="w-16 h-16 bg-gray-100 rounded-xl" />
              ))}
            </div>
          </div>

          {/* Info */}
          <div className="animate-pulse space-y-5">
            <div className="h-5 bg-gray-100 rounded w-1/4" />
            <div className="h-8 bg-gray-200 rounded w-3/4" />
            <div className="h-4 bg-gray-100 rounded w-1/2" />
            <div className="h-10 bg-orange-100 rounded w-1/3" />
            <div className="space-y-2 pt-2">
              <div className="h-4 bg-gray-100 rounded w-full" />
              <div className="h-4 bg-gray-100 rounded w-5/6" />
              <div className="h-4 bg-gray-100 rounded w-2/3" />
            </div>
            <div className="flex gap-3 pt-4">
              <div className="h-12 bg-gray-200 rounded-xl flex-1" />
              <div className="h-12 bg-orange-100 rounded-xl flex-1" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
