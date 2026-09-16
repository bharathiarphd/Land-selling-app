import { useState } from 'react';
import { Calendar, MapPin, Clock, User, Check, X, Phone } from 'lucide-react';
import { Button } from '../components/Button';

type VisitStatus = 'Requested' | 'Accepted' | 'Completed' | 'Cancelled';

const mockVisits = [
  { id: 'v1', property: '5 Acres Agricultural Land in Pollachi', buyer: 'Ramesh', date: '2026-09-20', time: '10:00 AM', status: 'Requested' as VisitStatus, phone: '9876543210' },
  { id: 'v2', property: 'Commercial Land in Tindivanam', buyer: 'Suresh', date: '2026-09-18', time: '02:30 PM', status: 'Accepted' as VisitStatus, phone: '9988776655' },
  { id: 'v3', property: 'DTCP Approved Plot in OMR', buyer: 'Karthik', date: '2026-09-10', time: '11:00 AM', status: 'Completed' as VisitStatus, phone: '9123456789' }
];

export default function SiteVisits() {
  const [visits, setVisits] = useState(mockVisits);

  const updateStatus = (id: string, status: VisitStatus) => {
    setVisits(visits.map(v => v.id === id ? { ...v, status } : v));
  };

  const getStatusBadge = (status: VisitStatus) => {
    switch (status) {
      case 'Requested': return <span style={{ backgroundColor: '#fef3c7', color: '#92400e', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}>Requested</span>;
      case 'Accepted': return <span style={{ backgroundColor: '#dbeafe', color: '#1e40af', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}>Upcoming (Accepted)</span>;
      case 'Completed': return <span style={{ backgroundColor: '#dcfce7', color: '#166534', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}>Completed</span>;
      case 'Cancelled': return <span style={{ backgroundColor: '#fee2e2', color: '#991b1b', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}>Cancelled</span>;
    }
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: 'var(--spacing-4)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-3)', marginBottom: 'var(--spacing-6)' }}>
        <div style={{ backgroundColor: 'var(--color-primary-light)', padding: 'var(--spacing-3)', borderRadius: '50%' }}>
          <Calendar color="var(--color-primary-dark)" />
        </div>
        <div>
          <h1 className="h2">Site Visits Manager</h1>
          <p style={{ color: 'var(--color-text-secondary)' }}>Track and manage property inspection appointments.</p>
        </div>
      </div>

      <div style={{ display: 'grid', gap: 'var(--spacing-4)' }}>
        {visits.map(visit => (
          <div key={visit.id} style={{ backgroundColor: 'var(--color-surface)', padding: 'var(--spacing-6)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--spacing-4)' }}>
              <div>
                <h3 className="h4" style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)' }}><MapPin size={18} color="var(--color-text-secondary)" /> {visit.property}</h3>
                <div style={{ display: 'flex', gap: 'var(--spacing-4)', marginTop: 'var(--spacing-2)', color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Calendar size={14} /> {visit.date}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={14} /> {visit.time}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><User size={14} /> {visit.buyer}</span>
                </div>
              </div>
              <div>{getStatusBadge(visit.status)}</div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 'var(--spacing-4)', borderTop: '1px solid var(--color-border)' }}>
              <Button variant="outline"><Phone size={16} /> {visit.phone}</Button>
              
              <div style={{ display: 'flex', gap: 'var(--spacing-3)' }}>
                {visit.status === 'Requested' && (
                  <>
                    <button onClick={() => updateStatus(visit.id, 'Cancelled')} style={{ padding: '8px 16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-error)', color: 'var(--color-error)', backgroundColor: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <X size={16} /> Decline
                    </button>
                    <button onClick={() => updateStatus(visit.id, 'Accepted')} style={{ padding: '8px 16px', borderRadius: 'var(--radius-md)', border: 'none', color: '#fff', backgroundColor: 'var(--color-primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Check size={16} /> Accept Visit
                    </button>
                  </>
                )}
                {visit.status === 'Accepted' && (
                  <button onClick={() => updateStatus(visit.id, 'Completed')} style={{ padding: '8px 16px', borderRadius: 'var(--radius-md)', border: 'none', color: '#166534', backgroundColor: '#dcfce7', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 'bold' }}>
                    <Check size={16} /> Mark Completed
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
