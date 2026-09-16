import { useState } from 'react';
import { TrendingUp, Search } from 'lucide-react';
import { Input } from '../components/Input';
import { Button } from '../components/Button';

export default function PriceGuide() {
  const [district, setDistrict] = useState('Chennai');
  const [taluk, setTaluk] = useState('Sholinganallur');

  // Mock Price Data
  const mockData = {
    avgSqFt: 3500,
    minSqFt: 2800,
    maxSqFt: 5200,
    avgCent: 1524600, // 3500 * 435.6
    trend: '+12%',
    govtGuidelineSqFt: 2200
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: 'var(--spacing-4)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-3)', marginBottom: 'var(--spacing-6)' }}>
        <div style={{ backgroundColor: 'var(--color-primary-light)', padding: 'var(--spacing-3)', borderRadius: '50%' }}>
          <TrendingUp color="var(--color-primary-dark)" />
        </div>
        <div>
          <h1 className="h2">Land Price Intelligence</h1>
          <p style={{ color: 'var(--color-text-secondary)' }}>Discover average listing prices and trends in your area.</p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 'var(--spacing-4)', marginBottom: 'var(--spacing-6)', backgroundColor: 'var(--color-surface)', padding: 'var(--spacing-4)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
        <div style={{ flex: 1 }}>
          <label style={{ display: 'block', fontSize: 'var(--font-size-sm)', fontWeight: 'bold', marginBottom: 'var(--spacing-2)' }}>District</label>
          <select value={district} onChange={e => setDistrict(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', fontSize: 'var(--font-size-md)' }}>
            <option value="Chennai">Chennai</option>
            <option value="Kanchipuram">Kanchipuram</option>
            <option value="Coimbatore">Coimbatore</option>
          </select>
        </div>
        <div style={{ flex: 1 }}>
          <label style={{ display: 'block', fontSize: 'var(--font-size-sm)', fontWeight: 'bold', marginBottom: 'var(--spacing-2)' }}>Taluk/Area</label>
          <Input value={taluk} onChange={e => setTaluk(e.target.value)} placeholder="e.g. Sholinganallur" />
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end' }}>
          <Button><Search size={18} /> Analyze</Button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 'var(--spacing-4)', marginBottom: 'var(--spacing-8)' }}>
        
        <div style={{ backgroundColor: 'var(--color-surface)', padding: 'var(--spacing-6)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
          <div style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)', marginBottom: 'var(--spacing-2)' }}>Platform Listing Average</div>
          <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--color-primary-dark)' }}>₹ {mockData.avgSqFt.toLocaleString()}</div>
          <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>per sq.ft</div>
        </div>

        <div style={{ backgroundColor: 'var(--color-surface)', padding: 'var(--spacing-6)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
          <div style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)', marginBottom: 'var(--spacing-2)' }}>Estimated per Cent</div>
          <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--color-text)' }}>₹ {(mockData.avgCent/100000).toFixed(2)} L</div>
          <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>per cent (435.6 sq.ft)</div>
        </div>

        <div style={{ backgroundColor: '#f0fdf4', padding: 'var(--spacing-6)', borderRadius: 'var(--radius-lg)', border: '1px solid #bbf7d0' }}>
          <div style={{ color: '#166534', fontSize: 'var(--font-size-sm)', marginBottom: 'var(--spacing-2)' }}>1 Year Trend</div>
          <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#166534' }}>{mockData.trend}</div>
          <div style={{ fontSize: 'var(--font-size-sm)', color: '#166534' }}>Price Appreciation</div>
        </div>

      </div>

      <div style={{ backgroundColor: 'var(--color-surface)', padding: 'var(--spacing-6)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
        <h3 className="h4" style={{ marginBottom: 'var(--spacing-4)' }}>Value Comparison</h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 'var(--spacing-3)', borderBottom: '1px solid var(--color-border)' }}>
            <div>
              <div style={{ fontWeight: 'bold' }}>Official Government Guideline Value</div>
              <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>Approximate base value for registration</div>
            </div>
            <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>₹ {mockData.govtGuidelineSqFt.toLocaleString()} <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'normal' }}>/ sq.ft</span></div>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 'var(--spacing-3)', borderBottom: '1px solid var(--color-border)' }}>
            <div>
              <div style={{ fontWeight: 'bold' }}>Minimum Asking Price</div>
              <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>Lowest recorded on platform</div>
            </div>
            <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>₹ {mockData.minSqFt.toLocaleString()} <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'normal' }}>/ sq.ft</span></div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 'var(--spacing-3)' }}>
            <div>
              <div style={{ fontWeight: 'bold' }}>Maximum Asking Price</div>
              <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>Highest recorded on platform</div>
            </div>
            <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>₹ {mockData.maxSqFt.toLocaleString()} <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'normal' }}>/ sq.ft</span></div>
          </div>
        </div>
      </div>
      
      <div style={{ marginTop: 'var(--spacing-6)', fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', textAlign: 'center' }}>
        * Prices shown are based on platform listings and may not reflect actual final transaction prices. Government guideline values are subject to official revision.
      </div>

    </div>
  );
}
