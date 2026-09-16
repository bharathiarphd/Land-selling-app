import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { ShieldCheck, MapPin, Phone, Mail } from 'lucide-react';
import { type Property } from '../data/mockProperties';
import { getAllProperties } from '../utils/propertyUtils';
import { PropertyCard } from '../components/PropertyCard';
import { Button } from '../components/Button';

export default function AgentProfile() {
  const { id } = useParams<{ id: string }>();
  const [properties, setProperties] = useState<Property[]>([]);

  useEffect(() => {
    // Mock: fetch agent's properties
    const all = getAllProperties();
    // Simulate agent having 3 random properties
    setProperties(all.slice(0, 3));
  }, [id]);

  return (
    <div className="container" style={{ padding: 'var(--spacing-8) var(--spacing-4)' }}>
      {/* Agent Header */}
      <div style={{ backgroundColor: 'var(--color-surface)', borderRadius: 'var(--radius-lg)', padding: 'var(--spacing-8)', border: '1px solid var(--color-border)', marginBottom: 'var(--spacing-8)', display: 'flex', flexWrap: 'wrap', gap: 'var(--spacing-8)' }}>
        <div style={{ width: '120px', height: '120px', backgroundColor: 'var(--color-primary-light)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem', color: 'var(--color-primary-dark)', fontWeight: 'bold' }}>
          AP
        </div>
        <div style={{ flex: 1, minWidth: '300px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)', marginBottom: 'var(--spacing-2)' }}>
            <h1 className="h2">Agent Profile</h1>
            <span title="Verified Premium Agent"><ShieldCheck color="var(--color-success)" size={24} /></span>
          </div>
          <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--spacing-4)' }}>Premium Real Estate Agent specializing in Commercial and Farm Lands.</p>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-2)', color: 'var(--color-text-secondary)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)' }}><MapPin size={16} /> Serving: Chennai, Kanchipuram, Chengalpattu</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)' }}><Phone size={16} /> +91 98765 43210</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)' }}><Mail size={16} /> agent@example.com</div>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-2)', minWidth: '200px' }}>
          <Button style={{ width: '100%' }}>Contact Agent</Button>
          <Button variant="outline" style={{ width: '100%' }}>WhatsApp</Button>
        </div>
      </div>

      {/* Agent Properties */}
      <h2 className="h3" style={{ marginBottom: 'var(--spacing-6)' }}>Active Listings ({properties.length})</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 'var(--spacing-6)' }}>
        {properties.map(p => (
          <PropertyCard key={p.id} property={p} />
        ))}
      </div>
    </div>
  );
}
