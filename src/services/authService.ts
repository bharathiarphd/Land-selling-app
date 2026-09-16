/**
 * Mock Authentication Service
 * 
 * This service currently uses localStorage to mock backend authentication behaviors.
 * In Phase 11, these functions will be replaced with real API calls using fetch/axios.
 */

export type UserRole = 'Buyer' | 'Seller' | 'Agent' | 'Admin';

export interface User {
  id: string;
  name: string;
  phone: string;
  email?: string;
  role: UserRole;
  isVerified: boolean;
}

export interface RegisterData {
  name: string;
  phone: string;
  email?: string;
  role: UserRole;
}

const AUTH_STORAGE_KEY = 'land_selling_app_auth_session';
const USERS_DB_KEY = 'land_selling_app_mock_users';

// Initialize a mock user database if it doesn't exist
const getMockUsers = (): User[] => {
  const users = localStorage.getItem(USERS_DB_KEY);
  if (users) return JSON.parse(users);
  return [];
};

const saveMockUsers = (users: User[]) => {
  localStorage.setItem(USERS_DB_KEY, JSON.stringify(users));
};

export const authService = {
  // API-Ready signature: async () => Promise<User | null>
  async getSession(): Promise<User | null> {
    const session = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!session) return null;
    try {
      return JSON.parse(session) as User;
    } catch {
      return null;
    }
  },

  // API-Ready signature: async (phone: string) => Promise<{ success: boolean }>
  async sendOtp(phone: string): Promise<{ success: boolean }> {
    console.log(`[MOCK API] Sending OTP to ${phone}`);
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // In a real app, this would trigger an SMS. 
    // Here we just return success.
    return { success: true };
  },

  // API-Ready signature: async (phone: string, otp: string) => Promise<{ user: User }>
  async verifyOtp(phone: string, otp: string, pendingRegistration?: RegisterData): Promise<{ user: User }> {
    console.log(`[MOCK API] Verifying OTP ${otp} for ${phone}`);
    await new Promise(resolve => setTimeout(resolve, 1000));

    if (otp !== '123456') {
      throw new Error('Invalid OTP');
    }

    const users = getMockUsers();
    let user = users.find(u => u.phone === phone);

    if (!user) {
      if (pendingRegistration) {
        // Create new user
        user = {
          id: `usr_${Date.now()}`,
          name: pendingRegistration.name,
          phone: pendingRegistration.phone,
          email: pendingRegistration.email,
          role: pendingRegistration.role,
          isVerified: true
        };
        users.push(user);
        saveMockUsers(users);
      } else if (phone === '9999999999') {
        user = {
          id: 'admin_1',
          name: 'System Admin',
          phone,
          role: 'Admin',
          isVerified: true
        };
        users.push(user);
        saveMockUsers(users);
      } else {
        // Mock fallback if user tries to login but doesn't exist.
        // For development, auto-create a mock user if they login with an unknown number.
        user = {
          id: `usr_${Date.now()}`,
          name: 'Demo User',
          phone,
          role: 'Buyer',
          isVerified: true
        };
        users.push(user);
        saveMockUsers(users);
      }
    }

    // Save session
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));

    return { user };
  },

  // API-Ready signature: async () => Promise<void>
  async logout(): Promise<void> {
    console.log(`[MOCK API] Logging out`);
    await new Promise(resolve => setTimeout(resolve, 500));
    localStorage.removeItem(AUTH_STORAGE_KEY);
  }
};
