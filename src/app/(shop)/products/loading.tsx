export default function ProductsLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-12 animate-pulse">
      {/* Header */}
      <div className="mb-10 space-y-3">
        <div className="h-3 w-32 bg-white/5" />
        <div className="h-12 w-48 bg-white/5" />
      </div>

      <div className="flex flex-col md:flex-row gap-10">
        {/* Sidebar */}
        <aside className="md:w-48 shrink-0 space-y-8">
          <div className="space-y-3">
            <div className="h-3 w-16 bg-white/5" />
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-4 w-20 bg-white/5" />
            ))}
          </div>
          <div className="space-y-3">
            <div className="h-3 w-24 bg-white/5" />
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-4 w-28 bg-white/5" />
            ))}
          </div>
        </aside>

        {/* Grid */}
        <div className="flex-1">
          <div className="h-9 w-full md:max-w-xs bg-white/5 mb-6" />
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="border border-white/5">
                <div className="aspect-[3/4] bg-white/5" />
                <div className="p-4 space-y-2">
                  <div className="h-2 bg-white/5 w-1/2" />
                  <div className="h-3 bg-white/5 w-3/4" />
                  <div className="h-5 bg-white/5 w-1/3" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
