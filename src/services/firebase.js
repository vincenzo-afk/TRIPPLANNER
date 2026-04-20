import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

function mustGetEnv(key) {
  const value = import.meta.env[key];
  if (typeof value !== "string" || value.trim() === "") return "";
  return value.trim();
}

function assertFirebaseEnv() {
  const requiredKeys = [
    "VITE_FIREBASE_API_KEY",
    "VITE_FIREBASE_AUTH_DOMAIN",
    "VITE_FIREBASE_PROJECT_ID",
    "VITE_FIREBASE_STORAGE_BUCKET",
    "VITE_FIREBASE_MESSAGING_SENDER_ID",
    "VITE_FIREBASE_APP_ID",
  ];

  const missing = requiredKeys.filter((k) => !mustGetEnv(k));
  if (missing.length > 0) {
    throw new Error(
      [
        "Missing Firebase env vars:",
        missing.join(", "),
        "",
        "Fix: create/update a `.env` file at the project root with the correct Firebase Web App config values, then restart `npm run dev`.",
      ].join("\n")
    );
  }
}

assertFirebaseEnv();

const firebaseConfig = {
  apiKey: mustGetEnv("VITE_FIREBASE_API_KEY"),
  authDomain: mustGetEnv("VITE_FIREBASE_AUTH_DOMAIN"),
  projectId: mustGetEnv("VITE_FIREBASE_PROJECT_ID"),
  storageBucket: mustGetEnv("VITE_FIREBASE_STORAGE_BUCKET"),
  messagingSenderId: mustGetEnv("VITE_FIREBASE_MESSAGING_SENDER_ID"),
  appId: mustGetEnv("VITE_FIREBASE_APP_ID"),
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
