import { type Property } from '../data/mockProperties';
import { BACKEND_URL } from '../config/api';

const CUSTOM_PROPERTIES_KEY = 'landSellingApp_customProperties';
const RECENTLY_VIEWED_KEY = 'land_selling_app_recently_viewed';

export const DEFAULT_SEED_PROPERTIES: Property[] = [
  {
    id: 'prop-1',
    title: 'Prime Residential Plot near OMR IT Corridor',
    description: 'Corner plot with clear DTCP approval, 40ft road frontage, ready for immediate construction.',
    propertyType: 'Residential Plot',
    price: 4200000,
    originalPrice: 4800000,
    isPriceReduced: true,
    reducedAmount: 600000,
    area: 2400,
    areaUnit: 'Sq.Ft',
    sqFtRate: 1750,
    totalSquareFeet: 2400,
    location: 'Sholinganallur',
    city: 'Chennai',
    district: 'Chennai',
    taluk: 'Tambaram',
    village: 'Sholinganallur',
    images: ['https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&auto=format&fit=crop&q=60'],
    facing: 'North-East',
    roadWidth: 40,
    electricity: true,
    water: true,
    approval: 'DTCP',
    seller: {
      id: 'seller-1',
      name: 'Karthik S.',
      phone: '9842112233',
      type: 'Owner',
      isVerified: true
    },
    status: 'Available',
    dateAdded: '2026-10-10',
    latitude: 12.9010,
    longitude: 80.2279,
    verificationStatus: 'Verified by Platform',
    views: 142,
    enquiries: 8
  },
  {
    id: 'prop-2',
    title: 'Gated Community Villa Plot with DTCP Approval',
    description: 'Blacktop road, streetlights, 24/7 security in fast developing area near GST road.',
    propertyType: 'Residential Plot',
    price: 2500000,
    originalPrice: 2800000,
    isPriceReduced: true,
    reducedAmount: 300000,
    area: 1500,
    areaUnit: 'Sq.Ft',
    sqFtRate: 1667,
    totalSquareFeet: 1500,
    location: 'Vandalur',
    city: 'Chennai',
    district: 'Chennai',
    taluk: 'Chengalpattu',
    village: 'Otteri',
    images: ['https://images.unsplash.com/photo-1524813686514-a57563d77d66?w=800&auto=format&fit=crop&q=60'],
    facing: 'East',
    roadWidth: 30,
    electricity: true,
    water: true,
    approval: 'DTCP',
    seller: {
      id: 'seller-2',
      name: 'Senthil Nathan',
      phone: '9443215678',
      type: 'Owner',
      isVerified: true
    },
    status: 'Available',
    dateAdded: '2026-10-12',
    latitude: 12.8913,
    longitude: 80.0811,
    verificationStatus: 'Verified by Platform',
    views: 89,
    enquiries: 5
  },
  {
    id: 'prop-3',
    title: 'Commercial Land Facing 6-Lane Highway',
    description: 'Ideal for showroom, warehouse, or commercial complex. Excellent connectivity.',
    propertyType: 'Commercial Land',
    price: 11500000,
    area: 4800,
    areaUnit: 'Sq.Ft',
    sqFtRate: 2396,
    totalSquareFeet: 4800,
    location: 'Sriperumbudur',
    city: 'Kanchipuram',
    district: 'Kanchipuram',
    taluk: 'Sriperumbudur',
    village: 'Mambakkam',
    images: ['https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800&auto=format&fit=crop&q=60'],
    facing: 'North',
    roadWidth: 60,
    electricity: true,
    water: true,
    approval: 'CMDA',
    seller: {
      id: 'seller-3',
      name: 'Raja Builders & Promoters',
      phone: '9840998877',
      type: 'Developer',
      isVerified: true
    },
    status: 'Available',
    dateAdded: '2026-10-14',
    latitude: 12.9675,
    longitude: 79.9436,
    verificationStatus: 'Verified by Platform',
    views: 210,
    enquiries: 12
  },
  {
    id: 'prop-4',
    title: 'Fertile Agricultural Land with Free Borewell & EB Service',
    description: 'Red soil, copiously yielding coconut grove with drip irrigation installed.',
    propertyType: 'Agricultural Land',
    price: 3600000,
    originalPrice: 4000000,
    isPriceReduced: true,
    reducedAmount: 400000,
    area: 2,
    areaUnit: 'Acre',
    sqFtRate: 41,
    totalSquareFeet: 87120,
    location: 'Pollachi',
    city: 'Pollachi',
    district: 'Coimbatore',
    taluk: 'Pollachi',
    village: 'Negamam',
    images: ['https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&auto=format&fit=crop&q=60'],
    facing: 'South',
    roadWidth: 20,
    electricity: true,
    water: true,
    approval: 'Panchayat',
    seller: {
      id: 'seller-4',
      name: 'Murugan Palanisamy',
      phone: '9842554433',
      type: 'Owner',
      isVerified: true
    },
    status: 'Available',
    dateAdded: '2026-10-15',
    latitude: 10.6609,
    longitude: 77.0048,
    verificationStatus: 'Verified by Platform',
    views: 165,
    enquiries: 9
  }
];

export const getCustomProperties = (): Property[] => {
  const data = localStorage.getItem(CUSTOM_PROPERTIES_KEY);
  if (data) {
    try {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    } catch {
      return DEFAULT_SEED_PROPERTIES;
    }
  }
  localStorage.setItem(CUSTOM_PROPERTIES_KEY, JSON.stringify(DEFAULT_SEED_PROPERTIES));
  return DEFAULT_SEED_PROPERTIES;
};

export const syncPropertiesFromBackend = async (): Promise<Property[]> => {
  try {
    const res = await fetch(`${BACKEND_URL}/api/properties`);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) {
        const formatted = data.map((item: any) => ({
          ...item,
          id: item._id || item.id
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
  const newProperty: Property = {
    ...propertyData,
    id: propertyData.id || `prop_${Date.now()}`,
    status: propertyData.status || 'Available'
  } as Property;

  const customProps = getCustomProperties();
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
