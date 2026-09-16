import { useState } from 'react';
import { Target, Phone } from 'lucide-react';
import { Input } from '../components/Input';
import { Button } from '../components/Button';

// Mock Requirements Data
const mockRequirements = [
  { id: 'req-1', buyer: 'Suresh Kumar', type: 'Agricultural Land', district: 'Villupuram', area: '3-5 Acres', budget: '₹60 L', posted: '2 days ago', match: 92, details: 'Looking for red soil land with active borewell connection near Gingee highway.' },
  { id: 'req-2', buyer: 'Ramesh', type: 'Plot', district: 'Chennai (OMR)', area: '1200-1500 Sq.Ft', budget: '₹55 L', posted: '4 hours ago', match: 85, details: 'DTCP approved strictly. North or East facing preferred.' },
  { id: 'req-3', buyer: 'Murali', type: 'Farm Land', district: 'Kanchipuram', area: '1 Acre', budget: '₹25 L', posted: '1 week ago', match: 45, details: 'Looking for mango or coconut grove.' },
];

export default function BuyerRequirements() {
  const [search, setSearch] = useState('');

  const filtered = mockRequirements.filter(r => r.district.toLowerCase().includes(search.toLowerCase()) || r.type.toLowerCase().includes(search.toLowerCase()));

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: 'var(--spacing-4)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 'var(--spacing-6)' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-3)', marginBottom: 'var(--spacing-2)' }}>
            <div style={{ backgroundColor: '#e0e7ff', padding: 'var(--spacing-2)', borderRadius: '50%' }}>
              <Target color="#4338ca" />
            </div>
            <h1 className="h2">Buyer Requirements</h1>
          </div>
          <p style={{ color: 'var(--color-text-secondary)' }}>Find buyers actively looking for land. Match score is based on your current active listings.</p>
        </div>
        <div style={{ width: '300px' }}>
          <Input 
            placeholder="Search district or property type..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div style={{ display: 'grid', gap: 'var(--spacing-4)' }}>
        {filtered.map(req => (
          <div key={req.id} style={{ backgroundColor: 'var(--color-surface)', padding: 'var(--spacing-6)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)', display: 'flex', gap: 'var(--spacing-6)' }}>
            
            {/* Match Score Indicator */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minWidth: '100px', borderRight: '1px solid var(--color-border)', paddingRight: 'var(--spacing-6)' }}>
              <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 'bold', color: req.match > 80 ? 'var(--color-success)' : req.match > 50 ? 'var(--color-warning)' : 'var(--color-text-muted)' }}>
                {req.match}%
              </div>
              <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Match</div>
            </div>

            {/* Requirement Details */}
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--spacing-3)' }}>
                <h3 className="h4">{req.type} in {req.district}</h3>
                <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>Posted {req.posted}</span>
              </div>
              
              <div style={{ display: 'flex', gap: 'var(--spacing-6)', marginBottom: 'var(--spacing-4)', fontSize: 'var(--font-size-sm)' }}>
                <div><strong>Area:</strong> {req.area}</div>
                <div><strong>Budget:</strong> <span style={{ color: 'var(--color-success)', fontWeight: 'bold' }}>{req.budget}</span></div>
                <div><strong>Buyer:</strong> {req.buyer}</div>
              </div>

              <div style={{ backgroundColor: 'var(--color-background)', padding: 'var(--spacing-3)', borderRadius: 'var(--radius-md)', fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', marginBottom: 'var(--spacing-4)' }}>
                "{req.details}"
              </div>

              <div style={{ display: 'flex', gap: 'var(--spacing-3)' }}>
                <Button><Phone size={16} /> Contact Buyer</Button>
                {req.match > 80 && (
                  <Button variant="outline">Suggest Matching Property</Button>
                )}
              </div>
            </div>

          </div>
        ))}

        {filtered.length === 0 && (
          <div style={{ padding: 'var(--spacing-8)', textAlign: 'center', color: 'var(--color-text-muted)', backgroundColor: 'var(--color-surface)', borderRadius: 'var(--radius-lg)' }}>
            No buyer requirements found matching your search.
          </div>
        )}
      </div>
    </div>
  );
}
