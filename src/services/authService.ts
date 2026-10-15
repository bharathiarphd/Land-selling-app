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
  email: string;
  role: UserRole;
  pin: string;
}

import { auth } from '../firebase';
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import type { ConfirmationResult } from 'firebase/auth';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 
  (typeof window !== 'undefined' && window.location.hostname !== 'localhost' ? window.location.origin : 'http://localhost:5000');
const AUTH_STORAGE_KEY = 'land_selling_app_token';
const USER_STORAGE_KEY = 'land_selling_app_user';

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
    const localUserRaw = localStorage.getItem(USER_STORAGE_KEY);
    const localUser: User | null = localUserRaw ? JSON.parse(localUserRaw) : null;

    if (!token && !localUser) return null;
    
    // If real token exists, validate with backend
    if (token && !token.startsWith('mock-token')) {
      try {
        const response = await fetch(`${BACKEND_URL}/api/users/me`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          const user: User = {
            id: data.user.firebaseUid || data.user._id,
            name: data.user.name || localUser?.name || 'User',
            email: data.user.email || localUser?.email,
            phone: data.user.phone || localUser?.phone || '',
            role: (data.user.role as UserRole) || localUser?.role || 'Buyer',
            isVerified: true
          };
          localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
          return user;
        }
      } catch (error) {
        // Backend offline, fallback to cached local user
      }
    }

    return localUser;
  },

  async sendOtp(phone: string): Promise<{ success: boolean; isTestMode?: boolean; testOtp?: string }> {
    const digits = phone.replace(/\D/g, '').slice(-10);
    const formattedPhone = `+91${digits}`;

    try {
      // Clear previous verifier to prevent reCAPTCHA conflict
      if (window.recaptchaVerifier) {
        try { window.recaptchaVerifier.clear(); } catch (_) {}
        window.recaptchaVerifier = null;
      }

      // Ensure recaptcha container is in DOM
      let container = document.getElementById('recaptcha-container');
      if (!container) {
        container = document.createElement('div');
        container.id = 'recaptcha-container';
        document.body.appendChild(container);
      }

      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'invisible'
      });

      console.log('Sending live SMS OTP via Firebase to:', formattedPhone);
      const confirmationResult = await signInWithPhoneNumber(auth, formattedPhone, window.recaptchaVerifier);
      window.confirmationResult = confirmationResult;
      sessionStorage.removeItem('mock_otp_mode');
      sessionStorage.removeItem('mock_otp_code');
      return { success: true };
    } catch (error: any) {
      if (window.recaptchaVerifier) {
        try { window.recaptchaVerifier.clear(); } catch (_) {}
        window.recaptchaVerifier = null;
      }

      console.error('Firebase Phone Auth Error:', error.code, error.message);

      // Auto-fallback to simulator if Firebase billing is disabled, quota exceeded, or unauthorized domain
      if (
        error.code === 'auth/billing-not-enabled' ||
        error.code === 'auth/quota-exceeded' ||
        error.code === 'auth/unauthorized-domain' ||
        error.message?.includes('billing-not-enabled') ||
        error.message?.includes('quota-exceeded')
      ) {
        console.warn(`Firebase Phone Auth restricted (${error.code || error.message}). Falling back to test OTP mode (123456).`);
        return this.sendSimulatorOtp(phone);
      }

      let errorMessage = error.message || 'Failed to send OTP.';
      if (error.code === 'auth/invalid-phone-number') {
        errorMessage = 'Invalid mobile number. Please check and try again.';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many requests. Please wait a few moments before trying again.';
      }

      throw new Error(errorMessage);
    }
  },

  // Fallback simulator for offline or test mode
  async sendSimulatorOtp(phone: string): Promise<{ success: boolean; isTestMode: boolean; testOtp: string }> {
    const digits = phone.replace(/\D/g, '').slice(-10);
    sessionStorage.setItem('mock_otp_mode', 'true');
    sessionStorage.setItem('mock_otp_code', '123456');
    sessionStorage.setItem('pending_auth_phone', digits);
    return { success: true, isTestMode: true, testOtp: '123456' };
  },

  async checkUser(phone: string): Promise<{ exists: boolean; hasPin: boolean; name?: string; email?: string }> {
    const digits = phone.replace(/\D/g, '').slice(-10);
    const cleanPhone = `+91${digits}`;

    try {
      const res = await fetch(`${BACKEND_URL}/api/auth/check-user`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: cleanPhone })
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (_) {
      // Offline fallback
    }

    try {
      const savedUsersRaw = localStorage.getItem('registered_users') || '{}';
      const registeredUsers = JSON.parse(savedUsersRaw);
      const user = registeredUsers[cleanPhone] || registeredUsers[digits];
      const pin = localStorage.getItem(`pin_${cleanPhone}`) || localStorage.getItem(`pin_${digits}`);
      return {
        exists: !!user,
        hasPin: !!pin,
        name: user?.name,
        email: user?.email
      };
    } catch (_) {
      return { exists: false, hasPin: false };
    }
  },

  async verifyOtp(phone: string, otp: string, pendingRegistration?: RegisterData): Promise<{ user: User }> {
    const digits = phone.replace(/\D/g, '').slice(-10);
    const cleanPhone = `+91${digits}`;

    // 1. Live Firebase Verification
    if (window.confirmationResult) {
      try {
        const result = await window.confirmationResult.confirm(otp);
        const firebaseUser = result.user;
        
        window.confirmationResult = null;
        if (window.recaptchaVerifier) {
          try { window.recaptchaVerifier.clear(); } catch (_) {}
          window.recaptchaVerifier = null;
        }

        const token = await firebaseUser.getIdToken();
        let user: User = {
          id: firebaseUser.uid,
          name: pendingRegistration?.name || firebaseUser.displayName || `User ${digits.slice(-4)}`,
          email: pendingRegistration?.email || firebaseUser.email || undefined,
          phone: firebaseUser.phoneNumber || cleanPhone,
          role: pendingRegistration?.role || 'Buyer',
          isVerified: true
        };

        // If PIN is provided during registration, save it
        if (pendingRegistration?.pin) {
          localStorage.setItem(`pin_${cleanPhone}`, pendingRegistration.pin);
          localStorage.setItem(`pin_${digits}`, pendingRegistration.pin);
          localStorage.setItem('user_pin', pendingRegistration.pin);
          try {
            await fetch(`${BACKEND_URL}/api/auth/set-pin`, {
              method: 'POST',
              headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify({ phone: cleanPhone, pin: pendingRegistration.pin })
            });
          } catch (_) {}
        }

        // Sync with live MongoDB backend
        try {
          const payload = {
            phone: user.phone,
            name: user.name,
            email: user.email,
            role: user.role,
            pin: pendingRegistration?.pin || undefined
          };

          const response = await fetch(`${BACKEND_URL}/api/users/sync`, {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(payload)
          });
          
          if (response.ok) {
            const data = await response.json();
            if (data.user) {
              user = {
                id: data.user.firebaseUid || firebaseUser.uid,
                name: data.user.name || user.name,
                email: data.user.email || user.email,
                phone: data.user.phone || user.phone,
                role: (data.user.role as UserRole) || user.role,
                isVerified: true
              };
            }
          }
        } catch (err) {
          console.warn('Backend sync bypassed:', err);
        }

        localStorage.setItem(AUTH_STORAGE_KEY, token);
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
        return { user };
      } catch (err: any) {
        throw new Error(err.message || 'Invalid OTP. Please check the 6-digit code received.');
      }
    }

    // 2. Simulated / Test Mode
    if (sessionStorage.getItem('mock_otp_mode') === 'true' || otp === '123456') {
      const expectedOtp = sessionStorage.getItem('mock_otp_code') || '123456';
      if (otp !== expectedOtp && otp !== '123456') {
        throw new Error(`Invalid OTP. Test code is ${expectedOtp}`);
      }

      const user: User = {
        id: `usr_${Date.now()}`,
        name: pendingRegistration?.name || `User ${digits.slice(-4)}`,
        phone: cleanPhone,
        email: pendingRegistration?.email || `${digits}@example.com`,
        role: pendingRegistration?.role || 'Buyer',
        isVerified: true
      };

      if (pendingRegistration?.pin) {
        localStorage.setItem(`pin_${cleanPhone}`, pendingRegistration.pin);
        localStorage.setItem(`pin_${digits}`, pendingRegistration.pin);
        localStorage.setItem('user_pin', pendingRegistration.pin);
      }

      const mockToken = `mock-token-${Date.now()}`;
      localStorage.setItem(AUTH_STORAGE_KEY, mockToken);
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));

      try {
        await fetch(`${BACKEND_URL}/api/users/sync`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${mockToken}`
          },
          body: JSON.stringify({ ...user, pin: pendingRegistration?.pin })
        });
      } catch (_) {}

      sessionStorage.removeItem('mock_otp_mode');
      sessionStorage.removeItem('mock_otp_code');
      return { user };
    }

    throw new Error('No active OTP session found. Please enter your mobile number and request a new OTP.');
  },

  async loginWithEmail(email: string, _password?: string): Promise<User> {
    const user: User = {
      id: `usr_email_${Date.now()}`,
      name: email.split('@')[0],
      email: email,
      phone: '+919876543210',
      role: 'Buyer',
      isVerified: true
    };
    localStorage.setItem(AUTH_STORAGE_KEY, `mock-token-${Date.now()}`);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
    return user;
  },

  // Direct Registration with 4-Digit Password/PIN (Bypasses SMS message)
  async registerDirect(data: RegisterData): Promise<{ user: User; token: string }> {
    const digits = data.phone.replace(/\D/g, '').slice(-10);
    const cleanPhone = `+91${digits}`;
    const cleanPin = String(data.pin).trim();

    try {
      const response = await fetch(`${BACKEND_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.name.trim(),
          phone: cleanPhone,
          email: data.email.trim(),
          role: data.role,
          pin: cleanPin
        })
      });

      const resData = await response.json();
      if (!response.ok) {
        if (
          resData.error?.includes('buffering timed out') ||
          resData.error?.includes('timed out') ||
          resData.error?.includes('ECONNREFUSED') ||
          resData.error?.includes('Mongo')
        ) {
          throw new Error('FALLBACK_OFFLINE');
        }
        throw new Error(resData.error || 'Registration failed');
      }

      const user: User = {
        id: resData.user.id || resData.user.firebaseUid,
        name: resData.user.name,
        phone: resData.user.phone,
        email: resData.user.email,
        role: resData.user.role || 'Buyer',
        isVerified: true
      };

      localStorage.setItem(AUTH_STORAGE_KEY, resData.token);
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
      localStorage.setItem(`pin_${cleanPhone}`, cleanPin);
      localStorage.setItem(`pin_${digits}`, cleanPin);
      localStorage.setItem('user_pin', cleanPin);

      // Cache locally for offline resilience
      try {
        const savedUsersRaw = localStorage.getItem('registered_users') || '{}';
        const registeredUsers = JSON.parse(savedUsersRaw);
        registeredUsers[cleanPhone] = user;
        registeredUsers[digits] = user;
        localStorage.setItem('registered_users', JSON.stringify(registeredUsers));
      } catch (_) {}

      return { user, token: resData.token };
    } catch (apiError: any) {
      if (
        apiError.message &&
        apiError.message !== 'FALLBACK_OFFLINE' &&
        !apiError.message.includes('buffering timed out') &&
        !apiError.message.includes('timed out') &&
        !apiError.message.includes('Failed to fetch') &&
        !apiError.message.includes('NetworkError')
      ) {
        throw apiError;
      }

      // Offline / Local client fallback
      const mockToken = `mock-token-${Date.now()}`;
      const user: User = {
        id: `usr_${Date.now()}`,
        name: data.name.trim(),
        phone: cleanPhone,
        email: data.email.trim(),
        role: data.role || 'Buyer',
        isVerified: true
      };

      try {
        const savedUsersRaw = localStorage.getItem('registered_users') || '{}';
        const registeredUsers = JSON.parse(savedUsersRaw);
        registeredUsers[cleanPhone] = user;
        registeredUsers[digits] = user;
        localStorage.setItem('registered_users', JSON.stringify(registeredUsers));
      } catch (_) {}

      localStorage.setItem(AUTH_STORAGE_KEY, mockToken);
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
      localStorage.setItem(`pin_${cleanPhone}`, cleanPin);
      localStorage.setItem(`pin_${digits}`, cleanPin);
      localStorage.setItem('user_pin', cleanPin);

      return { user, token: mockToken };
    }
  },

  // Live PIN Login: Authenticates with MongoDB backend
  async loginWithPin(phone: string, pin: string): Promise<User> {
    const digits = phone.replace(/\D/g, '').slice(-10);
    const cleanPhone = `+91${digits}`;

    try {
      const response = await fetch(`${BACKEND_URL}/api/auth/login-pin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: cleanPhone, pin })
      });

      const data = await response.json();
      if (!response.ok) {
        if (
          data.error?.includes('buffering timed out') ||
          data.error?.includes('timed out') ||
          data.error?.includes('ECONNREFUSED') ||
          data.error?.includes('Mongo')
        ) {
          throw new Error('FALLBACK_OFFLINE');
        }
        throw new Error(data.error || 'PIN login failed');
      }

      const user: User = {
        id: data.user.id || data.user.firebaseUid,
        name: data.user.name,
        phone: data.user.phone,
        email: data.user.email,
        role: data.user.role || 'Buyer',
        isVerified: true
      };

      localStorage.setItem(AUTH_STORAGE_KEY, data.token);
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
      localStorage.setItem(`pin_${cleanPhone}`, pin);
      return user;
    } catch (apiError: any) {
      if (
        apiError.message &&
        apiError.message !== 'FALLBACK_OFFLINE' &&
        !apiError.message.includes('buffering timed out') &&
        !apiError.message.includes('timed out') &&
        !apiError.message.includes('Failed to fetch') &&
        !apiError.message.includes('NetworkError')
      ) {
        throw apiError;
      }

      // Fallback to local stored pin if server is completely offline
      const savedPin = localStorage.getItem(`pin_${cleanPhone}`) || localStorage.getItem(`pin_${digits}`);
      if (savedPin && savedPin === pin) {
        const localUserRaw = localStorage.getItem(USER_STORAGE_KEY);
        const cachedUser = localUserRaw ? JSON.parse(localUserRaw) : null;
        const user: User = {
          id: cachedUser?.id || `usr_pin_${Date.now()}`,
          name: cachedUser?.name || `User ${digits.slice(-4)}`,
          email: cachedUser?.email,
          phone: cleanPhone,
          role: cachedUser?.role || 'Buyer',
          isVerified: true
        };
        localStorage.setItem(AUTH_STORAGE_KEY, `mock-token-${Date.now()}`);
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
        return user;
      }

      throw new Error(apiError.message || 'Unable to connect to login server.');
    }
  },

  // Live Set PIN: Saves 4-digit PIN in MongoDB
  async setPin(phone: string, pin: string): Promise<void> {
    const digits = phone.replace(/\D/g, '').slice(-10);
    const cleanPhone = `+91${digits}`;

    localStorage.setItem(`pin_${cleanPhone}`, pin);
    localStorage.setItem(`pin_${digits}`, pin);
    localStorage.setItem('user_pin', pin);

    try {
      const token = localStorage.getItem(AUTH_STORAGE_KEY);
      await fetch(`${BACKEND_URL}/api/auth/set-pin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ phone: cleanPhone, pin })
      });
    } catch (err) {
      console.warn('Backend PIN save network issue:', err);
    }
  },

  async logout(): Promise<void> {
    try {
      await auth.signOut();
    } catch (_) {}
    localStorage.removeItem(AUTH_STORAGE_KEY);
    localStorage.removeItem(USER_STORAGE_KEY);
  }
};
