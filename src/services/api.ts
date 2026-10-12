import { type Property } from '../data/mockProperties';
import { 
  getAllProperties, 
  getPropertyById, 
  createProperty, 
  updateProperty, 
  deleteProperty,
  syncPropertiesFromBackend 
} from '../utils/propertyUtils';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

export const api = {
  getProperties: async (): Promise<Property[]> => {
    return await syncPropertiesFromBackend();
  },
  
  getPropertyById: async (id: string): Promise<Property | undefined> => {
    return getPropertyById(id);
  },
  
  searchProperties: async (query: string): Promise<Property[]> => {
    const properties = getAllProperties();
    const lowerQuery = query.toLowerCase();
    return properties.filter(p => 
      p.title.toLowerCase().includes(lowerQuery) || 
      p.location.toLowerCase().includes(lowerQuery) ||
      (p.district && p.district.toLowerCase().includes(lowerQuery))
    );
  },
  
  createProperty: async (data: Partial<Property>): Promise<{ success: boolean, id: string }> => {
    const created = createProperty(data);
    return { success: true, id: created.id };
  },
  
  updateProperty: async (id: string, data: Partial<Property>): Promise<{ success: boolean }> => {
    const updated = updateProperty(id, data);
    return { success: !!updated };
  },
  
  deleteProperty: async (id: string): Promise<{ success: boolean }> => {
    const ok = deleteProperty(id);
    return { success: ok };
  },
  
  getFavorites: async (): Promise<Property[]> => {
    const favIds: string[] = JSON.parse(localStorage.getItem('land_selling_app_favorites') || '[]');
    const all = getAllProperties();
    return all.filter(p => favIds.includes(p.id));
  },
  
  addFavorite: async (id: string): Promise<{ success: boolean }> => {
    const favIds: string[] = JSON.parse(localStorage.getItem('land_selling_app_favorites') || '[]');
    if (!favIds.includes(id)) {
      favIds.push(id);
      localStorage.setItem('land_selling_app_favorites', JSON.stringify(favIds));
    }
    return { success: true };
  },
  
  removeFavorite: async (id: string): Promise<{ success: boolean }> => {
    let favIds: string[] = JSON.parse(localStorage.getItem('land_selling_app_favorites') || '[]');
    favIds = favIds.filter(fId => fId !== id);
    localStorage.setItem('land_selling_app_favorites', JSON.stringify(favIds));
    return { success: true };
  }
};
