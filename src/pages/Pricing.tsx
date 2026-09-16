import { useState, useEffect } from 'react';
import { paymentUtils } from '../utils/paymentUtils';
import type { PaymentPlan } from '../utils/paymentUtils';
import { Button } from '../components/Button';
import { Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Pricing() {
  const [plans, setPlans] = useState<PaymentPlan[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    paymentUtils.getPlans().then(setPlans);
  }, []);

  const handleSubscribe = async (plan: PaymentPlan) => {
    if (plan.price === 0) {
      alert("You are already on the Free plan!");
      return;
    }
    
    setLoading(true);
    try {
      const order = await paymentUtils.createPaymentOrder(plan.id, 'mock_user');
      const success = await paymentUtils.verifyPayment(order.orderId);
      if (success) {
        alert(`Successfully subscribed to ${plan.name} Plan!`);
        navigate('/my-properties');
      }
    } catch (e) {
      alert("Payment failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ padding: 'var(--spacing-10) var(--spacing-4)' }}>
      <div style={{ textAlign: 'center', marginBottom: 'var(--spacing-10)' }}>
        <h1 className="h1" style={{ marginBottom: 'var(--spacing-4)' }}>Seller & Agent Plans</h1>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-lg)', maxWidth: '600px', margin: '0 auto' }}>
          Choose the right plan to boost your property visibility and reach more buyers.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--spacing-6)', maxWidth: '1000px', margin: '0 auto' }}>
        {plans.map((plan) => (
          <div key={plan.id} style={{ 
            backgroundColor: 'var(--color-surface)', 
            borderRadius: 'var(--radius-lg)', 
            border: plan.name === 'Standard' ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
            padding: 'var(--spacing-8)',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column'
          }}>
            {plan.name === 'Standard' && (
              <div style={{ position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)', backgroundColor: 'var(--color-primary)', color: 'white', padding: '4px 12px', borderRadius: '16px', fontSize: 'var(--font-size-xs)', fontWeight: 'bold' }}>
                MOST POPULAR
              </div>
            )}
            <h2 className="h3" style={{ marginBottom: 'var(--spacing-2)' }}>{plan.name}</h2>
            <div style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 'var(--font-weight-bold)', marginBottom: 'var(--spacing-6)' }}>
              ₹{plan.price} <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)', fontWeight: 'normal' }}>/ month</span>
            </div>
            
            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 var(--spacing-8) 0', flex: 1 }}>
              {plan.features.map((feature, i) => (
                <li key={i} style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-3)', marginBottom: 'var(--spacing-3)', color: 'var(--color-text-secondary)' }}>
                  <Check size={18} color="var(--color-primary)" /> {feature}
                </li>
              ))}
            </ul>

            <Button 
              variant={plan.name === 'Standard' ? 'primary' : 'outline'} 
              style={{ width: '100%' }}
              onClick={() => handleSubscribe(plan)}
              disabled={loading}
            >
              {loading ? 'Processing...' : `Select ${plan.name}`}
            </Button>
          </div>
        ))}
      </div>
      
      <div style={{ textAlign: 'center', marginTop: 'var(--spacing-10)', fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>
        * Note: This is a simulated payment gateway for Phase 17 testing. No real charges are made.
      </div>
    </div>
  );
}
