export default function ProductDetailLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-12 animate-pulse">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-10">
        <div className="h-3 w-10 bg-white/5" />
        <div className="h-3 w-2 bg-white/5" />
        <div className="h-3 w-20 bg-white/5" />
        <div className="h-3 w-2 bg-white/5" />
        <div className="h-3 w-32 bg-white/5" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
        {/* Gallery */}
        <div className="space-y-3">
          <div className="aspect-[4/5] bg-white/5 border border-white/5" />
          <div className="flex gap-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="w-16 h-20 bg-white/5 border border-white/5 shrink-0" />
            ))}
          </div>
        </div>

        {/* Info */}
        <div className="space-y-6">
          <div className="h-3 w-24 bg-white/5" />
          <div className="h-10 w-3/4 bg-white/5" />
          <div className="h-8 w-32 bg-white/5" />
          <div className="h-px bg-white/5" />
          <div className="space-y-3">
            <div className="h-3 w-16 bg-white/5" />
            <div className="flex gap-2">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-8 w-20 bg-white/5 border border-white/5" />
              ))}
            </div>
          </div>
          <div className="space-y-3">
            <div className="h-3 w-16 bg-white/5" />
            <div className="flex gap-2">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="w-12 h-10 bg-white/5 border border-white/5" />
              ))}
            </div>
          </div>
          <div className="h-13 w-full bg-white/5" />
        </div>
      </div>
    </div>
  );
}
