import { useState } from 'react';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { Calculator } from 'lucide-react';

const CONVERSION_RATES = {
  'Sq.Ft': 1,
  'Cent': 435.6,
  'Acre': 43560,
  'Ground': 2400,
  'Sq.M': 10.764
};

type Unit = keyof typeof CONVERSION_RATES;

export default function AreaConverter() {
  const [value, setValue] = useState<string>('1');
  const [fromUnit, setFromUnit] = useState<Unit>('Acre');
  const [toUnit, setToUnit] = useState<Unit>('Sq.Ft');
  const [result, setResult] = useState<string>('43560');

  const handleConvert = () => {
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return;

    // Convert from source unit to sq.ft, then to target unit
    const sqft = numValue * CONVERSION_RATES[fromUnit];
    const converted = sqft / CONVERSION_RATES[toUnit];
    
    setResult(converted.toLocaleString('en-IN', { maximumFractionDigits: 2 }));
  };

  return (
    <div className="container" style={{ padding: 'var(--spacing-8) var(--spacing-4)', maxWidth: '600px' }}>
      <h1 className="h2" style={{ marginBottom: 'var(--spacing-6)', display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)' }}>
        <Calculator /> Area Converter
      </h1>
      
      <div style={{ backgroundColor: 'var(--color-surface)', padding: 'var(--spacing-6)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)' }}>
          <div>
            <label className="input-label">Amount</label>
            <Input 
              type="number"
              value={value}
              onChange={(e) => setValue(e.target.value)}
            />
          </div>
          
          <div style={{ display: 'flex', gap: 'var(--spacing-4)' }}>
            <div style={{ flex: 1 }}>
              <label className="input-label">From</label>
              <select 
                className="input-field" 
                value={fromUnit} 
                onChange={(e) => setFromUnit(e.target.value as Unit)}
                style={{ width: '100%', padding: 'var(--spacing-2)', borderRadius: 'var(--radius-md)' }}
              >
                {Object.keys(CONVERSION_RATES).map(u => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>
            
            <div style={{ flex: 1 }}>
              <label className="input-label">To</label>
              <select 
                className="input-field" 
                value={toUnit} 
                onChange={(e) => setToUnit(e.target.value as Unit)}
                style={{ width: '100%', padding: 'var(--spacing-2)', borderRadius: 'var(--radius-md)' }}
              >
                {Object.keys(CONVERSION_RATES).map(u => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>
          </div>
          
          <Button onClick={handleConvert} style={{ marginTop: 'var(--spacing-2)' }}>Convert</Button>
          
          {result && (
            <div style={{ marginTop: 'var(--spacing-4)', padding: 'var(--spacing-4)', backgroundColor: 'var(--color-primary-light)', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
              <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>Result</div>
              <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-primary-dark)' }}>
                {result} {toUnit}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
