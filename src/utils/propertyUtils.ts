import { type Property } from '../data/mockProperties';
import { BACKEND_URL } from '../config/api';
import { generateStandardPropertyId } from '../data/tamilNaduDistricts';

const CUSTOM_PROPERTIES_KEY = 'landSellingApp_customProperties';
const RECENTLY_VIEWED_KEY = 'land_selling_app_recently_viewed';

export const DEFAULT_SEED_PROPERTIES: Property[] = [];

export const getCustomProperties = (): Property[] => {
  const data = localStorage.getItem(CUSTOM_PROPERTIES_KEY);
  if (data) {
    try {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) {
        const realOnly = parsed.filter((p: Property) => 
          p && p.id && !['prop-1', 'prop-2', 'prop-3', 'prop-4'].includes(p.id)
        );
        if (realOnly.length !== parsed.length) {
          localStorage.setItem(CUSTOM_PROPERTIES_KEY, JSON.stringify(realOnly));
        }
        return realOnly;
      }
    } catch {
      return [];
    }
  }
  return [];
};

export const syncPropertiesFromBackend = async (): Promise<Property[]> => {
  try {
    const res = await fetch(`${BACKEND_URL}/api/properties`);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) {
        const formatted = data
          .filter((item: any) => !['prop-1', 'prop-2', 'prop-3', 'prop-4'].includes(item.id || item._id))
          .map((item: any) => ({
            ...item,
            id: item.id || item._id
          }));
        localStorage.setItem(CUSTOM_PROPERTIES_KEY, JSON.stringify(formatted));
        return formatted;
      }
    }
  } catch (err) {
    // Backend unreachable, fallback to localStorage cache
  }
  return getCustomProperties();
};

export const getPropertyById = (id: string): Property | undefined => {
  return getCustomProperties().find(p => p.id === id);
};

export const getAllProperties = (): Property[] => {
  return getCustomProperties();
};

export const createProperty = (propertyData: Partial<Property>): Property => {
  const customProps = getCustomProperties();
  
  // Enforce official 8-digit property ID: [2-digit District Code][2-digit Taluk Code][4-digit Sequence]
  const id = (propertyData.id && /^\d{8}$/.test(propertyData.id))
    ? propertyData.id
    : generateStandardPropertyId(propertyData.district, propertyData.taluk, customProps);

  const newProperty: Property = {
    ...propertyData,
    id,
    status: propertyData.status || 'Available'
  } as Property;

  customProps.unshift(newProperty);
  localStorage.setItem(CUSTOM_PROPERTIES_KEY, JSON.stringify(customProps));

  // Sync with live backend API
  fetch(`${BACKEND_URL}/api/properties`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(newProperty)
  }).catch(e => console.warn('Backend sync failed:', e));

  return newProperty;
};

export const updateProperty = (id: string, propertyData: Partial<Property>): Property | null => {
  const customProps = getCustomProperties();
  const index = customProps.findIndex(p => p.id === id);
  if (index === -1) return null;
  
  customProps[index] = { ...customProps[index], ...propertyData };
  localStorage.setItem(CUSTOM_PROPERTIES_KEY, JSON.stringify(customProps));

  // Sync with live backend API
  fetch(`${BACKEND_URL}/api/properties/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(customProps[index])
  }).catch(e => console.warn('Backend sync failed:', e));

  return customProps[index];
};

export const deleteProperty = (id: string): boolean => {
  const customProps = getCustomProperties();
  const index = customProps.findIndex(p => p.id === id);
  if (index === -1) return false;
  
  customProps.splice(index, 1);
  localStorage.setItem(CUSTOM_PROPERTIES_KEY, JSON.stringify(customProps));

  // Sync with live backend API
  fetch(`${BACKEND_URL}/api/properties/${id}`, {
    method: 'DELETE'
  }).catch(e => console.warn('Backend sync failed:', e));

  return true;
};

export const updatePropertyStatus = (id: string, status: Property['status'] | 'Draft' | 'Pending' | 'Rejected' | 'Inactive'): boolean => {
  const customProps = getCustomProperties();
  const index = customProps.findIndex(p => p.id === id);
  if (index === -1) return false;
  
  customProps[index].status = status as any;
  localStorage.setItem(CUSTOM_PROPERTIES_KEY, JSON.stringify(customProps));

  // Sync with live backend API
  fetch(`${BACKEND_URL}/api/properties/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status })
  }).catch(e => console.warn('Backend sync failed:', e));

  return true;
};

export const getUserProperties = (userId: string, userPhone?: string): Property[] => {
  const digits = userPhone ? String(userPhone).replace(/\D/g, '').slice(-10) : '';
  const userIdDigits = userId ? String(userId).replace(/\D/g, '').slice(-10) : '';
  const targetDigits = digits || (userIdDigits.length === 10 ? userIdDigits : '');

  return getAllProperties().filter(p => {
    if (p.seller?.id === userId) return true;
    if (targetDigits && p.seller?.phone) {
      const pDigits = String(p.seller.phone).replace(/\D/g, '').slice(-10);
      if (pDigits === targetDigits) return true;
    }
    return false;
  });
};

export const getSimilarProperties = (property: Property, limit: number = 4): Property[] => {
  return getAllProperties()
    .filter(p => p.id !== property.id && (p.propertyType === property.propertyType || p.district === property.district))
    .slice(0, limit);
};

export const addRecentlyViewed = (id: string) => {
  try {
    const existing = localStorage.getItem(RECENTLY_VIEWED_KEY);
    let viewList: string[] = existing ? JSON.parse(existing) : [];
    
    viewList = viewList.filter(item => item !== id);
    viewList.unshift(id);
    if (viewList.length > 5) {
      viewList = viewList.slice(0, 5);
    }
    
    localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(viewList));
  } catch (e) {
    console.error('Failed to save recently viewed', e);
  }
};

export const getRecentlyViewed = (): Property[] => {
  try {
    const existing = localStorage.getItem(RECENTLY_VIEWED_KEY);
    if (!existing) return [];
    
    const viewList: string[] = JSON.parse(existing);
    const properties: Property[] = [];
    
    for (const id of viewList) {
      const p = getPropertyById(id);
      if (p) properties.push(p);
    }
    
    return properties;
  } catch (e) {
    console.error('Failed to parse recently viewed', e);
    return [];
  }
};

export const getPropertyCoordinates = (p?: Partial<Property> | null): { lat: number; lng: number } => {
  if (p?.latitude && p?.longitude) {
    return { lat: Number(p.latitude), lng: Number(p.longitude) };
  }

  const cityLookup: Record<string, { lat: number; lng: number }> = {
    'sholinganallur': { lat: 12.9010, lng: 80.2279 },
    'vandalur': { lat: 12.8913, lng: 80.0811 },
    'tambaram': { lat: 12.9249, lng: 80.1000 },
    'sriperumbudur': { lat: 12.9675, lng: 79.9436 },
    'pollachi': { lat: 10.6609, lng: 77.0048 },
    'chennai': { lat: 13.0827, lng: 80.2707 },
    'tindivanam': { lat: 12.2286, lng: 79.6514 },
    'villupuram': { lat: 11.9401, lng: 79.4861 },
    'coimbatore': { lat: 11.0168, lng: 76.9558 },
    'madurai': { lat: 9.9252, lng: 78.1198 },
    'salem': { lat: 11.6643, lng: 78.1460 },
    'kanchipuram': { lat: 12.8342, lng: 79.7036 },
    'gingee': { lat: 12.2519, lng: 79.4181 },
    'cuddalore': { lat: 11.7480, lng: 79.7714 },
    'trichy': { lat: 10.7905, lng: 78.7047 },
    'tiruchirappalli': { lat: 10.7905, lng: 78.7047 },
    'thanjavur': { lat: 10.7870, lng: 79.1378 },
    'tirunelveli': { lat: 8.7139, lng: 77.7567 },
    'erode': { lat: 11.3410, lng: 77.7172 },
    'vellore': { lat: 12.9165, lng: 79.1325 },
  };

  const key = `${p?.city || ''} ${p?.location || ''} ${p?.district || ''} ${p?.taluk || ''}`.toLowerCase().trim();
  for (const [k, v] of Object.entries(cityLookup)) {
    if (key.includes(k)) return v;
  }

  return { lat: 12.2286, lng: 79.6514 };
};
