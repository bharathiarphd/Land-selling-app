import { useState } from 'react';
import { Map as MapIcon, Search, Filter } from 'lucide-react';
import { GoogleMap } from '../components/GoogleMap';
import { getAllProperties } from '../utils/propertyUtils';
import { Input } from '../components/Input';
import { Button } from '../components/Button';

export default function MapSearch() {
  const [properties] = useState(getAllProperties());
  const [radius, setRadius] = useState('5');
  const [activeProp, setActiveProp] = useState<any>(null);

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 70px)', overflow: 'hidden' }}>
      
      {/* Sidebar Controls */}
      <div style={{ width: '350px', backgroundColor: 'var(--color-surface)', borderRight: '1px solid var(--color-border)', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: 'var(--spacing-4)', borderBottom: '1px solid var(--color-border)' }}>
          <h2 className="h4" style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)', marginBottom: 'var(--spacing-4)' }}>
            <MapIcon size={20} /> Map Search
          </h2>
          <div style={{ position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '10px', top: '10px', color: 'var(--color-text-secondary)' }} />
            <Input placeholder="Search Location (e.g. OMR, Chennai)" style={{ paddingLeft: '36px' }} />
          </div>
          
          <div style={{ marginTop: 'var(--spacing-4)' }}>
            <label style={{ display: 'block', fontSize: 'var(--font-size-sm)', fontWeight: 'bold', marginBottom: 'var(--spacing-2)' }}>Search Radius: {radius} km</label>
            <input 
              type="range" 
              min="1" max="50" 
              value={radius} 
              onChange={(e) => setRadius(e.target.value)}
              style={{ width: '100%' }}
            />
          </div>

          <Button variant="outline" style={{ width: '100%', marginTop: 'var(--spacing-4)' }}><Filter size={16} /> Advanced Filters</Button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: 'var(--spacing-4)' }}>
          {activeProp ? (
            <div style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
              <img src={activeProp.images[0]} alt={activeProp.title} style={{ width: '100%', height: '150px', objectFit: 'cover' }} />
              <div style={{ padding: 'var(--spacing-3)' }}>
                <h3 className="h5" style={{ marginBottom: 'var(--spacing-2)' }}>{activeProp.title}</h3>
                <div style={{ fontSize: 'var(--font-size-lg)', fontWeight: 'bold', color: 'var(--color-primary)' }}>₹ {activeProp.price.toLocaleString('en-IN')}</div>
                <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', marginTop: 'var(--spacing-1)' }}>{activeProp.area} {activeProp.areaUnit}</div>
                <Button style={{ width: '100%', marginTop: 'var(--spacing-4)' }} onClick={() => window.location.href=`/property/${activeProp.id}`}>View Details</Button>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', color: 'var(--color-text-muted)', marginTop: 'var(--spacing-8)' }}>
              Select a marker on the map to view property details.
            </div>
          )}
        </div>
      </div>

      {/* Map Area */}
      <div style={{ flex: 1, position: 'relative' }}>
        {/* We use standard Chennai center for mock */}
        <GoogleMap 
          center={{ lat: 12.9716, lng: 80.0415 }} 
          zoom={12} 
          markers={properties.map(p => ({
            id: p.id,
            lat: p.latitude || 12.9716,
            lng: p.longitude || 80.0415,
            title: p.title
          }))}
          onMapClick={() => setActiveProp(null)}
          // Since the GoogleMap component in Phase 5 doesn't expose marker clicks directly in this mock architecture,
          // we are adding a visual placeholder to demonstrate the Map Search feature.
        />
        
        {/* Draw Polygon Tool UI Mock */}
        <div style={{ position: 'absolute', top: '20px', left: '20px', zIndex: 10 }}>
          <Button variant="outline" style={{ backgroundColor: '#fff' }} onClick={() => alert('Drawing tool requires premium geospatial backend implementation.')}>
            Draw Custom Area
          </Button>
        </div>
      </div>
    </div>
  );
}
