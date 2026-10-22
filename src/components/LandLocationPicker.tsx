import React, { useEffect, useRef, useState, useCallback } from 'react';
import { MapPin, Navigation, Compass, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import styles from './LandLocationPicker.module.css';

declare global {
  interface Window {
    L: any;
  }
}

export interface GeocodedLocationData {
  latitude: number;
  longitude: number;
  address: string;
  district?: string;
  taluk?: string;
  village?: string;
  city?: string;
  state?: string;
  pincode?: string;
}

interface LandLocationPickerProps {
  initialLat?: number;
  initialLng?: number;
  initialAddress?: string;
  language?: 'ta' | 'en' | string;
  onLocationSelect: (data: GeocodedLocationData) => void;
  onAddressChange?: (address: string) => void;
  onAutofillFormFields?: (data: GeocodedLocationData) => void;
  className?: string;
}

// Default to Tindivanam / Tamil Nadu as specified in the original snippet
const DEFAULT_LAT = 12.2286;
const DEFAULT_LNG = 79.6514;

export const LandLocationPicker: React.FC<LandLocationPickerProps> = ({
  initialLat,
  initialLng,
  initialAddress = '',
  language = 'ta',
  onLocationSelect,
  onAddressChange,
  onAutofillFormFields,
  className = '',
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerInstanceRef = useRef<any>(null);

  const [coordinates, setCoordinates] = useState<string>(
    initialLat && initialLng ? `${initialLat.toFixed(6)}, ${initialLng.toFixed(6)}` : ''
  );
  const [address, setAddress] = useState<string>(initialAddress);
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [isSearchingAddress, setIsSearchingAddress] = useState<boolean>(false);
  const [mapReady, setMapReady] = useState<boolean>(false);
  const [latestParsedData, setLatestParsedData] = useState<GeocodedLocationData | null>(null);

  const requestNumberRef = useRef<number>(0);
  const searchTimerRef = useRef<any>(null);

  const isTamil = language === 'ta';

  // Create an SVG-based Leaflet DivIcon that never fails to render
  const createMarkerIcon = useCallback((L: any) => {
    return L.divIcon({
      className: 'land-map-pin',
      html: `
        <div style="
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          transform: translate(-50%, -100%);
          cursor: grab;
        ">
          <div style="
            background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
            color: white;
            width: 36px;
            height: 36px;
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            display: flex;
            align-items: center;
            justify-content: center;
            border: 2px solid #ffffff;
            box-shadow: 0 4px 12px rgba(37, 99, 235, 0.45);
          ">
            <svg style="transform: rotate(45deg); width: 18px; height: 18px; stroke: #ffffff; fill: none; stroke-width: 2.2;" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
              <circle cx="12" cy="9" r="2.5" fill="#ffffff"/>
            </svg>
          </div>
          <div style="
            width: 12px;
            height: 4px;
            background: rgba(0, 0, 0, 0.25);
            border-radius: 50%;
            margin-top: 2px;
            filter: blur(1px);
          "></div>
        </div>
      `,
      iconSize: [0, 0],
      iconAnchor: [0, 0],
      popupAnchor: [0, -38],
    });
  }, []);

  // Update location and trigger reverse geocoding
  const handleUpdateLocation = useCallback((lat: number, lng: number) => {
    const coordString = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
    setCoordinates(coordString);

    const currentRequest = ++requestNumberRef.current;
    clearTimeout(searchTimerRef.current);

    setIsSearchingAddress(true);
    setAddress(isTamil ? 'முகவரி தேடப்படுகிறது...' : 'Fetching address...');

    searchTimerRef.current = setTimeout(async () => {
      try {
        const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lng)}&accept-language=ta,en`;
        const res = await fetch(url);
        if (!res.ok) throw new Error('Address lookup failed');

        const data = await res.json();
        if (currentRequest !== requestNumberRef.current) return;

        if (data && data.display_name) {
          const resolvedAddress = data.display_name;
          setAddress(resolvedAddress);

          // Extract granular fields
          const addr = data.address || {};
          const district = addr.state_district || addr.district || addr.county || '';
          const taluk = addr.county || addr.subdistrict || addr.taluk || '';
          const village = addr.village || addr.suburb || addr.neighbourhood || addr.hamlet || '';
          const city = addr.city || addr.town || addr.municipality || village || '';
          const state = addr.state || 'Tamil Nadu';
          const pincode = addr.postcode || '';

          const locationData: GeocodedLocationData = {
            latitude: lat,
            longitude: lng,
            address: resolvedAddress,
            district,
            taluk,
            village,
            city,
            state,
            pincode,
          };

          setLatestParsedData(locationData);
          onLocationSelect(locationData);
          if (onAddressChange) onAddressChange(resolvedAddress);

          // Update marker popup with clean Tamil/English content
          if (markerInstanceRef.current) {
            const popupContent = document.createElement('div');
            popupContent.style.padding = '4px';
            popupContent.style.maxWidth = '240px';
            popupContent.style.fontSize = '12px';
            popupContent.style.lineHeight = '1.4';

            const popupTitle = document.createElement('strong');
            popupTitle.style.color = '#1e293b';
            popupTitle.style.display = 'block';
            popupTitle.style.marginBottom = '4px';
            popupTitle.textContent = isTamil ? 'தேர்ந்தெடுக்கப்பட்ட இடம்:' : 'Selected Location:';

            popupContent.appendChild(popupTitle);
            popupContent.appendChild(document.createTextNode(resolvedAddress));

            markerInstanceRef.current.bindPopup(popupContent).openPopup();
          }
        } else {
          const fallbackMsg = isTamil
            ? 'இந்த இடத்திற்கான முகவரி கிடைக்கவில்லை.'
            : 'Address not found for this location.';
          setAddress(fallbackMsg);
          onLocationSelect({
            latitude: lat,
            longitude: lng,
            address: '',
          });
        }
      } catch {
        if (currentRequest === requestNumberRef.current) {
          const errorMsg = isTamil
            ? 'முகவரியைப் பெற முடியவில்லை. மீண்டும் முயற்சிக்கவும்.'
            : 'Unable to retrieve address. Please try again.';
          setAddress(errorMsg);
        }
      } finally {
        if (currentRequest === requestNumberRef.current) {
          setIsSearchingAddress(false);
        }
      }
    }, 1100);
  }, [isTamil, onLocationSelect, onAddressChange]);

  // Initialize Map
  useEffect(() => {
    let checkInterval: any = null;

    const initMap = () => {
      const L = window.L;
      if (!L || !mapContainerRef.current) return false;

      // Clean up previous map if exists
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      const startingLat = initialLat || DEFAULT_LAT;
      const startingLng = initialLng || DEFAULT_LNG;

      const map = L.map(mapContainerRef.current, {
        scrollWheelZoom: true,
      }).setView([startingLat, startingLng], initialLat ? 15 : 12);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map);

      const customIcon = createMarkerIcon(L);

      const marker = L.marker([startingLat, startingLng], {
        draggable: true,
        icon: customIcon,
      }).addTo(map);

      mapInstanceRef.current = map;
      markerInstanceRef.current = marker;

      // Handle map clicks
      map.on('click', (e: any) => {
        marker.setLatLng(e.latlng);
        handleUpdateLocation(e.latlng.lat, e.latlng.lng);
      });

      // Handle marker drag
      marker.on('dragend', () => {
        const pos = marker.getLatLng();
        handleUpdateLocation(pos.lat, pos.lng);
      });

      setMapReady(true);

      // Invalidate map size after DOM render
      setTimeout(() => {
        map.invalidateSize();
      }, 250);

      return true;
    };

    if (!initMap()) {
      // If Leaflet script hasn't loaded yet, poll until available
      checkInterval = setInterval(() => {
        if (initMap()) {
          clearInterval(checkInterval);
        }
      }, 150);
    }

    return () => {
      if (checkInterval) clearInterval(checkInterval);
      if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [createMarkerIcon, handleUpdateLocation]);

  // Update initial coordinates if provided and map already created
  useEffect(() => {
    if (initialLat && initialLng && mapInstanceRef.current && markerInstanceRef.current) {
      const currentPos = markerInstanceRef.current.getLatLng();
      if (Math.abs(currentPos.lat - initialLat) > 0.0001 || Math.abs(currentPos.lng - initialLng) > 0.0001) {
        mapInstanceRef.current.setView([initialLat, initialLng], 15);
        markerInstanceRef.current.setLatLng([initialLat, initialLng]);
        setCoordinates(`${initialLat.toFixed(6)}, ${initialLng.toFixed(6)}`);
      }
    }
  }, [initialLat, initialLng]);

  // Handle Current Location GPS
  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert(isTamil ? 'உங்கள் பிரவுசரில் இருப்பிட வசதி இல்லை.' : 'Geolocation is not supported by your browser.');
      return;
    }

    setIsLocating(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        if (mapInstanceRef.current && markerInstanceRef.current) {
          mapInstanceRef.current.setView([lat, lng], 17);
          markerInstanceRef.current.setLatLng([lat, lng]);
        }

        handleUpdateLocation(lat, lng);
        setIsLocating(false);
      },
      (error) => {
        let message = isTamil ? 'இருப்பிடத்தைப் பெற முடியவில்லை.' : 'Unable to retrieve location.';

        if (error.code === error.PERMISSION_DENIED) {
          message = isTamil
            ? 'இருப்பிட அனுமதி மறுக்கப்பட்டுள்ளது. Browser settings-ல் அனுமதி வழங்கவும்.'
            : 'Location permission denied. Please allow location access in browser settings.';
        } else if (error.code === error.TIMEOUT) {
          message = isTamil
            ? 'இருப்பிடத்தைப் பெற அதிக நேரமாகிறது. மீண்டும் முயற்சிக்கவும்.'
            : 'Location request timed out. Please try again.';
        }

        alert(message);
        setIsLocating(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      }
    );
  };

  const handleAddressManualChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setAddress(val);
    if (onAddressChange) onAddressChange(val);
  };

  return (
    <div className={`${styles.container} ${className}`}>
      {/* Header with Title and Current Location Button */}
      <div className={styles.header}>
        <div className={styles.titleArea}>
          <MapPin size={18} color="#2563eb" />
          <h3 className={styles.title}>
            {isTamil ? 'நிலத்தின் இருப்பிடத்தைத் தேர்வு செய்க' : 'Select Land Location on Map'}
          </h3>
        </div>
      </div>

      <button
        type="button"
        className={styles.locateBtn}
        onClick={handleGetCurrentLocation}
        disabled={isLocating}
      >
        {isLocating ? (
          <>
            <Loader2 size={16} className={styles.spinner} />
            <span>{isTamil ? 'இருப்பிடம் தேடப்படுகிறது...' : 'Locating your position...'}</span>
          </>
        ) : (
          <>
            <Navigation size={16} />
            <span>{isTamil ? '📍 எனது தற்போதைய இடத்தை எடு' : '📍 Use My Current Location'}</span>
          </>
        )}
      </button>

      {/* Interactive Leaflet Map Wrapper */}
      <div className={styles.mapWrapper}>
        <div ref={mapContainerRef} className={styles.mapElement} />
        {!mapReady && (
          <div className={styles.mapLoadingOverlay}>
            <Loader2 size={28} className={styles.spinner} color="#2563eb" />
            <span>{isTamil ? 'வரைபடம் தயாராகிறது...' : 'Loading OpenStreetMap...'}</span>
          </div>
        )}
      </div>

      {/* Coordinates Field */}
      <div className={styles.formGroup}>
        <label className={styles.label}>
          <span>
            {isTamil
              ? 'அட்சரேகை & தீர்க்கரேகை (Latitude, Longitude)'
              : 'Latitude & Longitude Coordinates'}
          </span>
          {coordinates && <span className={styles.badge}>{isTamil ? 'வரைபடத்தில் குறியிடப்பட்டது' : 'Pinned'}</span>}
        </label>
        <div className={styles.inputWrapper}>
          <Compass size={16} className={styles.inputIcon} />
          <input
            type="text"
            className={styles.coordinatesInput}
            value={coordinates}
            readOnly
            placeholder={
              isTamil
                ? 'வரைபடத்தில் இடத்தைத் தேர்வு செய்யவும் (அல்லது முள் நகர்த்தவும்)'
                : 'Click map or drag pin to select coordinates'
            }
          />
        </div>
      </div>

      {/* Full Address Field */}
      <div className={styles.formGroup}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <label className={styles.label}>
            <span>{isTamil ? 'முழு முகவரி (Address)' : 'Full Address'}</span>
          </label>
          {isSearchingAddress && (
            <span className={styles.statusSearching}>
              <Loader2 size={13} className={styles.spinner} />
              {isTamil ? 'முகவரி தேடப்படுகிறது...' : 'Looking up address...'}
            </span>
          )}
        </div>

        <textarea
          className={styles.textarea}
          rows={3}
          value={address}
          onChange={handleAddressManualChange}
          placeholder={
            isTamil
              ? 'தேர்ந்தெடுக்கப்பட்ட நிலத்தின் முகவரி'
              : 'Selected land address will appear here automatically'
          }
        />

        <div className={styles.hint}>
          <CheckCircle2 size={13} color="#16a34a" />
          <span>
            {isTamil
              ? 'முகவரியைச் சரிபார்த்து தேவையெனில் திருத்திக்கொள்ளலாம்.'
              : 'You can verify and edit the address manually if needed.'}
          </span>
        </div>
      </div>

      {/* Optional Smart Autofill banner if district or taluk detected */}
      {latestParsedData && onAutofillFormFields && (latestParsedData.district || latestParsedData.taluk || latestParsedData.pincode) && (
        <div className={styles.autofillBanner}>
          <div>
            <strong>{isTamil ? '💡 தானியங்கி நிரப்புதல்:' : '💡 Smart Autofill:'}</strong>{' '}
            {latestParsedData.district && `மாவட்டம்: ${latestParsedData.district}`}{' '}
            {latestParsedData.taluk && `| தாலுகா: ${latestParsedData.taluk}`}{' '}
            {latestParsedData.pincode && `| பின்கோடு: ${latestParsedData.pincode}`}
          </div>
          <button
            type="button"
            className={styles.autofillActionBtn}
            onClick={() => onAutofillFormFields(latestParsedData)}
          >
            {isTamil ? 'படிவத்தில் நிரப்பு' : 'Apply to Form'}
          </button>
        </div>
      )}
    </div>
  );
};
