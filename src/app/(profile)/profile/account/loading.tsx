export default function AccountLoading() {
  return (
    <div className="max-w-3xl mx-auto px-4 md:px-8 py-12 space-y-14 animate-pulse">
      {/* Header */}
      <div className="space-y-3">
        <div className="h-3 w-32 bg-white/5" />
        <div className="h-10 w-40 bg-white/5" />
      </div>

      {/* Personal data */}
      <div className="space-y-5">
        <div className="flex items-center gap-4">
          <div className="h-6 w-40 bg-white/5" />
          <div className="flex-1 h-px bg-white/5" />
        </div>
        <div className="space-y-4 max-w-md">
          <div className="h-11 bg-white/5" />
          <div className="h-11 bg-white/5" />
          <div className="h-11 bg-white/5" />
          <div className="h-11 w-36 bg-white/5" />
        </div>
      </div>

      {/* Addresses */}
      <div className="space-y-5">
        <div className="flex items-center gap-4">
          <div className="h-6 w-32 bg-white/5" />
          <div className="flex-1 h-px bg-white/5" />
        </div>
        <div className="space-y-3">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="border border-white/5 p-5 space-y-2">
              <div className="h-4 w-24 bg-white/5" />
              <div className="h-3 w-48 bg-white/5" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
