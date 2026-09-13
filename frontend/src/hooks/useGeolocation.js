import { useCallback, useState } from "react";

/**
 * Geolocation with fallback.
 * Returns { coords: {lat,lng} | null, status, request() }.
 * Tahap 2 memakai ini; fallback = koordinat campus location terpilih.
 */
export function useGeolocation() {
  const [coords, setCoords] = useState(null);
  const [status, setStatus] = useState("idle"); // idle|loading|ok|denied|unsupported
  const [error, setError] = useState(null);

  const request = useCallback((fallback) => {
    if (!("geolocation" in navigator)) {
      setStatus("unsupported");
      if (fallback) setCoords(fallback);
      return;
    }
    setStatus("loading");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setStatus("ok");
        setError(null);
      },
      (err) => {
        setError(err?.message || "Lokasi ditolak");
        setStatus("denied");
        if (fallback) setCoords(fallback);
      },
      { enableHighAccuracy: false, timeout: 8000 }
    );
  }, []);

  return { coords, status, error, request, setCoords };
}
