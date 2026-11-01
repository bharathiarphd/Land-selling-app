import { useState, useMemo } from 'react';
import { Map as MapIcon, Search, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import { GoogleMap } from '../components/GoogleMap';
import { getAllProperties, getPropertyCoordinates } from '../utils/propertyUtils';
import { Input } from '../components/Input';
import { Button } from '../components/Button';

export default function MapSearch() {
  const [properties] = useState(getAllProperties());
  const [searchTerm, setSearchTerm] = useState('');
  const [activeProp, setActiveProp] = useState<any>(null);

  const filteredProperties = useMemo(() => {
    if (!searchTerm.trim()) return properties;
    const term = searchTerm.toLowerCase().trim();
    return properties.filter(p => 
      (p.title || '').toLowerCase().includes(term) ||
      (p.location || '').toLowerCase().includes(term) ||
      (p.city || '').toLowerCase().includes(term) ||
      (p.district || '').toLowerCase().includes(term) ||
      (p.taluk || '').toLowerCase().includes(term)
    );
  }, [properties, searchTerm]);

  // Derive initial map center from active property or first filtered result or default to Chennai/Tamil Nadu
  const mapCenter = useMemo(() => {
    if (activeProp) {
      return getPropertyCoordinates(activeProp);
    }
    if (filteredProperties.length > 0) {
      return getPropertyCoordinates(filteredProperties[0]);
    }
    return { lat: 12.9716, lng: 80.0415 };
  }, [activeProp, filteredProperties]);

  const markers = useMemo(() => {
    return filteredProperties.map(p => {
      const coords = getPropertyCoordinates(p);
      return {
        id: p.id,
        lat: coords.lat,
        lng: coords.lng,
        title: p.title,
        price: p.price,
        area: `${p.area} ${p.areaUnit}`,
        onClick: () => setActiveProp(p)
      };
    });
  }, [filteredProperties]);

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 70px)', overflow: 'hidden', position: 'relative' }}>
      
      {/* Sidebar Controls */}
      <div style={{ width: '360px', backgroundColor: 'var(--color-surface, #ffffff)', borderRight: '1px solid var(--color-border, #e2e8f0)', display: 'flex', flexDirection: 'column', zIndex: 10 }}>
        <div style={{ padding: 'var(--spacing-4, 16px)', borderBottom: '1px solid var(--color-border, #e2e8f0)' }}>
          <h2 className="h4" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px', fontSize: '1.2rem', fontWeight: 700, color: 'var(--color-text-primary, #0f172a)' }}>
            <MapIcon size={22} color="var(--color-primary, #0284c7)" /> Map Search
          </h2>
          <div style={{ position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--color-text-secondary, #64748b)' }} />
            <Input 
              placeholder="Filter by City, Area, or District..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingLeft: '38px' }} 
            />
          </div>
          
          <div style={{ marginTop: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary, #64748b)' }}>
              Showing <strong>{filteredProperties.length}</strong> {filteredProperties.length === 1 ? 'property' : 'properties'}
            </span>
            {searchTerm && (
              <button 
                type="button" 
                onClick={() => setSearchTerm('')} 
                style={{ background: 'none', border: 'none', color: 'var(--color-primary, #0284c7)', fontSize: '0.8rem', cursor: 'pointer', textDecoration: 'underline' }}
              >
                Clear filter
              </button>
            )}
          </div>
        </div>

        {/* Selected Property Preview or Instruction */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 'var(--spacing-4, 16px)' }}>
          {activeProp ? (
            <div style={{ border: '1.5px solid var(--color-primary, #0284c7)', borderRadius: 'var(--radius-lg, 12px)', overflow: 'hidden', boxShadow: '0 4px 14px rgba(2, 132, 199, 0.12)' }}>
              <div style={{ position: 'relative', height: '170px', backgroundColor: '#f1f5f9' }}>
                <img 
                  src={activeProp.images?.[0] || 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&auto=format&fit=crop&q=60'} 
                  alt={activeProp.title} 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                />
                <span style={{ position: 'absolute', top: '10px', right: '10px', backgroundColor: 'rgba(15, 23, 42, 0.75)', color: '#fff', padding: '3px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600 }}>
                  {activeProp.propertyType}
                </span>
              </div>
              <div style={{ padding: 'var(--spacing-3, 14px)', backgroundColor: 'var(--color-surface, #ffffff)' }}>
                <h3 className="h5" style={{ margin: '0 0 6px', fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>{activeProp.title}</h3>
                <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--color-primary, #0284c7)' }}>
                  ₹ {activeProp.price ? Number(activeProp.price).toLocaleString('en-IN') : 'Price on Request'}
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary, #64748b)', marginTop: '4px' }}>
                  📍 {activeProp.location || activeProp.city || activeProp.district} • {activeProp.area} {activeProp.areaUnit}
                </div>
                <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                  <Link to={`/property/${activeProp.id}`} style={{ flex: 1, textDecoration: 'none' }}>
                    <Button style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                      <Eye size={16} /> View Details
                    </Button>
                  </Link>
                  <Button variant="outline" onClick={() => setActiveProp(null)}>
                    Close
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', color: 'var(--color-text-muted, #94a3b8)', marginTop: 'var(--spacing-8, 32px)', padding: '20px' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: 'rgba(2, 132, 199, 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
                <MapIcon size={28} color="var(--color-primary, #0284c7)" />
              </div>
              <h4 style={{ margin: '0 0 6px', color: 'var(--color-text-primary, #0f172a)', fontSize: '0.95rem' }}>Interactive Map Search</h4>
              <p style={{ fontSize: '0.85rem', margin: 0, lineHeight: 1.5 }}>
                Click on any pin on the map to explore land details, pricing, and exact locations across Tamil Nadu.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Map Area */}
      <div style={{ flex: 1, height: '100%', position: 'relative' }}>
        <GoogleMap 
          center={mapCenter} 
          zoom={11} 
          markers={markers}
          onMapClick={() => setActiveProp(null)}
          style={{ width: '100%', height: '100%' }}
        />
      </div>
    </div>
  );
}
