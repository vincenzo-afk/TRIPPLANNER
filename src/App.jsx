import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { lazy, Suspense } from "react";
import { useAuth } from "./context/AuthContext";

const LoginPage = lazy(() => import("./pages/LoginPage"));
const HomePage = lazy(() => import("./pages/HomePage"));
const SuggestionsPage = lazy(() => import("./pages/SuggestionsPage"));
const TripPage = lazy(() => import("./pages/TripPage"));
const ExpensePage = lazy(() => import("./pages/ExpensePage"));
const DashboardPage = lazy(() => import("./pages/DashboardPage"));

function ProtectedRoute({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" />;
}

function Loader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900">
      <div className="text-white text-xl animate-pulse">Loading Tripify...</div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<Loader />}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/home" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/suggestions" element={<ProtectedRoute><SuggestionsPage /></ProtectedRoute>} />
          <Route path="/trip/:id" element={<ProtectedRoute><TripPage /></ProtectedRoute>} />
          <Route path="/expenses/:id" element={<ProtectedRoute><ExpensePage /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/home" />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}