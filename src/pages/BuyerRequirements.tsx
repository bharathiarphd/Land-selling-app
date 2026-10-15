import { useState } from 'react';
import { Target, Phone, ClipboardList } from 'lucide-react';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { Link } from 'react-router-dom';

interface BuyerRequirement {
  id: string;
  buyer: string;
  phone?: string;
  type: string;
  district: string;
  area: string;
  budget: string;
  posted: string;
  match: number;
  details: string;
}

const STORAGE_KEY = 'land_buyer_requirements';

export default function BuyerRequirements() {
  const [search, setSearch] = useState('');
  const [requirements] = useState<BuyerRequirement[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const filtered = requirements.filter(r => 
    r.district.toLowerCase().includes(search.toLowerCase()) || 
    r.type.toLowerCase().includes(search.toLowerCase()) ||
    (r.details || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: 'var(--spacing-4)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 'var(--spacing-6)', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-3)', marginBottom: 'var(--spacing-2)' }}>
            <div style={{ backgroundColor: '#e0e7ff', padding: 'var(--spacing-2)', borderRadius: '50%' }}>
              <Target color="#4338ca" />
            </div>
            <h1 className="h2">Buyer Requirements</h1>
          </div>
          <p style={{ color: 'var(--color-text-secondary)' }}>Find buyers actively looking for land across Tamil Nadu.</p>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <div style={{ width: '260px' }}>
            <Input 
              placeholder="Search district or property type..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Link to="/post-requirement">
            <Button>Post Requirement</Button>
          </Link>
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
              
              <div style={{ display: 'flex', gap: 'var(--spacing-6)', marginBottom: 'var(--spacing-4)', fontSize: 'var(--font-size-sm)', flexWrap: 'wrap' }}>
                <div><strong>Area:</strong> {req.area}</div>
                <div><strong>Budget:</strong> <span style={{ color: 'var(--color-success)', fontWeight: 'bold' }}>{req.budget}</span></div>
                <div><strong>Buyer:</strong> {req.buyer}</div>
              </div>

              {req.details && (
                <div style={{ backgroundColor: 'var(--color-background)', padding: 'var(--spacing-3)', borderRadius: 'var(--radius-md)', fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', marginBottom: 'var(--spacing-4)' }}>
                  "{req.details}"
                </div>
              )}

              <div style={{ display: 'flex', gap: 'var(--spacing-3)' }}>
                {req.phone && (
                  <a href={`tel:${req.phone}`} style={{ textDecoration: 'none' }}>
                    <Button><Phone size={16} /> Contact Buyer ({req.phone})</Button>
                  </a>
                )}
                <Link to="/search" style={{ textDecoration: 'none' }}>
                  <Button variant="outline">Browse Matching Properties</Button>
                </Link>
              </div>
            </div>

          </div>
        ))}

        {filtered.length === 0 && (
          <div style={{ padding: 'var(--spacing-12) var(--spacing-6)', textAlign: 'center', backgroundColor: 'var(--color-surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: 'var(--color-bg-secondary)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 'var(--spacing-4)' }}>
              <ClipboardList size={32} color="var(--color-text-muted)" />
            </div>
            <h3 className="h3" style={{ marginBottom: 'var(--spacing-2)' }}>No Buyer Requirements Yet</h3>
            <p style={{ color: 'var(--color-text-secondary)', maxWidth: '400px', margin: '0 auto var(--spacing-6) auto' }}>
              {search ? 'No requirements match your search filter.' : 'Post your land requirement to let sellers and agents reach out to you directly with matching lands.'}
            </p>
            <Link to="/post-requirement">
              <Button>Post a Requirement</Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
