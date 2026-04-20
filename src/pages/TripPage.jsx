import { useCallback, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../services/firebase";
import { generateItinerary } from "../services/ai";

export default function TripPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retryAfterSeconds, setRetryAfterSeconds] = useState(null);

  const fetchOrGenerateTrip = useCallback(async () => {
    setLoading(true);
    setError("");
    setRetryAfterSeconds(null);
    try {
      const docRef = doc(db, "trips", id);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        setError("Trip not found.");
        return;
      }

      const tripData = docSnap.data();

      // If itinerary doesn't exist yet, we generate it
      if (!tripData.itinerary) {
        const generatedItinerary = await generateItinerary(
          { name: tripData.destinationName, country: tripData.destinationCountry },
          tripData.duration,
          tripData.budget
        );

        // Update Firebase
        await updateDoc(docRef, { itinerary: generatedItinerary });
        tripData.itinerary = generatedItinerary;
      }

      setTrip(tripData);
    } catch (err) {
      console.error(err);
      setRetryAfterSeconds(err?.retryAfterSeconds ?? null);
      setError(
        err?.message || "Something went wrong while loading your itinerary."
      );
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    const t = setTimeout(() => {
      fetchOrGenerateTrip();
    }, 0);
    return () => clearTimeout(t);
  }, [fetchOrGenerateTrip]);

  useEffect(() => {
    if (!retryAfterSeconds || retryAfterSeconds <= 0) return undefined;
    const t = setInterval(() => {
      setRetryAfterSeconds((s) => {
        if (!s) return s;
        return s <= 1 ? 0 : s - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [retryAfterSeconds]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-black relative">
        <div className="relative z-10 text-center">
          <div className="w-16 h-16 border-2 border-white border-t-transparent rounded-full animate-spin mb-8 mx-auto"></div>
          <h2 className="text-2xl font-light text-white mb-2 animate-pulse tracking-wide">Crafting Your Itinerary...</h2>
          <p className="text-white/60 max-w-sm mx-auto font-light">
            Meticulously planning your day-by-day experience.
          </p>
        </div>
      </div>
    );
  }

  if (error || !trip) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center">
          <p className="text-red-400 text-xl mb-4 font-light">{error}</p>
          {typeof retryAfterSeconds === "number" && retryAfterSeconds > 0 && (
            <p className="text-white/60 text-sm mb-4">
              Retry available in {retryAfterSeconds}s
            </p>
          )}
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => fetchOrGenerateTrip()}
              disabled={typeof retryAfterSeconds === "number" && retryAfterSeconds > 0}
              className="px-6 py-2 bg-white text-black font-semibold rounded-lg disabled:opacity-50"
            >
              Try Again
            </button>
            <button
              onClick={() => navigate("/home")}
              className="px-6 py-2 bg-transparent border border-white/20 text-white font-semibold rounded-lg"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20 relative bg-[#0a0a0a] font-sans selection:bg-white/30">
      {/* Hero Header */}
      <div className="relative h-[45vh] min-h-[400px]">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${trip.destinationImage})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/50 to-black/30" />
        
        <div className="absolute inset-0 flex flex-col justify-end p-8 md:p-12 max-w-5xl mx-auto w-full">
          <button onClick={() => navigate("/home")} className="text-white/50 hover:text-white mb-auto mt-4 self-start flex items-center gap-2 text-xs uppercase tracking-widest backdrop-blur-md bg-black/20 border border-white/10 px-5 py-2.5 rounded transition-all hover:bg-black/40">
            ← Home
          </button>
          
          <h1 className="text-5xl md:text-7xl font-light text-white mb-4 drop-shadow-lg tracking-tight">
            {trip.destinationName}
          </h1>
          <div className="flex flex-wrap items-center gap-4 md:gap-6 text-white/70 text-sm md:text-base uppercase tracking-wider font-semibold">
            <span>{trip.destinationCountry}</span>
            <span className="w-1 h-1 rounded-full bg-white/50"></span>
            <span>{trip.duration} Days</span>
            <span className="w-1 h-1 rounded-full bg-white/50"></span>
            <span>{trip.budget} Budget</span>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 mt-12 relative z-10">
        {/* Actions */}
        <div className="flex justify-end mb-12">
          <button 
            onClick={() => navigate(`/expenses/${id}`)}
            className="flex items-center gap-2 bg-white text-black px-6 py-3 rounded text-sm uppercase tracking-wider font-bold transition-all duration-300 hover:bg-white/90 hover:-translate-y-1 shadow-xl"
          >
            Manage Expenses →
          </button>
        </div>

        {/* Itinerary Timeline */}
        <div className="space-y-8">
          {trip.itinerary?.map((dayPlan, idx) => (
            <div key={idx} className="relative pl-8 md:pl-0">
              
              {/* Timeline line (visible on md+) */}
              <div className="hidden md:block absolute left-[120px] top-0 bottom-[-32px] w-0.5 bg-white/10" />
              
              <div className="md:flex gap-8 items-start relative">
                
                {/* Day Badge */}
                <div className="md:w-[140px] shrink-0 mb-6 md:mb-0 relative z-10">
                  <div className="bg-black/60 backdrop-blur-md border border-white/10 text-white rounded p-6 text-center shadow-2xl">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-white/50 mb-2">Day</p>
                    <p className="text-4xl font-light">{dayPlan.day || (idx + 1)}</p>
                  </div>
                </div>

                {/* Day Content Card */}
                <div className="flex-1 rounded p-8 md:p-10 border border-white/5 bg-white/[0.02] backdrop-blur-sm hover:bg-white/[0.04] transition-colors">
                  <h3 className="text-3xl font-light text-white mb-8 tracking-wide">
                    {dayPlan.title}
                  </h3>
                  
                  <div className="space-y-6">
                    {dayPlan.activities?.map((activity, aIdx) => {
                      const isMorning = activity.toLowerCase().includes("morning");
                      const isAfternoon = activity.toLowerCase().includes("afternoon");
                      const isEvening = activity.toLowerCase().includes("evening") || activity.toLowerCase().includes("night");
                      
                      let timeLabel = "Anytime";
                      if (isMorning) timeLabel = "Morning";
                      else if (isAfternoon) timeLabel = "Afternoon";
                      else if (isEvening) timeLabel = "Evening";

                      return (
                        <div key={aIdx} className="flex gap-6 items-start border-b border-white/5 pb-6 last:border-0 last:pb-0">
                          <div className="w-24 shrink-0 pt-1">
                             <span className="text-xs uppercase tracking-widest text-white/40">{timeLabel}</span>
                          </div>
                          <p className="text-white/80 leading-relaxed font-light text-lg">{activity}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
                
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
