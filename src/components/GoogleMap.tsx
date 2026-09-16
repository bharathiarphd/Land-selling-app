import React, { useEffect, useRef, useState } from 'react';
import { MapPinOff } from 'lucide-react';

declare global {
  interface Window {
    google: any;
    initGoogleMap: () => void;
  }
}

export interface MarkerData {
  id: string;
  lat: number;
  lng: number;
  title?: string;
  onClick?: () => void;
}

interface GoogleMapProps {
  center: { lat: number; lng: number };
  zoom?: number;
  markers?: MarkerData[];
  onMapClick?: (lat: number, lng: number) => void;
  style?: React.CSSProperties;
}

let loadPromise: Promise<void> | null = null;

const loadGoogleMapsAPI = (): Promise<void> => {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    return Promise.reject(new Error("VITE_GOOGLE_MAPS_API_KEY is missing"));
  }

  if (window.google?.maps) {
    return Promise.resolve();
  }

  if (loadPromise) return loadPromise;

  loadPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=initGoogleMap`;
    script.async = true;
    script.defer = true;
    script.onerror = () => reject(new Error("Failed to load Google Maps SDK"));
    
    window.initGoogleMap = () => {
      resolve();
    };

    document.head.appendChild(script);
  });

  return loadPromise;
};

export const GoogleMap: React.FC<GoogleMapProps> = ({ 
  center, 
  zoom = 13, 
  markers = [], 
  onMapClick, 
  style = { width: '100%', height: '400px' } 
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const markersRef = useRef<any[]>([]);

  useEffect(() => {
    loadGoogleMapsAPI()
      .then(() => {
        if (mapRef.current && !map) {
          const newMap = new window.google.maps.Map(mapRef.current, {
            center,
            zoom,
            mapTypeControl: false,
            streetViewControl: false,
          });
          
          setMap(newMap);

          if (onMapClick) {
            newMap.addListener("click", (e: any) => {
              onMapClick(e.latLng.lat(), e.latLng.lng());
            });
          }
        }
      })
      .catch((err) => {
        setError(err.message);
      });
  }, []);

  // Update center when it changes
  useEffect(() => {
    if (map) {
      map.setCenter(center);
    }
  }, [center.lat, center.lng]);

  // Update markers
  useEffect(() => {
    if (!map) return;

    // Clear old markers
    markersRef.current.forEach(m => m.setMap(null));
    markersRef.current = [];

    // Create new markers
    markers.forEach(markerData => {
      const marker = new window.google.maps.Marker({
        position: { lat: markerData.lat, lng: markerData.lng },
        map,
        title: markerData.title,
      });

      if (markerData.onClick) {
        marker.addListener("click", markerData.onClick);
      }

      markersRef.current.push(marker);
    });

  }, [markers, map]);

  if (error) {
    return (
      <div style={{ ...style, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--color-surface-hover)', borderRadius: 'var(--radius-lg)' }}>
        <MapPinOff size={48} color="var(--color-text-muted)" style={{ marginBottom: '16px' }} />
        <h3 style={{ margin: 0, color: 'var(--color-text-secondary)' }}>Map Unavailable</h3>
      </div>
    );
  }

  return (
    <div ref={mapRef} style={{ ...style, borderRadius: 'var(--radius-lg)', overflow: 'hidden' }} />
  );
};
