// src/context/LocationContext.jsx
import { createContext, useContext, useState, useCallback } from "react";

const LocationContext = createContext(null);

const STORAGE_KEY = "farro:deliveryLocation"; // { label, lat, lng, street, city, pincode }

function readStoredLocation() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function LocationProvider({ children }) {
  const [location, setLocationState] = useState(readStoredLocation); // null | { label, lat, lng, street, city, pincode }

  const setLocation = useCallback((loc) => {
    setLocationState(loc);
    try {
      if (loc) localStorage.setItem(STORAGE_KEY, JSON.stringify(loc));
      else localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore storage errors (private mode, etc.)
    }
  }, []);

  const clearLocation = useCallback(() => setLocation(null), [setLocation]);

  return (
    <LocationContext.Provider value={{ location, setLocation, clearLocation }}>
      {children}
    </LocationContext.Provider>
  );
}

export function useLocation() {
  const ctx = useContext(LocationContext);
  if (!ctx) throw new Error("useLocation must be used within a LocationProvider");
  return ctx;
}