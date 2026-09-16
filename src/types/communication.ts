export type EnquiryStatus = 'New' | 'Contacted' | 'Interested' | 'Follow-up' | 'Closed' | 'Not Interested';

export interface Enquiry {
  id: string;
  propertyId: string;
  propertyTitle: string;
  buyerId: string;
  buyerName: string;
  buyerPhone: string;
  buyerEmail?: string;
  sellerId: string;
  message: string;
  status: EnquiryStatus;
  createdAt: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  text: string;
  timestamp: string;
  read: boolean;
}

export interface Conversation {
  id: string;
  propertyId: string;
  propertyTitle: string;
  participantIds: string[];
  lastMessage?: Message;
  unreadCount: number;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  body: string;
  type: 'ENQUIRY' | 'MESSAGE' | 'SYSTEM' | 'APPROVAL';
  read: boolean;
  createdAt: string;
  link?: string;
}
