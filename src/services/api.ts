import { type Property, mockProperties } from '../data/mockProperties';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const api = {
  getProperties: async (): Promise<Property[]> => {
    await delay(800);
    return mockProperties;
  },
  
  getPropertyById: async (id: string): Promise<Property | undefined> => {
    await delay(500);
    return mockProperties.find(p => p.id === id);
  },
  
  searchProperties: async (query: string): Promise<Property[]> => {
    await delay(800);
    const lowerQuery = query.toLowerCase();
    return mockProperties.filter(p => 
      p.title.toLowerCase().includes(lowerQuery) || 
      p.location.toLowerCase().includes(lowerQuery) ||
      p.district.toLowerCase().includes(lowerQuery)
    );
  },
  
  login: async (phone: string): Promise<{ token: string, user: any }> => {
    await delay(1000);
    return { token: 'mock-jwt-token', user: { id: 'u-1', phone } };
  },
  
  register: async (_data: any): Promise<{ success: boolean }> => {
    await delay(1000);
    return { success: true };
  },
  
  verifyOTP: async (otp: string): Promise<{ success: boolean }> => {
    await delay(500);
    return { success: otp === '1234' };
  },
  
  createProperty: async (_data: Partial<Property>): Promise<{ success: boolean, id: string }> => {
    await delay(1000);
    return { success: true, id: `prop-${Date.now()}` };
  },
  
  updateProperty: async (_id: string, _data: Partial<Property>): Promise<{ success: boolean }> => {
    await delay(1000);
    return { success: true };
  },
  
  deleteProperty: async (_id: string): Promise<{ success: boolean }> => {
    await delay(1000);
    return { success: true };
  },
  
  getFavorites: async (): Promise<Property[]> => {
    await delay(500);
    return [mockProperties[0]];
  },
  
  addFavorite: async (_id: string): Promise<{ success: boolean }> => {
    await delay(300);
    return { success: true };
  },
  
  removeFavorite: async (_id: string): Promise<{ success: boolean }> => {
    await delay(300);
    return { success: true };
  }
};
