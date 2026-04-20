export default function SkeletonCard({ className = "" }) {
  return (
    <div
      className={[
        "rounded-2xl overflow-hidden border border-white/10 bg-white/[0.02] animate-pulse",
        className,
      ].join(" ")}
    >
      <div className="h-56 bg-white/5" />
      <div className="p-6 space-y-3">
        <div className="h-4 w-1/3 bg-white/10 rounded" />
        <div className="h-7 w-2/3 bg-white/10 rounded" />
        <div className="h-4 w-1/2 bg-white/10 rounded" />
        <div className="h-10 w-full bg-white/10 rounded mt-6" />
      </div>
    </div>
  );
}

