import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { communicationUtils } from '../utils/communicationUtils';
import type { Enquiry } from '../types/communication';

export default function Enquiries() {
  const { user } = useAuth();
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadEnquiries = async () => {
      if (!user) return;
      // If Seller/Agent, load received enquiries. If Buyer, load outgoing.
      // For this unified dashboard, we load received.
      const enqs = await communicationUtils.getReceivedEnquiries(user.id);
      setEnquiries(enqs);
      setLoading(false);
    };
    loadEnquiries();
  }, [user]);

  if (loading) return <div className="container" style={{ padding: 'var(--spacing-8)', textAlign: 'center' }}>Loading...</div>;

  return (
    <div className="container" style={{ padding: 'var(--spacing-8) var(--spacing-4)' }}>
      <h1 className="h2" style={{ marginBottom: 'var(--spacing-6)' }}>Received Enquiries</h1>
      
      {enquiries.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 'var(--spacing-8)', backgroundColor: 'var(--color-surface)', borderRadius: 'var(--radius-lg)' }}>
          <p style={{ color: 'var(--color-text-muted)' }}>You haven't received any enquiries yet.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 'var(--spacing-4)' }}>
          {enquiries.map(enq => (
            <div key={enq.id} style={{ padding: 'var(--spacing-4)', backgroundColor: 'var(--color-surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-2)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 className="h4">{enq.propertyTitle}</h3>
                <span style={{ fontSize: 'var(--font-size-xs)', backgroundColor: '#fef3c7', color: '#d97706', padding: '2px 8px', borderRadius: '12px' }}>{enq.status}</span>
              </div>
              <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
                <strong>From:</strong> {enq.buyerName} ({enq.buyerPhone})
              </div>
              <div style={{ marginTop: 'var(--spacing-2)', padding: 'var(--spacing-3)', backgroundColor: 'var(--color-background)', borderRadius: 'var(--radius-md)', fontSize: 'var(--font-size-sm)' }}>
                {enq.message}
              </div>
              <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginTop: 'var(--spacing-2)' }}>
                {new Date(enq.createdAt).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
