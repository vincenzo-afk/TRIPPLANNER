import { useCallback, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { auth } from "../services/firebase";

const tripTypes = [
  {
    name: "Beach",
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=2000&auto=format&fit=crop",
    title: "Coastal Escapes",
    subtitle: "Sun, sand, and serenity."
  },
  {
    name: "Mountains",
    image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=2000&auto=format&fit=crop",
    title: "Alpine Adventures",
    subtitle: "Breathe in the crisp, high-altitude air."
  },
  {
    name: "City",
    image: "https://images.unsplash.com/photo-1449844908441-8829872d2607?q=80&w=2000&auto=format&fit=crop",
    title: "Urban Exploration",
    subtitle: "Discover the heartbeat of the metropolis."
  }
];

export default function HomePage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [budget, setBudget] = useState("Moderate");
  const [duration, setDuration] = useState(3);
  const navigate = useNavigate();
  const { user } = useAuth();

  const activeTrip = useMemo(
    () => tripTypes[currentSlide],
    [currentSlide]
  );

  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    if (duration < 1 || duration > 30) {
      alert("Please enter a duration between 1 and 30 days.");
      return;
    }
    navigate("/suggestions", { 
      state: { 
        budget, 
        tripType: activeTrip.name, 
        duration 
      } 
    });
  }, [activeTrip.name, budget, duration, navigate]);

  const handleLogout = useCallback(async () => {
    await auth.signOut();
    navigate("/login");
  }, [navigate]);

  const nextSlide = useCallback(
    () => setCurrentSlide((prev) => (prev + 1) % tripTypes.length),
    []
  );
  const prevSlide = useCallback(
    () => setCurrentSlide((prev) => (prev - 1 + tripTypes.length) % tripTypes.length),
    []
  );

  return (
    <div className="min-h-screen relative overflow-hidden bg-black font-sans selection:bg-white/30">
      
      {/* Dynamic Backgrounds */}
      {tripTypes.map((trip, idx) => (
        <div
          key={trip.name}
          className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ease-in-out ${
            idx === currentSlide ? "opacity-100 z-0" : "opacity-0 -z-10"
          }`}
          style={{ backgroundImage: `url('${trip.image}')` }}
        />
      ))}

      {/* Subtle Gradient Overlay to make text readable */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/60 pointer-events-none z-10" />

      {/* Header */}
      <header className="p-6 md:px-12 flex justify-between items-center relative z-20">
        <h1 className="text-2xl font-extrabold text-white tracking-widest drop-shadow-md">
          TRIPIFY
        </h1>
        <div className="flex items-center gap-6">
          <span className="text-white/80 text-sm hidden sm:block tracking-wide">
            {user?.email}
          </span>
          <button 
            onClick={() => navigate("/dashboard")}
            className="text-xs uppercase tracking-widest px-4 py-2 rounded border border-white/10 text-white/80 hover:bg-white hover:text-black hover:border-white transition-all duration-300 backdrop-blur-md">
            My Trips
          </button>
          <button 
            onClick={handleLogout}
            className="text-xs uppercase tracking-widest px-4 py-2 rounded border border-white/30 text-white hover:bg-white hover:text-black hover:border-white transition-all duration-300 backdrop-blur-md">
            Logout
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="absolute inset-0 flex flex-col justify-end lg:justify-center px-6 md:px-12 pb-12 lg:pb-0 z-20 pointer-events-none">
        <div className="max-w-7xl mx-auto w-full flex flex-col lg:flex-row items-end lg:items-center justify-between gap-12">
          
          {/* Left: Typography & Slider Controls */}
          <div className="w-full lg:w-1/2 pointer-events-auto">
            <p className="text-white/70 uppercase tracking-[0.3em] text-sm mb-4 font-semibold drop-shadow">
              Select Your Destination Type
            </p>
            <h2 className="text-5xl md:text-7xl font-black text-white mb-4 drop-shadow-xl leading-tight">
              {activeTrip.title}
            </h2>
            <p className="text-lg md:text-xl text-white/90 font-light mb-12 drop-shadow-md max-w-lg">
              {activeTrip.subtitle}
            </p>

            {/* Slider Controls */}
            <div className="flex items-center gap-6">
              <button 
                onClick={prevSlide}
                className="w-14 h-14 rounded-full border border-white/30 flex items-center justify-center text-white hover:bg-white hover:text-black transition-all duration-300 backdrop-blur-md">
                ←
              </button>
              <div className="flex gap-3">
                {tripTypes.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentSlide(idx)}
                    className={`h-1.5 transition-all duration-500 rounded-full ${
                      idx === currentSlide ? "w-10 bg-white" : "w-4 bg-white/30 hover:bg-white/50"
                    }`}
                  />
                ))}
              </div>
              <button 
                onClick={nextSlide}
                className="w-14 h-14 rounded-full border border-white/30 flex items-center justify-center text-white hover:bg-white hover:text-black transition-all duration-300 backdrop-blur-md">
                →
              </button>
            </div>
          </div>

          {/* Right: Glassmorphism Form */}
          <div className="w-full lg:w-[450px] rounded-3xl p-8 md:p-10 border border-white/20 shadow-2xl backdrop-blur-[20px] bg-black/30 pointer-events-auto">
            <h3 className="text-white text-2xl font-bold mb-8 tracking-wide">Plan this trip</h3>
            
            <form onSubmit={handleSubmit} className="space-y-8">
              
              {/* Budget */}
              <div>
                <label className="text-white/70 text-xs font-bold uppercase tracking-[0.15em] block mb-4">
                  Budget Level
                </label>
                <div className="flex flex-col gap-3">
                  {["Budget", "Moderate", "Luxury"].map((level) => (
                    <button
                      key={level}
                      type="button"
                      onClick={() => setBudget(level)}
                      className={`py-3.5 px-6 rounded-xl text-sm font-medium transition-all duration-300 text-left border ${
                        budget === level 
                          ? "bg-white text-black border-white shadow-[0_0_20px_rgba(255,255,255,0.3)]" 
                          : "bg-transparent text-white border-white/20 hover:border-white/50 hover:bg-white/5"
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>

              {/* Duration */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <label className="text-white/70 text-xs font-bold uppercase tracking-[0.15em]">
                    Duration
                  </label>
                  <span className="text-white font-bold bg-white/20 px-3 py-1 rounded-lg text-sm">
                    {duration} Days
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="30"
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  className="w-full accent-white h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="w-full py-4 mt-4 rounded-xl font-bold text-black bg-white uppercase tracking-wider text-sm transition-all duration-300 hover:opacity-90 hover:scale-[1.02] active:scale-[0.98] shadow-[0_0_30px_rgba(255,255,255,0.2)]">
                Generate Itinerary
              </button>
            </form>
          </div>
          
        </div>
      </main>
    </div>
  );
}
