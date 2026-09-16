import type { Enquiry, Conversation, Message, Notification, EnquiryStatus } from '../types/communication';

// Mock storage keys
const ENQUIRIES_KEY = 'land_selling_app_enquiries';
const CONVERSATIONS_KEY = 'land_selling_app_conversations';
const MESSAGES_KEY = 'land_selling_app_messages';
const NOTIFICATIONS_KEY = 'land_selling_app_notifications';

// Helper to get from local storage
const getFromStorage = <T>(key: string): T[] => {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : [];
};

const saveToStorage = <T>(key: string, data: T[]) => {
  localStorage.setItem(key, JSON.stringify(data));
};

export const communicationUtils = {
  // Enquiries
  createEnquiry: async (enquiry: Omit<Enquiry, 'id' | 'createdAt' | 'status'>): Promise<Enquiry> => {
    const newEnquiry: Enquiry = {
      ...enquiry,
      id: `enq_${Date.now()}`,
      status: 'New',
      createdAt: new Date().toISOString(),
    };
    const enquiries = getFromStorage<Enquiry>(ENQUIRIES_KEY);
    saveToStorage(ENQUIRIES_KEY, [...enquiries, newEnquiry]);
    
    // Create a notification for the seller
    await communicationUtils.createNotification({
      userId: enquiry.sellerId,
      title: 'New Enquiry Received',
      body: `${enquiry.buyerName} has enquired about ${enquiry.propertyTitle}`,
      type: 'ENQUIRY',
      link: '/enquiries'
    });

    return newEnquiry;
  },

  getMyEnquiries: async (buyerId: string): Promise<Enquiry[]> => {
    const enquiries = getFromStorage<Enquiry>(ENQUIRIES_KEY);
    return enquiries.filter(e => e.buyerId === buyerId);
  },

  getReceivedEnquiries: async (sellerId: string): Promise<Enquiry[]> => {
    const enquiries = getFromStorage<Enquiry>(ENQUIRIES_KEY);
    return enquiries.filter(e => e.sellerId === sellerId);
  },

  updateEnquiryStatus: async (enquiryId: string, status: EnquiryStatus): Promise<void> => {
    const enquiries = getFromStorage<Enquiry>(ENQUIRIES_KEY);
    const updated = enquiries.map(e => e.id === enquiryId ? { ...e, status } : e);
    saveToStorage(ENQUIRIES_KEY, updated);
  },

  // Conversations & Messages
  getConversations: async (userId: string): Promise<Conversation[]> => {
    const convos = getFromStorage<Conversation>(CONVERSATIONS_KEY);
    return convos.filter(c => c.participantIds.includes(userId));
  },

  getMessages: async (conversationId: string): Promise<Message[]> => {
    const messages = getFromStorage<Message>(MESSAGES_KEY);
    return messages.filter(m => m.conversationId === conversationId);
  },

  sendMessage: async (conversationId: string, senderId: string, text: string): Promise<Message> => {
    const message: Message = {
      id: `msg_${Date.now()}`,
      conversationId,
      senderId,
      text,
      timestamp: new Date().toISOString(),
      read: false
    };
    
    const messages = getFromStorage<Message>(MESSAGES_KEY);
    saveToStorage(MESSAGES_KEY, [...messages, message]);

    // Update conversation lastMessage
    const convos = getFromStorage<Conversation>(CONVERSATIONS_KEY);
    const updatedConvos = convos.map(c => {
      if (c.id === conversationId) {
        return { ...c, lastMessage: message, unreadCount: c.unreadCount + 1 };
      }
      return c;
    });
    saveToStorage(CONVERSATIONS_KEY, updatedConvos);

    return message;
  },

  // Notifications
  getNotifications: async (userId: string): Promise<Notification[]> => {
    const notifs = getFromStorage<Notification>(NOTIFICATIONS_KEY);
    return notifs.filter(n => n.userId === userId).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  createNotification: async (notif: Omit<Notification, 'id' | 'createdAt' | 'read'>): Promise<Notification> => {
    const newNotif: Notification = {
      ...notif,
      id: `notif_${Date.now()}`,
      createdAt: new Date().toISOString(),
      read: false
    };
    const notifs = getFromStorage<Notification>(NOTIFICATIONS_KEY);
    saveToStorage(NOTIFICATIONS_KEY, [...notifs, newNotif]);
    return newNotif;
  },

  markNotificationRead: async (notificationId: string): Promise<void> => {
    const notifs = getFromStorage<Notification>(NOTIFICATIONS_KEY);
    const updated = notifs.map(n => n.id === notificationId ? { ...n, read: true } : n);
    saveToStorage(NOTIFICATIONS_KEY, updated);
  }
};
