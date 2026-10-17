import type { Property } from '../data/mockProperties';
import { getAllProperties } from './propertyUtils';

export interface WishItem {
  id: string;
  propertyId: string;
  propertyTitle: string;
  propertyPrice: number;
  propertyLocation: string;
  propertyImage?: string;
  userId: string;
  userName: string;
  userPhone: string;
  userRole?: string;
  createdAt: string;
}

const USER_WISHES_KEY_PREFIX = 'land_app_wishes_';
const GLOBAL_WISHES_KEY = 'land_app_global_platform_wishes';

// Initial demo platform wishes so admin and demo accounts have immediate rich data
const INITIAL_DEMO_WISHES: WishItem[] = [
  {
    id: 'wish_1',
    propertyId: 'prop-1',
    propertyTitle: 'Prime Residential Plot near OMR IT Corridor',
    propertyPrice: 4200000,
    propertyLocation: 'Sholinganallur, Chennai',
    propertyImage: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&auto=format&fit=crop&q=60',
    userId: 'usr_buyer_1',
    userName: 'Ramesh Kumar',
    userPhone: '9840123456',
    userRole: 'Buyer',
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString()
  },
  {
    id: 'wish_2',
    propertyId: 'prop-1',
    propertyTitle: 'Prime Residential Plot near OMR IT Corridor',
    propertyPrice: 4200000,
    propertyLocation: 'Sholinganallur, Chennai',
    propertyImage: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&auto=format&fit=crop&q=60',
    userId: 'usr_buyer_2',
    userName: 'Priya Sundar',
    userPhone: '9876543299',
    userRole: 'Buyer',
    createdAt: new Date(Date.now() - 3600000 * 18).toISOString()
  },
  {
    id: 'wish_3',
    propertyId: 'prop-2',
    propertyTitle: 'Gated Community Villa Plot with DTCP Approval',
    propertyPrice: 2600000,
    propertyLocation: 'Vandalur, Chennai',
    propertyImage: 'https://images.unsplash.com/photo-1524813686514-a57563d77d66?w=800&auto=format&fit=crop&q=60',
    userId: 'usr_buyer_1',
    userName: 'Ramesh Kumar',
    userPhone: '9840123456',
    userRole: 'Buyer',
    createdAt: new Date(Date.now() - 3600000 * 22).toISOString()
  },
  {
    id: 'wish_4',
    propertyId: 'prop-3',
    propertyTitle: 'Commercial Land Facing Highway with CMDA Clearance',
    propertyPrice: 11500000,
    propertyLocation: 'Sriperumbudur, Kanchipuram',
    propertyImage: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800&auto=format&fit=crop&q=60',
    userId: 'usr_1792044993109_42plu',
    userName: 'Bharathiar',
    userPhone: '9876543210',
    userRole: 'Agent',
    createdAt: new Date(Date.now() - 3600000 * 30).toISOString()
  }
];

export const formatCapitalizedName = (name?: string): string => {
  if (!name) return '';
  return name
    .trim()
    .split(/\s+/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

const getGlobalWishes = (): WishItem[] => {
  try {
    const raw = localStorage.getItem(GLOBAL_WISHES_KEY);
    if (!raw) {
      localStorage.setItem(GLOBAL_WISHES_KEY, JSON.stringify(INITIAL_DEMO_WISHES));
      return INITIAL_DEMO_WISHES;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_DEMO_WISHES;
  }
};

const saveGlobalWishes = (items: WishItem[]) => {
  try {
    localStorage.setItem(GLOBAL_WISHES_KEY, JSON.stringify(items));
    window.dispatchEvent(new Event('wishlist_updated'));
  } catch (e) {
    console.warn('Failed to save global wishes', e);
  }
};

export const wishlistUtils = {
  // Get wishlist property IDs for a specific user
  getUserWishIds: (userId?: string): string[] => {
    const effectiveId = userId || 'guest_user';
    try {
      // Check user-specific key
      const key = `${USER_WISHES_KEY_PREFIX}${effectiveId}`;
      const raw = localStorage.getItem(key);
      if (raw) return JSON.parse(raw);

      // Fallback: check general favorites key
      const general = localStorage.getItem('land_selling_app_favorites');
      if (general) {
        const parsed = JSON.parse(general);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }

      // Default demo wishes for demo user
      if (userId === 'usr_buyer_1') return ['prop-1', 'prop-2'];
      if (userId === 'firebase_user_sample_9876543299' || userId === 'usr_buyer_2') return ['prop-1'];
      return [];
    } catch {
      return [];
    }
  },

  // Get full Property objects for a user's wishlist
  getUserWishedProperties: (userId?: string): Property[] => {
    const wishIds = wishlistUtils.getUserWishIds(userId);
    const allProps = getAllProperties();
    return allProps.filter(p => wishIds.includes(p.id));
  },

  // Toggle wishlist state for a property
  toggleWish: (
    property: Property,
    user?: { id?: string; name?: string; phone?: string; role?: string }
  ): boolean => {
    const effectiveId = user?.id || 'guest_user';
    const userName = formatCapitalizedName(user?.name || 'Customer');
    const userPhone = user?.phone || '';
    const userRole = user?.role || 'Buyer';

    const currentIds = wishlistUtils.getUserWishIds(effectiveId);
    const isWished = currentIds.includes(property.id);

    let updatedIds: string[];
    let globalWishes = getGlobalWishes();

    if (isWished) {
      // Remove
      updatedIds = currentIds.filter(id => id !== property.id);
      globalWishes = globalWishes.filter(
        w => !(w.propertyId === property.id && (w.userId === effectiveId || (userPhone && w.userPhone.includes(userPhone.slice(-10)))))
      );
    } else {
      // Add
      updatedIds = [...currentIds, property.id];
      const newWish: WishItem = {
        id: `wish_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        propertyId: property.id,
        propertyTitle: property.title,
        propertyPrice: property.price,
        propertyLocation: `${property.location}, ${property.district}`,
        propertyImage: property.images?.[0] || '',
        userId: effectiveId,
        userName,
        userPhone,
        userRole,
        createdAt: new Date().toISOString()
      };
      globalWishes.unshift(newWish);
    }

    // Save user list
    localStorage.setItem(`${USER_WISHES_KEY_PREFIX}${effectiveId}`, JSON.stringify(updatedIds));
    localStorage.setItem('land_selling_app_favorites', JSON.stringify(updatedIds));
    saveGlobalWishes(globalWishes);

    return !isWished;
  },

  // Check if a property is in user's wishlist
  isWished: (propertyId: string, userId?: string): boolean => {
    const ids = wishlistUtils.getUserWishIds(userId);
    return ids.includes(propertyId);
  },

  // Admin view: get all platform customer wishes grouped or raw
  getAllPlatformWishes: (): WishItem[] => {
    return getGlobalWishes();
  },

  // Admin view: get wish counts per property
  getPropertyWishStats: (): { property: Property | undefined; count: number; users: WishItem[] }[] => {
    const wishes = getGlobalWishes();
    const allProps = getAllProperties();

    const map = new Map<string, WishItem[]>();
    wishes.forEach(w => {
      const arr = map.get(w.propertyId) || [];
      arr.push(w);
      map.set(w.propertyId, arr);
    });

    const result: { property: Property | undefined; count: number; users: WishItem[] }[] = [];
    map.forEach((userList, propId) => {
      const prop = allProps.find(p => p.id === propId) || {
        id: propId,
        title: userList[0]?.propertyTitle || 'Land Plot',
        price: userList[0]?.propertyPrice || 0,
        location: userList[0]?.propertyLocation || '',
        images: userList[0]?.propertyImage ? [userList[0].propertyImage] : []
      } as any;

      result.push({
        property: prop,
        count: userList.length,
        users: userList
      });
    });

    return result.sort((a, b) => b.count - a.count);
  },

  // Admin view: remove a wish entry
  removeWish: (wishId: string): void => {
    let globalWishes = getGlobalWishes();
    globalWishes = globalWishes.filter(w => w.id !== wishId);
    saveGlobalWishes(globalWishes);
  }
};
