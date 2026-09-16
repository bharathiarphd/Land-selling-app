import { mockProperties, type Property } from '../data/mockProperties';

const CUSTOM_PROPERTIES_KEY = 'landSellingApp_customProperties';
const RECENTLY_VIEWED_KEY = 'land_selling_app_recently_viewed';

export const getCustomProperties = (): Property[] => {
  const data = localStorage.getItem(CUSTOM_PROPERTIES_KEY);
  if (data) {
    try {
      return JSON.parse(data);
    } catch {
      return [];
    }
  }
  return [];
};

export const getPropertyById = (id: string): Property | undefined => {
  let property = mockProperties.find(p => p.id === id);
  if (!property) {
    property = getCustomProperties().find(p => p.id === id);
  }
  return property;
};

export const getAllProperties = (): Property[] => {
  const custom = getCustomProperties();
  return [...custom, ...mockProperties];
};

export const createProperty = (propertyData: Partial<Property>): Property => {
  const newProperty: Property = {
    ...propertyData,
    id: `prop_${Date.now()}`,
    status: propertyData.status || 'Available'
  } as Property;

  const customProps = getCustomProperties();
  customProps.unshift(newProperty);
  
  localStorage.setItem(CUSTOM_PROPERTIES_KEY, JSON.stringify(customProps));

  return newProperty;
};

export const updateProperty = (id: string, propertyData: Partial<Property>): Property | null => {
  const customProps = getCustomProperties();
  const index = customProps.findIndex(p => p.id === id);
  if (index === -1) return null;
  
  customProps[index] = { ...customProps[index], ...propertyData };
  localStorage.setItem(CUSTOM_PROPERTIES_KEY, JSON.stringify(customProps));
  return customProps[index];
};

export const deleteProperty = (id: string): boolean => {
  const customProps = getCustomProperties();
  const index = customProps.findIndex(p => p.id === id);
  if (index === -1) return false;
  
  customProps.splice(index, 1);
  localStorage.setItem(CUSTOM_PROPERTIES_KEY, JSON.stringify(customProps));
  return true;
};

export const updatePropertyStatus = (id: string, status: Property['status'] | 'Draft' | 'Pending' | 'Rejected' | 'Inactive'): boolean => {
  const customProps = getCustomProperties();
  const index = customProps.findIndex(p => p.id === id);
  if (index === -1) return false;
  
  customProps[index].status = status as any;
  localStorage.setItem(CUSTOM_PROPERTIES_KEY, JSON.stringify(customProps));
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
