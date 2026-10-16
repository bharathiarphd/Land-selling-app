import { BACKEND_URL } from '../config/api';

export interface LocationCoordinates {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

export interface GeocodedAddress {
  address: string;      // House / Street Address / Door No
  locality: string;     // Local Area / Village / Suburb
  city: string;         // City / Town / Taluk
  district: string;     // District
  state: string;        // State (e.g. Tamil Nadu)
  pincode: string;      // 6-digit PIN Code
  country: string;      // Country (default India)
  latitude: number;
  longitude: number;
  displayName?: string;
}

export interface LocationResult {
  success: boolean;
  data?: GeocodedAddress;
  error?: string;
  isPermissionDenied?: boolean;
}

// Indian postal PIN code validator: 6 digits, doesn't start with 0
export const validateIndianPincode = (pincode: string): boolean => {
  return /^[1-9][0-9]{5}$/.test(String(pincode).trim());
};

export const locationService = {
  /**
   * Request user permission and detect current GPS coordinates once.
   * Does NOT track continuously.
   */
  async getCurrentPosition(): Promise<LocationCoordinates> {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      throw new Error('Geolocation is not supported by your browser. Please enter your address manually.');
    }

    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: Number(position.coords.latitude.toFixed(6)),
            longitude: Number(position.coords.longitude.toFixed(6)),
            accuracy: position.coords.accuracy
          });
        },
        (error) => {
          let message = 'Unable to detect your location. Please enter your address manually.';
          const isDenied = error.code === error.PERMISSION_DENIED;
          
          if (isDenied) {
            message = 'Location access was denied. Please allow location permissions in your browser or enter your address manually.';
          } else if (error.code === error.POSITION_UNAVAILABLE) {
            message = 'Location information is currently unavailable. Please enter your address manually.';
          } else if (error.code === error.TIMEOUT) {
            message = 'Location request timed out. Please check your GPS connection or enter your address manually.';
          }

          const err: any = new Error(message);
          err.code = error.code;
          err.isPermissionDenied = isDenied;
          reject(err);
        },
        {
          enableHighAccuracy: true,
          timeout: 12000,
          maximumAge: 0
        }
      );
    });
  },

  /**
   * Reverse geocode latitude and longitude to extract standard address components.
   * Multi-tier fallback strategy without requiring frontend API secret keys.
   */
  async reverseGeocode(latitude: number, longitude: number): Promise<GeocodedAddress> {
    // 1. Try Backend Proxy first (if Express server is running)
    try {
      const serverRes = await fetch(
        `${BACKEND_URL}/api/location/reverse-geocode?lat=${latitude}&lng=${longitude}`,
        { headers: { 'Accept': 'application/json' } }
      );
      if (serverRes.ok) {
        const result = await serverRes.json();
        if (result && result.address) {
          return {
            ...result,
            latitude,
            longitude,
            country: result.country || 'India'
          };
        }
      }
    } catch (_) {
      // Backend proxy unavailable or offline, seamlessly proceed to direct clients
    }

    // 2. Direct OpenStreetMap Nominatim reverse geocode (Free, no secret keys)
    try {
      const nominatimUrl = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}&addressdetails=1`;
      const res = await fetch(nominatimUrl, {
        headers: {
          'Accept': 'application/json'
        }
      });

      if (res.ok) {
        const data = await res.json();
        if (data && data.address) {
          return this.parseNominatimData(data, latitude, longitude);
        }
      }
    } catch (e) {
      console.warn('Nominatim reverse geocode attempt failed, attempting fallback provider:', e);
    }

    // 3. Fallback: BigDataCloud Client Reverse Geocode API (Public free tier, no API key required)
    try {
      const bdcUrl = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`;
      const res = await fetch(bdcUrl);
      if (res.ok) {
        const data = await res.json();
        return this.parseBigDataCloud(data, latitude, longitude);
      }
    } catch (e) {
      console.warn('BigDataCloud reverse geocode attempt failed:', e);
    }

    // Default fallback if reverse geocoding is unreachable
    return {
      address: '',
      locality: '',
      city: '',
      district: '',
      state: 'Tamil Nadu',
      pincode: '',
      country: 'India',
      latitude,
      longitude
    };
  },

  /**
   * Full one-step helper: requests GPS permission, gets coordinates, and reverse geocodes.
   */
  async detectAndGeocode(): Promise<LocationResult> {
    try {
      const coords = await this.getCurrentPosition();
      const addressData = await this.reverseGeocode(coords.latitude, coords.longitude);
      return {
        success: true,
        data: addressData
      };
    } catch (err: any) {
      return {
        success: false,
        error: err.message || 'Location detection failed. You can fill the address manually.',
        isPermissionDenied: !!err.isPermissionDenied
      };
    }
  },

  /**
   * Parse OpenStreetMap Nominatim address details
   */
  parseNominatimData(data: any, latitude: number, longitude: number): GeocodedAddress {
    const addr = data.address || {};

    // 1. House / Street Address
    const streetParts = [
      addr.house_number || addr.house_name,
      addr.road || addr.pedestrian || addr.street,
      addr.suburb_district
    ].filter(Boolean);
    const streetAddress = streetParts.length > 0 ? streetParts.join(', ') : (addr.suburb || '');

    // 2. Local Area / Village
    const locality = addr.suburb || addr.neighbourhood || addr.village || addr.hamlet || addr.residential || '';

    // 3. City / Town
    const city = addr.city || addr.town || addr.municipality || addr.village || locality || '';

    // 4. District
    // In India, Nominatim typically maps district to state_district or county
    let district = addr.state_district || addr.county || addr.district || '';
    // Clean district names like "Coimbatore District" -> "Coimbatore"
    district = district.replace(/\s+District$/i, '').trim();

    // 5. State
    const state = addr.state || 'Tamil Nadu';

    // 6. PIN Code
    let pincode = '';
    if (addr.postcode) {
      const digits = String(addr.postcode).replace(/\D/g, '');
      if (digits.length >= 6) {
        pincode = digits.substring(0, 6);
      }
    }

    // 7. Country
    const country = addr.country || 'India';

    return {
      address: streetAddress,
      locality,
      city,
      district,
      state,
      pincode,
      country,
      latitude,
      longitude,
      displayName: data.display_name || ''
    };
  },

  /**
   * Parse BigDataCloud client response
   */
  parseBigDataCloud(data: any, latitude: number, longitude: number): GeocodedAddress {
    const locality = data.locality || data.principalSubdivision || '';
    const city = data.city || locality;
    let district = '';

    if (Array.isArray(data.localityInfo?.administrative)) {
      const districtAdmin = data.localityInfo.administrative.find(
        (a: any) => a.adminLevel === 6 || a.description?.toLowerCase().includes('district')
      );
      if (districtAdmin) {
        district = districtAdmin.name.replace(/\s+District$/i, '');
      }
    }

    let pincode = '';
    if (data.postcode) {
      const digits = String(data.postcode).replace(/\D/g, '');
      if (digits.length >= 6) {
        pincode = digits.substring(0, 6);
      }
    }

    return {
      address: '',
      locality,
      city,
      district: district || city,
      state: data.principalSubdivision || 'Tamil Nadu',
      pincode,
      country: data.countryName || 'India',
      latitude,
      longitude
    };
  }
};
