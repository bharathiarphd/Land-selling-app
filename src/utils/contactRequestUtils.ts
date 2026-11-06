import { communicationUtils } from './communicationUtils';
import { BACKEND_URL } from '../config/api';

export type ContactRequestStatus = 'Pending' | 'Approved' | 'Rejected';

export interface PropertyContactRequest {
  id: string;
  propertyId: string;
  propertyTitle: string;
  propertyPrice: number;
  propertyLocation: string;
  propertyImage?: string;
  
  // Buyer Details
  buyerId: string;
  buyerName: string;
  buyerPhone: string;
  buyerEmail?: string;
  buyerUserId?: string;
  message?: string;
  
  // Owner Details
  sellerId: string;
  sellerName: string;
  sellerPhone: string;
  sellerType: string;
  
  // Approval Details
  status: ContactRequestStatus;
  adminNotes?: string;
  createdAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
}

const STORAGE_KEY = 'land_selling_app_contact_requests';

const INITIAL_DEMO_REQUESTS: PropertyContactRequest[] = [];

const getStoredRequests = (): PropertyContactRequest[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      const realOnly = parsed.filter(r => !r.id.startsWith('req_demo_'));
      if (realOnly.length !== parsed.length) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(realOnly));
      }
      return realOnly;
    }
    return [];
  } catch {
    return [];
  }
};

const saveRequests = (requests: PropertyContactRequest[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(requests));
  } catch (err) {
    console.warn('Failed to save contact requests to localStorage:', err);
  }
};

export const contactRequestUtils = {
  // Get all requests (for Admin)
  getAllRequests: async (): Promise<PropertyContactRequest[]> => {
    // Try backend first if available
    try {
      const res = await fetch(`${BACKEND_URL}/api/contact-requests`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          saveRequests(data);
          return data;
        }
      }
    } catch (_) {
      // offline fallback
    }
    return getStoredRequests();
  },

  // Get requests created by a specific buyer
  getBuyerRequests: (buyerId: string): PropertyContactRequest[] => {
    const all = getStoredRequests();
    return all.filter(r => r.buyerId === buyerId);
  },

  // Check if a specific buyer has requested contact for a property
  getRequestForProperty: (buyerId: string, propertyId: string): PropertyContactRequest | undefined => {
    if (!buyerId || !propertyId) return undefined;
    const all = getStoredRequests();
    return all.find(r => r.buyerId === buyerId && r.propertyId === propertyId);
  },

  // Buyer submits request to Admin to get owner contact
  createRequest: async (
    data: Omit<PropertyContactRequest, 'id' | 'createdAt' | 'status'>
  ): Promise<PropertyContactRequest> => {
    const newRequest: PropertyContactRequest = {
      ...data,
      id: `req_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      status: 'Pending',
      createdAt: new Date().toISOString()
    };

    const current = getStoredRequests();
    // Prevent duplicate pending requests for the same property by the same buyer
    const existingIndex = current.findIndex(
      r => r.buyerId === data.buyerId && r.propertyId === data.propertyId
    );

    let updatedList: PropertyContactRequest[];
    if (existingIndex >= 0) {
      updatedList = [...current];
      updatedList[existingIndex] = newRequest;
    } else {
      updatedList = [newRequest, ...current];
    }

    saveRequests(updatedList);

    // Notify Buyer that their request has been received by Admin
    await communicationUtils.createNotification({
      userId: data.buyerId,
      title: 'Contact Request Submitted to Admin',
      body: `Your request to purchase and contact the owner of "${data.propertyTitle}" is under Admin review. You will be notified once approved.`,
      type: 'APPROVAL',
      link: `/property/${data.propertyId}`
    });

    // Sync to backend if accessible
    try {
      fetch(`${BACKEND_URL}/api/contact-requests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRequest)
      }).catch(() => {});
    } catch (_) {}

    return newRequest;
  },

  // Admin approves or rejects the request
  updateStatus: async (
    requestId: string,
    status: ContactRequestStatus,
    adminNotes?: string,
    reviewerId: string = 'Super Admin'
  ): Promise<PropertyContactRequest | null> => {
    const all = getStoredRequests();
    const req = all.find(r => r.id === requestId);
    if (!req) return null;

    req.status = status;
    req.reviewedAt = new Date().toISOString();
    req.reviewedBy = reviewerId;
    if (adminNotes !== undefined) req.adminNotes = adminNotes;

    saveRequests(all);

    // If APPROVED, create high-priority notification for the buyer with owner's details
    if (status === 'Approved') {
      await communicationUtils.createNotification({
        userId: req.buyerId,
        title: '🎉 Owner Contact Details Approved!',
        body: `Admin approved your request for "${req.propertyTitle}"! Owner ${req.sellerName}'s Contact: +91 ${req.sellerPhone}. You can now call or WhatsApp directly.`,
        type: 'APPROVAL',
        link: `/property/${req.propertyId}`
      });
    } else if (status === 'Rejected') {
      await communicationUtils.createNotification({
        userId: req.buyerId,
        title: 'Contact Request Declined',
        body: `Your request for "${req.propertyTitle}" was declined by Admin. ${adminNotes ? 'Reason: ' + adminNotes : 'Please contact support for more details.'}`,
        type: 'APPROVAL',
        link: `/property/${req.propertyId}`
      });
    }

    // Sync status with backend
    try {
      fetch(`${BACKEND_URL}/api/contact-requests/${requestId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, adminNotes, reviewedBy: reviewerId })
      }).catch(() => {});
    } catch (_) {}

    return req;
  },

  // Mask a phone number for unapproved public view
  maskPhoneNumber: (phone: string): string => {
    if (!phone) return '+91 ••••• •••••';
    const clean = phone.replace(/\D/g, '');
    if (clean.length < 4) return '+91 ••••• •••••';
    const start = clean.slice(0, 2);
    const end = clean.slice(-2);
    return `+91 ${start}••• •••${end}`;
  }
};
