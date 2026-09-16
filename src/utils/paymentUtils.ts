export interface PaymentPlan {
  id: string;
  name: string;
  price: number;
  features: string[];
  activeListings: number;
  featuredListings: number;
}

export const PLANS: PaymentPlan[] = [
  { id: 'free', name: 'Free', price: 0, activeListings: 2, featuredListings: 0, features: ['2 Active Listings', 'Basic Visibility', 'Standard Support'] },
  { id: 'standard', name: 'Standard', price: 999, activeListings: 10, featuredListings: 2, features: ['10 Active Listings', '2 Featured Listings', 'Priority Support', 'Analytics Dashboard'] },
  { id: 'premium', name: 'Premium', price: 2999, activeListings: 50, featuredListings: 10, features: ['50 Active Listings', '10 Featured Listings', 'Agent Profile Page', 'Premium Badge', '24/7 Support'] }
];

export const paymentUtils = {
  getPlans: async (): Promise<PaymentPlan[]> => {
    return PLANS;
  },

  createPaymentOrder: async (planId: string, userId: string): Promise<{ orderId: string, amount: number }> => {
    console.log(`[MOCK] Creating payment order for user ${userId}, plan ${planId}`);
    const plan = PLANS.find(p => p.id === planId);
    if (!plan) throw new Error('Invalid plan');
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      orderId: `order_${Date.now()}`,
      amount: plan.price
    };
  },

  verifyPayment: async (orderId: string): Promise<boolean> => {
    console.log(`[MOCK] Verifying payment for order ${orderId}`);
    await new Promise(resolve => setTimeout(resolve, 1000));
    return true; // Mock success
  }
};
