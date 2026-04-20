import { useState } from "react";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../services/firebase";
import { useNavigate } from "react-router-dom";

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
      navigate("/home");
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-slate-900">
      
      {/* Realistic Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url('https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=2000&auto=format&fit=crop')` }}
      />
      {/* Subtle dark overlay for readability */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]" />

      {/* Card */}
      <div className="relative z-10 w-full max-w-md mx-4">
        
        {/* Logo */}
        <div className="text-center mb-10">
          <h1 className="text-5xl font-extrabold text-white tracking-tight drop-shadow-lg mb-3">Tripify</h1>
          <p className="text-slate-300 text-lg font-light tracking-wide drop-shadow">Discover the world, beautifully.</p>
        </div>

        {/* Form Card */}
        <div className="rounded-3xl p-8 border border-white/20 shadow-2xl"
          style={{ background: "rgba(20,20,25,0.4)", backdropFilter: "blur(24px)" }}>

          {/* Toggle */}
          <div className="flex rounded-xl p-1 mb-8"
            style={{ background: "rgba(255,255,255,0.05)" }}>
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 ${
                isLogin ? "bg-white text-slate-900 shadow-md" : "text-slate-400 hover:text-white"
              }`}>
              Sign In
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 ${
                !isLogin ? "bg-white text-slate-900 shadow-md" : "text-slate-400 hover:text-white"
              }`}>
              Sign Up
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="text-slate-200 text-xs font-semibold uppercase tracking-wider block mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full px-5 py-3.5 rounded-xl text-white placeholder-slate-500 border border-white/10 outline-none focus:border-white/50 transition-all bg-black/30"
              />
            </div>

            <div>
              <label className="text-slate-200 text-xs font-semibold uppercase tracking-wider block mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-5 py-3.5 rounded-xl text-white placeholder-slate-500 border border-white/10 outline-none focus:border-white/50 transition-all bg-black/30"
              />
            </div>

            {/* Error */}
            {error && (
              <div className="rounded-xl px-4 py-3 text-red-200 text-sm border border-red-500/30 bg-red-500/20 backdrop-blur-md">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl font-bold text-slate-900 transition-all duration-300 hover:opacity-90 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 mt-4 bg-white">
              {loading ? "Please wait..." : isLogin ? "Sign In" : "Create Account"}
            </button>
          </form>

          {/* Footer */}
          <p className="text-center text-slate-400 text-sm mt-8">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-white hover:text-slate-200 font-semibold underline decoration-white/30 underline-offset-4">
              {isLogin ? "Sign Up" : "Sign In"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}