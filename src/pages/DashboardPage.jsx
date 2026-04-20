import { useCallback, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import TripCard from "../components/TripCard";
import { useTrips } from "../hooks/useTrips";
import { deleteTrip } from "../services/trips";

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { trips, setTrips, loading, error } = useTrips(user?.uid);
  const [deletingId, setDeletingId] = useState("");

  const sortedTrips = useMemo(() => {
    const tripsCopy = [...trips];
    tripsCopy.sort((a, b) => {
      const timeA = a.createdAt?.toMillis?.() || 0;
      const timeB = b.createdAt?.toMillis?.() || 0;
      return timeB - timeA;
    });
    return tripsCopy;
  }, [trips]);

  const handleOpenTrip = useCallback(
    (tripId) => {
      navigate(`/trip/${tripId}`);
    },
    [navigate]
  );

  const handleDeleteTrip = useCallback(
    async (e, tripId) => {
      e.preventDefault();
      e.stopPropagation();
      if (!tripId) return;

      const ok = window.confirm(
        "Delete this trip? This will also remove its expenses."
      );
      if (!ok) return;

      setDeletingId(tripId);
      try {
        await deleteTrip(tripId);
        setTrips((prev) => prev.filter((t) => t.id !== tripId));
      } catch (err) {
        console.error("Error deleting trip:", err);
        alert("Failed to delete trip. Please try again.");
      } finally {
        setDeletingId("");
      }
    },
    [setTrips]
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="w-12 h-12 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] pb-20 font-sans selection:bg-white/30">

      {/* Header */}
      <header className="p-6 md:px-12 flex justify-between items-center relative z-20 border-b border-white/10 mb-12">
        <div className="flex items-center gap-6">
          <button onClick={() => navigate("/home")} className="text-white/50 hover:text-white transition-colors text-sm uppercase tracking-widest flex items-center gap-2">
            ← Home
          </button>
        </div>
        <h1 className="text-xl font-light text-white tracking-widest drop-shadow-md">
          MY TRIPS
        </h1>
        <div className="w-[60px]" /> {/* Spacer to center the title */}
      </header>

      <main className="max-w-7xl mx-auto px-6 md:px-12">
        {!!error && (
          <div className="mb-10 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-red-200">
            {error}
          </div>
        )}
        {sortedTrips.length === 0 ? (
          <div className="text-center py-32 border border-white/10 rounded-2xl bg-white/[0.02]">
            <h2 className="text-3xl font-light text-white mb-4">No trips planned yet.</h2>
            <p className="text-white/50 mb-8 font-light">Your next great adventure awaits.</p>
            <button
              onClick={() => navigate("/home")}
              className="px-8 py-3 bg-white text-black text-sm uppercase tracking-wider font-bold rounded hover:bg-white/90 transition-all"
            >
              Plan a Trip
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {sortedTrips.map((trip) => (
              <TripCard
                key={trip.id}
                imageUrl={trip.destinationImage}
                onClick={() => handleOpenTrip(trip.id)}
                className="h-[300px]"
              >
                {/* Content */}
                <div className="p-6 h-full flex flex-col justify-end">
                  <div className="mb-auto flex justify-between items-start">
                    <span className="inline-block px-3 py-1 rounded bg-black/40 backdrop-blur-md text-white/80 text-[10px] uppercase tracking-[0.2em] border border-white/10">
                      {trip.duration} Days
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="inline-block px-3 py-1 rounded bg-white/10 backdrop-blur-md text-white/80 text-[10px] uppercase tracking-[0.2em]">
                        {trip.budget}
                      </span>
                      <button
                        onClick={(e) => handleDeleteTrip(e, trip.id)}
                        disabled={deletingId === trip.id}
                        className="inline-flex items-center justify-center px-3 py-1 rounded bg-black/50 hover:bg-red-500/20 text-white/80 hover:text-red-200 text-[10px] uppercase tracking-[0.2em] border border-white/10 hover:border-red-500/30 transition-colors disabled:opacity-50"
                        aria-label={`Delete ${trip.destinationName} trip`}
                        title="Delete trip"
                      >
                        {deletingId === trip.id ? "..." : "Delete"}
                      </button>
                    </div>
                  </div>

                  <h3 className="text-3xl font-light text-white mb-1 drop-shadow-md">{trip.destinationName}</h3>
                  <p className="text-white/70 text-xs uppercase tracking-wider font-semibold mb-4">
                    {trip.destinationCountry}
                  </p>

                  <div className="text-[10px] text-white/50 uppercase tracking-[0.2em]">
                    {trip.createdAt ? new Date(trip.createdAt.toMillis()).toLocaleDateString() : 'Just now'}
                  </div>
                </div>
              </TripCard>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
