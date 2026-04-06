export default function HomeLoading() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 animate-pulse">
      <div className="w-16 h-16 rounded-full bg-white/5" />
      <div className="h-24 w-64 bg-white/5" />
      <div className="h-6 w-48 bg-white/5" />
      <div className="h-px w-48 bg-crimson/20" />
      <div className="h-4 w-32 bg-white/5" />
      <div className="flex gap-4 mt-4">
        <div className="h-13 w-40 bg-white/5" />
        <div className="h-13 w-40 bg-white/5" />
      </div>
    </div>
  );
}
