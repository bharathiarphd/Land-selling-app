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
    location: 'Sholinganallur',
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
    location: 'Vandalur',
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
    location: 'Sriperumbudur',
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
    location: 'Pollachi',
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

export const getUserProperties = (userId: string): Property[] => {
  return getAllProperties().filter(p => p.seller.id === userId);
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
