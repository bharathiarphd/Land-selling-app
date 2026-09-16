import { useState } from 'react';
import { Calculator } from 'lucide-react';
import { Input } from '../components/Input';

export default function LandCalculator() {
  const [area, setArea] = useState<string>('');
  const [fromUnit, setFromUnit] = useState<'Sq.Ft' | 'Sq.M' | 'Cent' | 'Acre' | 'Ground'>('Cent');
  const [price, setPrice] = useState<string>('');

  const CONVERSIONS = {
    'Sq.Ft': 1,
    'Sq.M': 10.7639,
    'Cent': 435.6,
    'Acre': 43560,
    'Ground': 2400
  };

  const calculateConversions = () => {
    const numericArea = parseFloat(area) || 0;
    const baseSqFt = numericArea * CONVERSIONS[fromUnit];

    return {
      'Sq.Ft': baseSqFt,
      'Sq.M': baseSqFt / CONVERSIONS['Sq.M'],
      'Cent': baseSqFt / CONVERSIONS['Cent'],
      'Acre': baseSqFt / CONVERSIONS['Acre'],
      'Ground': baseSqFt / CONVERSIONS['Ground'],
    };
  };

  const conversions = calculateConversions();
  const numericPrice = parseFloat(price) || 0;
  const pricePerSqFt = numericPrice && conversions['Sq.Ft'] ? numericPrice / conversions['Sq.Ft'] : 0;

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: 'var(--spacing-4)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-3)', marginBottom: 'var(--spacing-6)' }}>
        <div style={{ backgroundColor: 'var(--color-primary-light)', padding: 'var(--spacing-3)', borderRadius: '50%' }}>
          <Calculator color="var(--color-primary-dark)" />
        </div>
        <div>
          <h1 className="h2">Land Unit Calculator</h1>
          <p style={{ color: 'var(--color-text-secondary)' }}>Convert Tamil Nadu land measurements instantly.</p>
        </div>
      </div>

      <div style={{ backgroundColor: 'var(--color-surface)', padding: 'var(--spacing-6)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)', marginBottom: 'var(--spacing-6)' }}>
        <h2 className="h4" style={{ marginBottom: 'var(--spacing-4)' }}>Enter Area & Total Price</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--spacing-4)' }}>
          <div>
            <label style={{ display: 'block', marginBottom: 'var(--spacing-2)', fontWeight: 'bold', fontSize: 'var(--font-size-sm)' }}>Area Size</label>
            <Input type="number" placeholder="Enter size" value={area} onChange={(e) => setArea(e.target.value)} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: 'var(--spacing-2)', fontWeight: 'bold', fontSize: 'var(--font-size-sm)' }}>Input Unit</label>
            <select 
              value={fromUnit} 
              onChange={(e) => setFromUnit(e.target.value as any)}
              style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', fontSize: 'var(--font-size-md)' }}
            >
              <option value="Cent">Cent</option>
              <option value="Sq.Ft">Square Feet</option>
              <option value="Acre">Acre</option>
              <option value="Ground">Ground</option>
              <option value="Sq.M">Square Meters</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: 'var(--spacing-2)', fontWeight: 'bold', fontSize: 'var(--font-size-sm)' }}>Total Price (₹) - Optional</label>
            <Input type="number" placeholder="Enter total asking price" value={price} onChange={(e) => setPrice(e.target.value)} />
          </div>
        </div>
      </div>

      {area && parseFloat(area) > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--spacing-6)' }}>
          {/* Conversions */}
          <div style={{ backgroundColor: 'var(--color-surface)', padding: 'var(--spacing-6)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
            <h2 className="h4" style={{ marginBottom: 'var(--spacing-4)' }}>Area Equivalents</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-3)' }}>
              {Object.entries(conversions).map(([unit, value]) => (
                <div key={unit} style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 'var(--spacing-3)', borderBottom: '1px dashed var(--color-border)' }}>
                  <span style={{ color: 'var(--color-text-secondary)' }}>{unit}</span>
                  <span style={{ fontWeight: 'bold', fontSize: '1.1em' }}>{value.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Price Metrics */}
          {numericPrice > 0 && (
            <div style={{ backgroundColor: 'var(--color-surface)', padding: 'var(--spacing-6)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
              <h2 className="h4" style={{ marginBottom: 'var(--spacing-4)' }}>Price Analysis</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)' }}>
                <div style={{ backgroundColor: '#f0fdf4', padding: 'var(--spacing-4)', borderRadius: 'var(--radius-md)', border: '1px solid #bbf7d0' }}>
                  <div style={{ fontSize: 'var(--font-size-sm)', color: '#166534', marginBottom: 'var(--spacing-1)' }}>Price per Sq.Ft</div>
                  <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 'bold', color: '#166534' }}>
                    ₹ {pricePerSqFt.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                  </div>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 'var(--spacing-3)', borderBottom: '1px dashed var(--color-border)' }}>
                  <span style={{ color: 'var(--color-text-secondary)' }}>Price per Cent</span>
                  <span style={{ fontWeight: 'bold' }}>₹ {(pricePerSqFt * CONVERSIONS['Cent']).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 'var(--spacing-3)', borderBottom: '1px dashed var(--color-border)' }}>
                  <span style={{ color: 'var(--color-text-secondary)' }}>Price per Acre</span>
                  <span style={{ fontWeight: 'bold' }}>₹ {(pricePerSqFt * CONVERSIONS['Acre']).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
