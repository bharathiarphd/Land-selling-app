import React, { useEffect, useRef, useState, useCallback } from 'react';
import { MapPin } from 'lucide-react';

declare global {
  interface Window {
    google: any;
    initGoogleMap: () => void;
    L: any;
  }
}

export interface MarkerData {
  id: string;
  lat: number;
  lng: number;
  title?: string;
  price?: number;
  area?: string;
  onClick?: () => void;
}

interface GoogleMapProps {
  center: { lat: number; lng: number };
  zoom?: number;
  markers?: MarkerData[];
  onMapClick?: (lat: number, lng: number) => void;
  style?: React.CSSProperties;
  className?: string;
}

// Utility to ensure Leaflet (OpenStreetMap) is available
const ensureLeafletLoaded = (): Promise<any> => {
  if (typeof window !== 'undefined' && window.L) {
    return Promise.resolve(window.L);
  }

  return new Promise((resolve, reject) => {
    if (!document.querySelector('link[href*="leaflet"]')) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }

    let script = document.querySelector('script[src*="leaflet"]') as HTMLScriptElement;
    if (!script) {
      script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.async = true;
      document.head.appendChild(script);
    }

    let attempts = 0;
    const interval = setInterval(() => {
      attempts++;
      if (window.L) {
        clearInterval(interval);
        resolve(window.L);
      } else if (attempts > 50) {
        clearInterval(interval);
        reject(new Error('Leaflet map engine failed to load'));
      }
    }, 100);
  });
};

export const GoogleMap: React.FC<GoogleMapProps> = ({ 
  center, 
  zoom = 13, 
  markers = [], 
  onMapClick, 
  style = { width: '100%', height: '400px' },
  className = ''
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<any>(null);
  const leafletMarkersRef = useRef<any[]>([]);
  const googleMapRef = useRef<any>(null);
  const googleMarkersRef = useRef<any[]>([]);

  const [mapEngine, setMapEngine] = useState<'leaflet' | 'google' | 'loading'>('loading');
  const [loadError, setLoadError] = useState<string | null>(null);

  // SVG Pin icon generator for Leaflet
  const createLeafletIcon = useCallback((L: any, _title?: string) => {
    return L.divIcon({
      className: 'app-leaflet-marker',
      html: `
        <div style="
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          transform: translate(-50%, -100%);
          cursor: pointer;
        ">
          <div style="
            background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%);
            color: white;
            width: 32px;
            height: 32px;
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            display: flex;
            align-items: center;
            justify-content: center;
            border: 2px solid #ffffff;
            box-shadow: 0 3px 10px rgba(2, 132, 199, 0.45);
          ">
            <svg style="transform: rotate(45deg); width: 16px; height: 16px; stroke: #ffffff; fill: none; stroke-width: 2.2;" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
              <circle cx="12" cy="9" r="2.5" fill="#ffffff"/>
            </svg>
          </div>
          <div style="
            width: 10px;
            height: 3px;
            background: rgba(0, 0, 0, 0.25);
            border-radius: 50%;
            margin-top: 2px;
            filter: blur(1px);
          "></div>
        </div>
      `,
      iconSize: [0, 0],
      iconAnchor: [0, 0],
      popupAnchor: [0, -34],
    });
  }, []);

  // Initialize Map Engine (Google if key present, otherwise robust Leaflet OpenStreetMap)
  useEffect(() => {
    let isCancelled = false;
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

    // Helper to init Leaflet
    const initLeaflet = async () => {
      try {
        const L = await ensureLeafletLoaded();
        if (isCancelled || !containerRef.current) return;

        // Clean existing map instance if any
        if (leafletMapRef.current) {
          leafletMapRef.current.remove();
          leafletMapRef.current = null;
        }

        const map = L.map(containerRef.current, {
          scrollWheelZoom: true,
          zoomControl: true,
        }).setView([center.lat || 12.9716, center.lng || 80.0415], zoom);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        }).addTo(map);

        if (onMapClick) {
          map.on('click', (e: any) => {
            onMapClick(e.latlng.lat, e.latlng.lng);
          });
        }

        leafletMapRef.current = map;
        setMapEngine('leaflet');

        // Refresh container dimensions
        setTimeout(() => {
          if (leafletMapRef.current) leafletMapRef.current.invalidateSize();
        }, 200);

      } catch (err: any) {
        if (!isCancelled) {
          setLoadError(err?.message || 'Failed to initialize map');
        }
      }
    };

    if (apiKey) {
      // If Google Maps API key is configured, attempt Google Maps
      if (window.google?.maps) {
        if (containerRef.current && !googleMapRef.current) {
          const map = new window.google.maps.Map(containerRef.current, {
            center,
            zoom,
            mapTypeControl: false,
            streetViewControl: false,
          });
          googleMapRef.current = map;
          if (onMapClick) {
            map.addListener('click', (e: any) => onMapClick(e.latLng.lat(), e.latLng.lng()));
          }
          setMapEngine('google');
        }
      } else {
        // Fallback directly to Leaflet
        initLeaflet();
      }
    } else {
      // Universal zero-cost OpenStreetMap engine
      initLeaflet();
    }

    return () => {
      isCancelled = true;
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
    };
  }, []);

  // Update Center & View on prop change
  useEffect(() => {
    if (!center || !center.lat || !center.lng) return;

    if (mapEngine === 'leaflet' && leafletMapRef.current) {
      leafletMapRef.current.setView([center.lat, center.lng], zoom);
    } else if (mapEngine === 'google' && googleMapRef.current) {
      googleMapRef.current.setCenter(center);
      googleMapRef.current.setZoom(zoom);
    }
  }, [center.lat, center.lng, zoom, mapEngine]);

  // Synchronize Markers
  useEffect(() => {
    if (mapEngine === 'leaflet' && leafletMapRef.current && window.L) {
      const L = window.L;
      const map = leafletMapRef.current;

      // Clear existing markers
      leafletMarkersRef.current.forEach(m => m.remove());
      leafletMarkersRef.current = [];

      markers.forEach(markerData => {
        if (!markerData.lat || !markerData.lng) return;

        const customIcon = createLeafletIcon(L, markerData.title);
        const marker = L.marker([markerData.lat, markerData.lng], { icon: customIcon }).addTo(map);

        if (markerData.title) {
          const popupContent = document.createElement('div');
          popupContent.style.padding = '4px 2px';
          popupContent.style.fontSize = '13px';
          popupContent.style.fontWeight = '600';
          popupContent.style.color = '#0f172a';
          popupContent.textContent = markerData.title;

          if (markerData.price) {
            const priceDiv = document.createElement('div');
            priceDiv.style.color = '#0284c7';
            priceDiv.style.fontWeight = '700';
            priceDiv.style.marginTop = '2px';
            priceDiv.textContent = `₹ ${markerData.price.toLocaleString('en-IN')}`;
            popupContent.appendChild(priceDiv);
          }

          if (markerData.onClick) {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.textContent = 'View Property →';
            btn.style.display = 'block';
            btn.style.marginTop = '6px';
            btn.style.padding = '4px 8px';
            btn.style.fontSize = '11px';
            btn.style.backgroundColor = '#0284c7';
            btn.style.color = '#ffffff';
            btn.style.border = 'none';
            btn.style.borderRadius = '4px';
            btn.style.cursor = 'pointer';
            btn.onclick = (e) => {
              e.stopPropagation();
              markerData.onClick?.();
            };
            popupContent.appendChild(btn);
          }

          marker.bindPopup(popupContent);
        }

        if (markerData.onClick) {
          marker.on('click', () => {
            markerData.onClick?.();
          });
        }

        leafletMarkersRef.current.push(marker);
      });

      // If multiple markers exist and bounds are valid, auto-fit view
      if (markers.length > 1) {
        const validCoords = markers.filter(m => m.lat && m.lng).map(m => [m.lat, m.lng]);
        if (validCoords.length > 1) {
          try {
            const bounds = L.latLngBounds(validCoords);
            map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
          } catch (_) {}
        }
      }
    } else if (mapEngine === 'google' && googleMapRef.current && window.google?.maps) {
      googleMarkersRef.current.forEach(m => m.setMap(null));
      googleMarkersRef.current = [];

      markers.forEach(markerData => {
        const marker = new window.google.maps.Marker({
          position: { lat: markerData.lat, lng: markerData.lng },
          map: googleMapRef.current,
          title: markerData.title,
        });

        if (markerData.onClick) {
          marker.addListener('click', markerData.onClick);
        }

        googleMarkersRef.current.push(marker);
      });
    }
  }, [markers, mapEngine, createLeafletIcon]);

  if (loadError) {
    return (
      <div 
        className={className}
        style={{ 
          ...style, 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center', 
          backgroundColor: 'var(--color-surface-hover, #f1f5f9)', 
          borderRadius: 'var(--radius-lg, 12px)',
          border: '1px solid var(--color-border, #e2e8f0)',
          padding: '20px'
        }}
      >
        <MapPin size={40} color="var(--color-text-muted, #94a3b8)" style={{ marginBottom: '12px' }} />
        <h4 style={{ margin: 0, color: 'var(--color-text-secondary, #475569)' }}>Map Preview</h4>
        <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: 'var(--color-text-muted, #64748b)' }}>
          {center?.lat && center?.lng ? `Coordinates: ${center.lat.toFixed(4)}, ${center.lng.toFixed(4)}` : 'Location pinned'}
        </p>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef} 
      className={className}
      style={{ 
        ...style, 
        borderRadius: 'var(--radius-lg, 12px)', 
        overflow: 'hidden',
        minHeight: '200px'
      }} 
    />
  );
};
