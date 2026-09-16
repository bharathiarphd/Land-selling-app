import { useState } from 'react';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { Calculator } from 'lucide-react';

export default function PriceCalculator() {
  const [totalPrice, setTotalPrice] = useState<string>('');
  const [totalArea, setTotalArea] = useState<string>('');
  const [areaUnit, setAreaUnit] = useState<string>('Sq.Ft');
  const [results, setResults] = useState<{sqft: number, cent: number, acre: number} | null>(null);

  const calculate = () => {
    const price = parseFloat(totalPrice);
    const area = parseFloat(totalArea);
    
    if (isNaN(price) || isNaN(area) || area <= 0) return;

    let sqftArea = area;
    if (areaUnit === 'Cent') sqftArea = area * 435.6;
    if (areaUnit === 'Acre') sqftArea = area * 43560;

    const pricePerSqft = price / sqftArea;

    setResults({
      sqft: pricePerSqft,
      cent: pricePerSqft * 435.6,
      acre: pricePerSqft * 43560
    });
  };

  const format = (val: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

  return (
    <div className="container" style={{ padding: 'var(--spacing-8) var(--spacing-4)', maxWidth: '600px' }}>
      <h1 className="h2" style={{ marginBottom: 'var(--spacing-6)', display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)' }}>
        <Calculator /> Price Calculator
      </h1>
      
      <div style={{ backgroundColor: 'var(--color-surface)', padding: 'var(--spacing-6)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)' }}>
          <div>
            <label className="input-label">Total Price (₹)</label>
            <Input 
              type="number"
              value={totalPrice}
              placeholder="e.g. 5000000"
              onChange={(e) => setTotalPrice(e.target.value)}
            />
          </div>
          
          <div style={{ display: 'flex', gap: 'var(--spacing-4)' }}>
            <div style={{ flex: 2 }}>
              <label className="input-label">Total Area</label>
              <Input 
                type="number"
                value={totalArea}
                placeholder="e.g. 1200"
                onChange={(e) => setTotalArea(e.target.value)}
              />
            </div>
            
            <div style={{ flex: 1 }}>
              <label className="input-label">Unit</label>
              <select 
                className="input-field" 
                value={areaUnit} 
                onChange={(e) => setAreaUnit(e.target.value)}
                style={{ width: '100%', padding: 'var(--spacing-2)', borderRadius: 'var(--radius-md)' }}
              >
                <option value="Sq.Ft">Sq.Ft</option>
                <option value="Cent">Cent</option>
                <option value="Acre">Acre</option>
              </select>
            </div>
          </div>
          
          <Button onClick={calculate} style={{ marginTop: 'var(--spacing-2)' }}>Calculate</Button>
          
          {results && (
            <div style={{ marginTop: 'var(--spacing-4)', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-2)' }}>
              <div style={{ padding: 'var(--spacing-3)', backgroundColor: 'var(--color-background)', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--color-text-secondary)' }}>Price per Sq.Ft:</span>
                <strong style={{ color: 'var(--color-primary)' }}>{format(results.sqft)}</strong>
              </div>
              <div style={{ padding: 'var(--spacing-3)', backgroundColor: 'var(--color-background)', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--color-text-secondary)' }}>Price per Cent:</span>
                <strong style={{ color: 'var(--color-primary)' }}>{format(results.cent)}</strong>
              </div>
              <div style={{ padding: 'var(--spacing-3)', backgroundColor: 'var(--color-background)', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--color-text-secondary)' }}>Price per Acre:</span>
                <strong style={{ color: 'var(--color-primary)' }}>{format(results.acre)}</strong>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
