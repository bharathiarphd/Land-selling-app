import { useState, useEffect } from 'react';
import { Calendar, MapPin, Clock, User, Check, X, Phone, CalendarX } from 'lucide-react';
import { Button } from '../components/Button';
import { Link } from 'react-router-dom';

type VisitStatus = 'Requested' | 'Accepted' | 'Completed' | 'Cancelled';

interface SiteVisit {
  id: string;
  property: string;
  buyer: string;
  date: string;
  time: string;
  status: VisitStatus;
  phone: string;
}

const STORAGE_KEY = 'land_selling_app_site_visits';

export default function SiteVisits() {
  const [visits, setVisits] = useState<SiteVisit[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(visits));
    } catch (_) {}
  }, [visits]);

  const updateStatus = (id: string, status: VisitStatus) => {
    setVisits(prev => prev.map(v => v.id === id ? { ...v, status } : v));
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

      {visits.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 'var(--spacing-12) var(--spacing-6)', backgroundColor: 'var(--color-surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: 'var(--color-bg-secondary)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 'var(--spacing-4)' }}>
            <CalendarX size={32} color="var(--color-text-muted)" />
          </div>
          <h3 className="h3" style={{ marginBottom: 'var(--spacing-2)' }}>No Site Visits Scheduled</h3>
          <p style={{ color: 'var(--color-text-secondary)', maxWidth: '400px', margin: '0 auto var(--spacing-6) auto' }}>
            When buyers schedule physical or virtual site visits for your properties, they will appear here.
          </p>
          <Link to="/search">
            <Button>Explore Properties</Button>
          </Link>
        </div>
      ) : (
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
      )}
    </div>
  );
}
