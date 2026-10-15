import type { User } from '../services/authService';

export const ADMIN_PHONE_NUMBER = '8248843385';

export interface SavedCredentials {
  option: 'pin' | 'email' | 'phone';
  phone?: string;
  pin?: string;
  email?: string;
  password?: string;
  remember: boolean;
  savedAt: string;
}

const SAVED_CREDS_KEY = 'land_app_saved_credentials';

/**
 * Checks strictly if the logged in user is the designated Administrator.
 * Only ID / Phone 8248843385 is granted Admin Panel privileges.
 */
export function isAdminUser(user: User | null | undefined): boolean {
  if (!user) return false;
  
  const cleanPhone = (user.phone || '').replace(/\D/g, '').slice(-10);
  const cleanId = (user.id || '').replace(/\D/g, '').slice(-10);
  const emailVal = (user.email || '').toLowerCase();

  return (
    cleanPhone === ADMIN_PHONE_NUMBER ||
    cleanId === ADMIN_PHONE_NUMBER ||
    emailVal.includes(ADMIN_PHONE_NUMBER) ||
    (user.phone || '').includes(ADMIN_PHONE_NUMBER) ||
    (user.role === 'Admin' && cleanPhone === ADMIN_PHONE_NUMBER)
  );
}

/**
 * Generates local sequential user ID for offline resilience (ADM-000001, USR-000001, SLR-000001, AGT-000001)
 * Never reuses deleted IDs and avoids duplicates.
 */
export function generateLocalUserId(role: string): string {
  const r = String(role || '').toLowerCase();
  let prefix = 'USR';
  if (r === 'admin') prefix = 'ADM';
  else if (r === 'seller') prefix = 'SLR';
  else if (r === 'agent') prefix = 'AGT';

  try {
    const raw = localStorage.getItem('land_app_id_counters');
    const counters = raw ? JSON.parse(raw) : { ADM: 1, USR: 0, SLR: 0, AGT: 0 };
    counters[prefix] = (counters[prefix] || 0) + 1;
    localStorage.setItem('land_app_id_counters', JSON.stringify(counters));
    return `${prefix}-${String(counters[prefix]).padStart(6, '0')}`;
  } catch (_) {
    return `${prefix}-000001`;
  }
}

/**
 * Returns a clean, readable identifier for any logged-in user to show in the header.
 * Prioritizes the formal User ID (ADM-000001, USR-000001, SLR-000001, AGT-000001).
 */
export function getDisplayUserId(user: User | null | undefined): string {
  if (!user) return '';

  // 1. Prioritize formal unique User ID (e.g. ADM-000001, USR-000001)
  if (user.userId && /^[A-Z]{3}-\d{6}$/.test(user.userId)) {
    return user.userId;
  }

  // 2. Mobile number
  const cleanPhone = (user.phone || '').replace(/\D/g, '').slice(-10);
  if (cleanPhone && cleanPhone !== '9876543210') {
    return cleanPhone;
  }

  if (user.phone && !user.phone.includes('9876543210')) {
    return user.phone.replace('+91', '');
  }

  if (user.email) {
    return user.email.split('@')[0];
  }

  if (user.name && user.name !== 'User') {
    return user.name;
  }

  return user.id ? user.id.replace('usr_', '').substring(0, 8) : 'User';
}

/**
 * Loads saved credentials from localStorage
 */
export function getSavedCredentials(): SavedCredentials | null {
  try {
    const raw = localStorage.getItem(SAVED_CREDS_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (_) {
    return null;
  }
}

/**
 * Persists user credentials to localStorage
 */
export function saveCredentials(creds: Omit<SavedCredentials, 'savedAt'>): void {
  try {
    const data: SavedCredentials = {
      ...creds,
      savedAt: new Date().toISOString()
    };
    localStorage.setItem(SAVED_CREDS_KEY, JSON.stringify(data));
    
    // Also save individual PIN helper for offline PIN login
    if (creds.phone && creds.pin) {
      const digits = creds.phone.replace(/\D/g, '').slice(-10);
      localStorage.setItem(`pin_${digits}`, creds.pin);
      localStorage.setItem(`pin_+91${digits}`, creds.pin);
      localStorage.setItem('user_pin', creds.pin);
      localStorage.setItem('pending_auth_phone', digits);
    }
  } catch (e) {
    console.warn('Could not save credentials to localStorage', e);
  }
}

/**
 * Clears saved credentials
 */
export function clearSavedCredentials(): void {
  try {
    localStorage.removeItem(SAVED_CREDS_KEY);
  } catch (_) {}
}
