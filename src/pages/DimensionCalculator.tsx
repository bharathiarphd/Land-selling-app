import { useState } from 'react';
import { Ruler, AlertTriangle } from 'lucide-react';
import { Input } from '../components/Input';

export default function DimensionCalculator() {
  const [frontage, setFrontage] = useState<string>('');
  const [depth, setDepth] = useState<string>('');
  const [unit, setUnit] = useState<'Feet' | 'Meters'>('Feet');

  const calcArea = () => {
    const f = parseFloat(frontage) || 0;
    const d = parseFloat(depth) || 0;
    const sqUnits = f * d;
    
    let sqFt = sqUnits;
    if (unit === 'Meters') {
      sqFt = sqUnits * 10.7639; // Convert sq meters to sq ft
    }

    return {
      sqFt,
      cents: sqFt / 435.6,
      acres: sqFt / 43560
    };
  };

  const results = calcArea();
  const hasInput = parseFloat(frontage) > 0 && parseFloat(depth) > 0;

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: 'var(--spacing-4)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-3)', marginBottom: 'var(--spacing-6)' }}>
        <div style={{ backgroundColor: 'var(--color-primary-light)', padding: 'var(--spacing-3)', borderRadius: '50%' }}>
          <Ruler color="var(--color-primary-dark)" />
        </div>
        <div>
          <h1 className="h2">Dimension Calculator</h1>
          <p style={{ color: 'var(--color-text-secondary)' }}>Estimate land area from plot dimensions.</p>
        </div>
      </div>

      <div style={{ backgroundColor: '#fffbeb', padding: 'var(--spacing-4)', borderRadius: 'var(--radius-md)', border: '1px solid #fde68a', display: 'flex', gap: 'var(--spacing-3)', marginBottom: 'var(--spacing-6)' }}>
        <AlertTriangle color="#d97706" style={{ flexShrink: 0 }} />
        <span style={{ fontSize: 'var(--font-size-sm)', color: '#92400e' }}>
          <strong>Disclaimer:</strong> This is an approximate calculation for perfect rectangles. Irregular plots require actual survey measurements via FMB sketch.
        </span>
      </div>

      <div style={{ backgroundColor: 'var(--color-surface)', padding: 'var(--spacing-6)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)', marginBottom: 'var(--spacing-6)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-4)', marginBottom: 'var(--spacing-4)' }}>
          <div>
            <label style={{ display: 'block', marginBottom: 'var(--spacing-2)', fontWeight: 'bold', fontSize: 'var(--font-size-sm)' }}>Frontage</label>
            <Input type="number" placeholder={`e.g. 40`} value={frontage} onChange={(e) => setFrontage(e.target.value)} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: 'var(--spacing-2)', fontWeight: 'bold', fontSize: 'var(--font-size-sm)' }}>Depth</label>
            <Input type="number" placeholder={`e.g. 60`} value={depth} onChange={(e) => setDepth(e.target.value)} />
          </div>
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: 'var(--spacing-2)', fontWeight: 'bold', fontSize: 'var(--font-size-sm)' }}>Measurement Unit</label>
          <select 
            value={unit} 
            onChange={(e) => setUnit(e.target.value as any)}
            style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', fontSize: 'var(--font-size-md)' }}
          >
            <option value="Feet">Feet (ft)</option>
            <option value="Meters">Meters (m)</option>
          </select>
        </div>
      </div>

      {hasInput && (
        <div style={{ backgroundColor: 'var(--color-surface)', padding: 'var(--spacing-6)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
          <h2 className="h4" style={{ marginBottom: 'var(--spacing-4)' }}>Estimated Area</h2>
          
          <div style={{ textAlign: 'center', backgroundColor: '#f3f4f6', padding: 'var(--spacing-6)', borderRadius: 'var(--radius-md)', marginBottom: 'var(--spacing-6)' }}>
            <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', marginBottom: 'var(--spacing-1)' }}>Total Square Feet</div>
            <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--color-primary-dark)' }}>
              {results.sqFt.toLocaleString('en-IN', { maximumFractionDigits: 1 })} <span style={{ fontSize: '1rem', fontWeight: 'normal' }}>sq.ft</span>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-4)' }}>
            <div style={{ border: '1px solid var(--color-border)', padding: 'var(--spacing-4)', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
              <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>In Cents</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{results.cents.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</div>
            </div>
            <div style={{ border: '1px solid var(--color-border)', padding: 'var(--spacing-4)', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
              <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>In Acres</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{results.acres.toLocaleString('en-IN', { maximumFractionDigits: 3 })}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
