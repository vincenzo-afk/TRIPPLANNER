import {
  collection,
  doc,
  getDocs,
  writeBatch,
} from "firebase/firestore";
import { db } from "./firebase";

export async function deleteTrip(tripId) {
  if (!tripId) return;

  // Firestore doesn't cascade deletes; remove expenses first to avoid orphans.
  const batch = writeBatch(db);
  const expensesSnap = await getDocs(collection(db, "trips", tripId, "expenses"));
  expensesSnap.forEach((d) => batch.delete(d.ref));
  batch.delete(doc(db, "trips", tripId));
  await batch.commit();
}
