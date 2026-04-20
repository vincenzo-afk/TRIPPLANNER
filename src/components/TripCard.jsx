export default function TripCard({
  imageUrl,
  onClick,
  children,
  className = "",
}) {
  return (
    <div
      onClick={onClick}
      className={[
        "relative rounded-2xl overflow-hidden group border border-white/10 hover:border-white/30 transition-all duration-700 shadow-2xl",
        onClick ? "cursor-pointer" : "",
        className,
      ].join(" ")}
    >
      <div
        className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 group-hover:scale-105"
        style={{
          backgroundImage: `url(${
            imageUrl ||
            "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=1200"
          })`,
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/10 opacity-90 transition-opacity duration-500 group-hover:opacity-100" />
      <div className="relative z-10 h-full">{children}</div>
    </div>
  );
}

