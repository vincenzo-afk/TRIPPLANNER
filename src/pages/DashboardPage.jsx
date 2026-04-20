import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../services/firebase";
import { useAuth } from "../context/AuthContext";

export default function DashboardPage() {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    async function fetchTrips() {
      if (!user) return;
      try {
        const q = query(collection(db, "trips"), where("userId", "==", user.uid));
        const querySnapshot = await getDocs(q);

        const tripsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        // Sort in memory to avoid needing a composite index in Firestore immediately
        tripsData.sort((a, b) => {
          const timeA = a.createdAt?.toMillis() || 0;
          const timeB = b.createdAt?.toMillis() || 0;
          return timeB - timeA;
        });

        setTrips(tripsData);
      } catch (err) {
        console.error("Error fetching trips:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchTrips();
  }, [user]);

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
        {trips.length === 0 ? (
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
            {trips.map(trip => (
              <div
                key={trip.id}
                onClick={() => navigate(`/trip/${trip.id}`)}
                className="relative h-[300px] rounded-2xl overflow-hidden group cursor-pointer border border-white/10 hover:border-white/30 transition-all duration-700 shadow-2xl"
              >
                {/* Background Image */}
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 group-hover:scale-105"
                  style={{ backgroundImage: `url(${trip.destinationImage || 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800'})` }}
                />

                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/10 opacity-90 transition-opacity duration-500 group-hover:opacity-100" />

                {/* Content */}
                <div className="relative z-10 p-6 h-full flex flex-col justify-end">
                  <div className="mb-auto flex justify-between items-start">
                    <span className="inline-block px-3 py-1 rounded bg-black/40 backdrop-blur-md text-white/80 text-[10px] uppercase tracking-[0.2em] border border-white/10">
                      {trip.duration} Days
                    </span>
                    <span className="inline-block px-3 py-1 rounded bg-white/10 backdrop-blur-md text-white/80 text-[10px] uppercase tracking-[0.2em]">
                      {trip.budget}
                    </span>
                  </div>

                  <h3 className="text-3xl font-light text-white mb-1 drop-shadow-md">{trip.destinationName}</h3>
                  <p className="text-white/70 text-xs uppercase tracking-wider font-semibold mb-4">
                    {trip.destinationCountry}
                  </p>

                  <div className="text-[10px] text-white/50 uppercase tracking-[0.2em]">
                    {trip.createdAt ? new Date(trip.createdAt.toMillis()).toLocaleDateString() : 'Just now'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
