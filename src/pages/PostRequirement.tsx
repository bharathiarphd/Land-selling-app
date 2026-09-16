import { useState } from 'react';
import { ClipboardList, Send, MapPin, Ruler } from 'lucide-react';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { useNavigate } from 'react-router-dom';

export default function PostRequirement() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    propertyType: 'Plot',
    district: '',
    minArea: '',
    maxArea: '',
    budget: '',
    purpose: 'Investment',
    details: ''
  });

  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock API submission
    setTimeout(() => {
      setSubmitted(true);
      setTimeout(() => navigate('/buyer-requirements'), 2000);
    }, 800);
  };

  if (submitted) {
    return (
      <div style={{ maxWidth: '600px', margin: '100px auto', textAlign: 'center', backgroundColor: 'var(--color-surface)', padding: 'var(--spacing-8)', borderRadius: 'var(--radius-lg)' }}>
        <div style={{ backgroundColor: '#dcfce7', width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto var(--spacing-6)' }}>
          <ClipboardList color="#166534" size={40} />
        </div>
        <h1 className="h3" style={{ marginBottom: 'var(--spacing-2)' }}>Requirement Posted!</h1>
        <p style={{ color: 'var(--color-text-secondary)' }}>Sellers and agents will be notified. We'll alert you of any matches.</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: 'var(--spacing-4)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-3)', marginBottom: 'var(--spacing-6)' }}>
        <div style={{ backgroundColor: 'var(--color-primary-light)', padding: 'var(--spacing-3)', borderRadius: '50%' }}>
          <ClipboardList color="var(--color-primary-dark)" />
        </div>
        <div>
          <h1 className="h2">Post Land Requirement</h1>
          <p style={{ color: 'var(--color-text-secondary)' }}>Can't find what you're looking for? Let sellers come to you.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} style={{ backgroundColor: 'var(--color-surface)', padding: 'var(--spacing-8)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--spacing-6)', marginBottom: 'var(--spacing-6)' }}>
          
          <div>
            <label style={{ display: 'block', marginBottom: 'var(--spacing-2)', fontWeight: 'bold' }}>Property Type</label>
            <select 
              value={formData.propertyType}
              onChange={(e) => setFormData({...formData, propertyType: e.target.value})}
              style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', fontSize: 'var(--font-size-md)' }}
              required
            >
              <option value="Plot">Residential Plot</option>
              <option value="Agricultural Land">Agricultural Land</option>
              <option value="Commercial Land">Commercial Land</option>
              <option value="Farm Land">Farm Land</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: 'var(--spacing-2)', fontWeight: 'bold' }}><MapPin size={16} style={{display:'inline', verticalAlign:'middle'}}/> Preferred District</label>
            <Input 
              placeholder="e.g. Kanchipuram"
              value={formData.district}
              onChange={(e) => setFormData({...formData, district: e.target.value})}
              required
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: 'var(--spacing-2)', fontWeight: 'bold' }}><Ruler size={16} style={{display:'inline', verticalAlign:'middle'}}/> Minimum Area</label>
            <Input 
              type="number"
              placeholder="e.g. 1200 (Sq.ft/Cents/Acres)"
              value={formData.minArea}
              onChange={(e) => setFormData({...formData, minArea: e.target.value})}
              required
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: 'var(--spacing-2)', fontWeight: 'bold' }}>Maximum Budget (₹)</label>
            <Input 
              type="number"
              placeholder="e.g. 5000000"
              value={formData.budget}
              onChange={(e) => setFormData({...formData, budget: e.target.value})}
              required
            />
          </div>

        </div>

        <div style={{ marginBottom: 'var(--spacing-6)' }}>
          <label style={{ display: 'block', marginBottom: 'var(--spacing-2)', fontWeight: 'bold' }}>Additional Requirements</label>
          <textarea 
            placeholder="Specify road width, facing, water availability, distance from highway..."
            value={formData.details}
            onChange={(e) => setFormData({...formData, details: e.target.value})}
            style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', fontSize: 'var(--font-size-md)', minHeight: '100px', resize: 'vertical', fontFamily: 'inherit' }}
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button type="submit"><Send size={18} /> Post Requirement</Button>
        </div>
      </form>
    </div>
  );
}
