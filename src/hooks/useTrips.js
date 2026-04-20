import { useCallback, useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../services/firebase";

export function useTrips(userId) {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchTrips = useCallback(async () => {
    if (!userId) return;
    // Defer state updates so effects calling this don't sync-set-state.
    await Promise.resolve();
    setLoading(true);
    setError("");
    try {
      const q = query(collection(db, "trips"), where("userId", "==", userId));
      const querySnapshot = await getDocs(q);
      const tripsData = querySnapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }));
      setTrips(tripsData);
    } catch (err) {
      console.error("Error fetching trips:", err);
      setError(err?.message || "Failed to load trips.");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    const t = setTimeout(() => {
      fetchTrips();
    }, 0);
    return () => clearTimeout(t);
  }, [fetchTrips]);

  return { trips, setTrips, loading, error, refetch: fetchTrips };
}
