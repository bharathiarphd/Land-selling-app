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

import { auth } from '../firebase';
import { RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from 'firebase/auth';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
const AUTH_STORAGE_KEY = 'land_selling_app_token';

// Extend window object for Firebase Phone Auth
declare global {
  interface Window {
    recaptchaVerifier: RecaptchaVerifier | null;
    confirmationResult: ConfirmationResult | null;
  }
}

export const authService = {
  
  async getSession(): Promise<User | null> {
    const token = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!token) return null;
    
    try {
      const response = await fetch(`${BACKEND_URL}/api/users/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) {
        localStorage.removeItem(AUTH_STORAGE_KEY);
        return null;
      }
      const data = await response.json();
      return {
        id: data.user.firebaseUid || data.user._id,
        name: data.user.name,
        email: data.user.email,
        phone: data.user.phone || '',
        role: data.user.role as UserRole,
        isVerified: true
      };
    } catch (error) {
      return null;
    }
  },

  async sendOtp(phone: string): Promise<{ success: boolean }> {
    try {
      // Create Recaptcha if it doesn't exist
      if (!window.recaptchaVerifier) {
        window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
          size: 'invisible'
        });
      }

      const appVerifier = window.recaptchaVerifier;
      
      // Ensure phone has country code
      const formattedPhone = phone.startsWith('+') ? phone : `+91${phone}`;
      
      console.log('Sending OTP via Firebase to:', formattedPhone);
      const confirmationResult = await signInWithPhoneNumber(auth, formattedPhone, appVerifier);
      
      // Save it globally so verifyOTP page can access it
      window.confirmationResult = confirmationResult;
      return { success: true };
    } catch (error: any) {
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
        window.recaptchaVerifier = null;
      }
      throw new Error(error.message || 'Failed to send OTP via Firebase');
    }
  },

  async verifyOtp(phone: string, otp: string, pendingRegistration?: RegisterData): Promise<{ user: User }> {
    if (!window.confirmationResult) {
      throw new Error("No pending OTP request found. Please request a new OTP.");
    }
    
    try {
      // 1. Confirm OTP with Firebase
      const result = await window.confirmationResult.confirm(otp);
      const firebaseUser = result.user;
      
      // 2. Clear out the recaptcha
      window.confirmationResult = null;
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
        window.recaptchaVerifier = null;
      }

      // 3. Sync with MongoDB Backend (pass the Firebase Token)
      const token = await firebaseUser.getIdToken();
      
      const payload = pendingRegistration ? {
        phone: firebaseUser.phoneNumber || `+91${phone}`,
        name: pendingRegistration.name,
        email: pendingRegistration.email,
        role: pendingRegistration.role
      } : {
        phone: firebaseUser.phoneNumber || `+91${phone}`
      };

      const response = await fetch(`${BACKEND_URL}/api/users/sync`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Backend sync failed');
      
      // We store the Firebase JWT token as our session token
      localStorage.setItem(AUTH_STORAGE_KEY, token);
      
      return { user: {
        id: data.user.firebaseUid,
        name: data.user.name || '',
        email: data.user.email,
        phone: data.user.phone || phone,
        role: data.user.role as UserRole,
        isVerified: true
      }};
      
    } catch (error: any) {
      throw new Error(error.message || 'Invalid OTP');
    }
  },

  async logout(): Promise<void> {
    await auth.signOut();
    localStorage.removeItem(AUTH_STORAGE_KEY);
  }
};
