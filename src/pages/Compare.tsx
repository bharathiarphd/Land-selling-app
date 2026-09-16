import { useState, useEffect } from 'react';
import { type Property } from '../data/mockProperties';
import { getAllProperties } from '../utils/propertyUtils';
import { PropertyCard } from '../components/PropertyCard';
import { X } from 'lucide-react';
import { Input } from '../components/Input';
import { Button } from '../components/Button';

// Store IDs in local storage for the compare list
const COMPARE_KEY = 'land_selling_app_compare_list';

export default function Compare() {
  const [compareList, setCompareList] = useState<Property[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddProperty, setShowAddProperty] = useState(false);
  const [allProps, setAllProps] = useState<Property[]>([]);

  useEffect(() => {
    const ids = JSON.parse(localStorage.getItem(COMPARE_KEY) || '[]');
    const properties = getAllProperties();
    setAllProps(properties);
    setCompareList(properties.filter(p => ids.includes(p.id)));
  }, []);

  const handleRemove = (id: string) => {
    const updated = compareList.filter(p => p.id !== id);
    setCompareList(updated);
    localStorage.setItem(COMPARE_KEY, JSON.stringify(updated.map(p => p.id)));
  };

  const handleAdd = (p: Property) => {
    if (compareList.length >= 4) {
      alert("You can compare up to 4 properties at once.");
      return;
    }
    if (compareList.find(existing => existing.id === p.id)) return;
    
    const updated = [...compareList, p];
    setCompareList(updated);
    localStorage.setItem(COMPARE_KEY, JSON.stringify(updated.map(p => p.id)));
    setShowAddProperty(false);
  };

  const formatPrice = (val: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);
  };

  const renderAddSlot = () => (
    <div style={{ minWidth: '280px', height: '100%', border: '2px dashed var(--color-border)', borderRadius: 'var(--radius-lg)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 'var(--spacing-4)', padding: 'var(--spacing-8)' }}>
      <div style={{ color: 'var(--color-text-muted)' }}>Compare up to 4 properties</div>
      <Button variant="outline" onClick={() => setShowAddProperty(true)}>+ Add Property</Button>
    </div>
  );

  return (
    <div className="container" style={{ padding: 'var(--spacing-8) var(--spacing-4)' }}>
      <h1 className="h2" style={{ marginBottom: 'var(--spacing-6)' }}>Compare Properties</h1>
      
      {showAddProperty ? (
        <div style={{ backgroundColor: 'var(--color-surface)', padding: 'var(--spacing-6)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)', marginBottom: 'var(--spacing-8)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-4)' }}>
            <h3 className="h4">Select a Property to Compare</h3>
            <button onClick={() => setShowAddProperty(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X /></button>
          </div>
          <Input 
            placeholder="Search properties by title or location..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ marginBottom: 'var(--spacing-4)' }}
          />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 'var(--spacing-4)', maxHeight: '400px', overflowY: 'auto' }}>
            {allProps.filter(p => p.title.toLowerCase().includes(searchQuery.toLowerCase()) || p.location.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 10).map(p => (
              <div key={p.id} style={{ display: 'flex', gap: 'var(--spacing-2)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: 'var(--spacing-2)' }}>
                <img src={p.images[0]} alt={p.title} style={{ width: '80px', height: '60px', objectFit: 'cover', borderRadius: 'var(--radius-sm)' }} />
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)' }} className="truncate">{p.title}</div>
                  <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>{formatPrice(p.price)}</div>
                  <button onClick={() => handleAdd(p)} style={{ alignSelf: 'flex-start', background: 'var(--color-primary-light)', color: 'var(--color-primary-dark)', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: 'var(--font-size-xs)' }}>
                    Add
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      <div style={{ overflowX: 'auto', paddingBottom: 'var(--spacing-4)' }}>
        <div style={{ display: 'flex', gap: 'var(--spacing-4)', minWidth: 'min-content' }}>
          {compareList.map(p => (
            <div key={p.id} style={{ minWidth: '280px', maxWidth: '320px', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)', position: 'relative' }}>
              <button 
                onClick={() => handleRemove(p.id)}
                style={{ position: 'absolute', top: '8px', right: '8px', background: 'rgba(0,0,0,0.5)', color: 'white', border: 'none', borderRadius: '50%', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 10 }}
              >
                <X size={16} />
              </button>
              <PropertyCard property={p} />
              
              <div style={{ backgroundColor: 'var(--color-surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
                <div style={{ padding: 'var(--spacing-3)', borderBottom: '1px solid var(--color-border)' }}>
                  <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>Price</div>
                  <div style={{ fontWeight: 'var(--font-weight-bold)' }}>{formatPrice(p.price)}</div>
                </div>
                <div style={{ padding: 'var(--spacing-3)', borderBottom: '1px solid var(--color-border)' }}>
                  <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>Area</div>
                  <div>{p.area} {p.areaUnit}</div>
                </div>
                <div style={{ padding: 'var(--spacing-3)', borderBottom: '1px solid var(--color-border)' }}>
                  <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>Type</div>
                  <div>{p.propertyType}</div>
                </div>
                <div style={{ padding: 'var(--spacing-3)', borderBottom: '1px solid var(--color-border)' }}>
                  <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>Approval</div>
                  <div>{p.approval}</div>
                </div>
                <div style={{ padding: 'var(--spacing-3)' }}>
                  <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>Facing</div>
                  <div>{p.facing}</div>
                </div>
              </div>
            </div>
          ))}
          {compareList.length < 4 && !showAddProperty && renderAddSlot()}
        </div>
      </div>
    </div>
  );
}
