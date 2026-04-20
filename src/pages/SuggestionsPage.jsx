import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { generateDestinations } from "../services/ai";
import { getDestinationImage } from "../services/unsplash";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../services/firebase";

export default function SuggestionsPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const preferences = location.state;

  useEffect(() => {
    if (!preferences) {
      navigate("/home");
      return;
    }
    window.scrollTo(0, 0);

    async function fetchDestinations() {
      try {
        // 1. Get 3 destinations from Gemini
        const aiDestinations = await generateDestinations(
          preferences.budget,
          preferences.tripType,
          preferences.duration
        );

        // 2. Fetch images for each from Unsplash
        const destinationsWithImages = await Promise.all(
          aiDestinations.map(async (dest) => {
            const imageUrl = await getDestinationImage(`${dest.name} ${dest.country} ${preferences.tripType}`);
            return { ...dest, imageUrl };
          })
        );

        setDestinations(destinationsWithImages);
      } catch (err) {
        console.error(err);
        setError(err.message || "We couldn't generate destinations right now. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    fetchDestinations();
  }, [preferences, navigate]);

  const handleSelectDestination = async (destination) => {
    if (!user) return;
    setSaving(true);
    
    // Map budget strings to numeric defaults
    const budgetMap = {
      "Budget": 1000,
      "Moderate": 3000,
      "Luxury": 10000
    };
    const numericBudget = budgetMap[preferences.budget] || 2000;

    try {
      // Save trip to Firebase
      const docRef = await addDoc(collection(db, "trips"), {
        userId: user.uid,
        destinationName: destination.name,
        destinationCountry: destination.country,
        destinationImage: destination.imageUrl,
        budget: preferences.budget,
        numericBudget: numericBudget, // Store numeric budget for expense tracking
        tripType: preferences.tripType,
        duration: preferences.duration,
        createdAt: serverTimestamp()
      });
      
      // Navigate to Trip Page
      navigate(`/trip/${docRef.id}`, { state: { destination, ...preferences } });
    } catch (err) {
      console.error("Error saving trip:", err);
      alert("Failed to save trip. Please try again.");
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-black relative overflow-hidden text-white">
        <div className="w-16 h-16 border-2 border-white border-t-transparent rounded-full animate-spin mb-8"></div>
        <h2 className="text-2xl font-light tracking-wide mb-2 animate-pulse">Curating destinations...</h2>
        <p className="text-white/60 font-light">Finding the perfect {preferences?.tripType} escapes.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-black">
        <div className="bg-white/10 border border-white/20 text-white p-6 rounded-xl max-w-md text-center backdrop-blur-md">
          <p className="mb-4">{error}</p>
          <button onClick={() => navigate("/home")} className="px-6 py-2 bg-white text-black font-semibold rounded-lg">Go Back</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-16 px-6 relative bg-[#0a0a0a]">
      
      <div className="max-w-7xl mx-auto relative z-10">
        <header className="mb-16 text-center">
          <button onClick={() => navigate("/home")} className="text-white/50 hover:text-white mb-8 text-xs uppercase tracking-widest flex items-center justify-center gap-2 mx-auto transition-colors">
            ← Change Preferences
          </button>
          <h1 className="text-4xl md:text-5xl font-light text-white mb-4 tracking-wide">
            Your Destinations
          </h1>
          <p className="text-white/60 font-light max-w-lg mx-auto">
            We curated these locations based on your {preferences.duration}-day {preferences.budget.toLowerCase()} trip criteria.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {destinations.map((dest, idx) => {
            return (
              <div 
                key={idx}
                className="relative rounded-2xl overflow-hidden group cursor-pointer border border-white/10 hover:border-white/30 transition-all duration-700 hover:-translate-y-2 shadow-2xl"
                onClick={() => handleSelectDestination(dest)}
              >
                {/* Background Image */}
                <div 
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 group-hover:scale-105"
                  style={{ backgroundImage: `url(${dest.imageUrl})` }}
                />
                
                {/* Subtle Realistic Dark Overlay at bottom */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/10 opacity-90 transition-opacity duration-500 group-hover:opacity-100" />

                {/* Content */}
                <div className="relative z-10 p-8 h-full flex flex-col justify-end min-h-[450px]">
                  <div className="mb-auto">
                    <span className="inline-block px-3 py-1 rounded bg-black/40 backdrop-blur-md text-white/80 text-[10px] uppercase tracking-[0.2em] mb-4 border border-white/10">
                      Option 0{idx + 1}
                    </span>
                  </div>
                  
                  <h3 className="text-3xl font-bold text-white mb-1 drop-shadow-md">{dest.name}</h3>
                  <div className="flex items-center gap-2 text-white/70 mb-4 text-sm uppercase tracking-wider font-semibold">
                    <span>{dest.country}</span>
                  </div>
                  
                  <p className="text-white/80 text-sm leading-relaxed mb-8 line-clamp-3 font-light">
                    {dest.description}
                  </p>
                  
                  <div className="flex items-center justify-between mt-auto">
                    <div>
                      <p className="text-[10px] text-white/50 uppercase tracking-[0.2em] mb-1">Est. Cost</p>
                      <p className="text-white font-medium">{dest.estimatedCost}</p>
                    </div>
                    
                    <button 
                      disabled={saving}
                      className="bg-white text-black px-5 py-2.5 rounded text-sm uppercase tracking-wider font-bold transition-all duration-300 group-hover:bg-black group-hover:text-white group-hover:border group-hover:border-white"
                    >
                      {saving ? "..." : "Select"}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}