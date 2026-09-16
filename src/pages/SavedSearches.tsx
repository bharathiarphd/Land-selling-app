import { useState } from 'react';
import { Bell, Search, Trash2 } from 'lucide-react';
import { Button } from '../components/Button';
import { useNavigate } from 'react-router-dom';

interface SavedSearch {
  id: string;
  name: string;
  criteria: any; // Simplified for mock
  notifications: boolean;
  dateAdded: string;
}

// Mock initial data
const MOCK_SAVED = [
  { id: '1', name: 'Plots in OMR under 50L', criteria: { type: 'Plot', location: 'OMR', maxPrice: 5000000 }, notifications: true, dateAdded: '2023-11-01' },
  { id: '2', name: 'Farm Land 1-5 Acres', criteria: { type: 'Farm Land', minArea: 1, maxArea: 5, unit: 'Acre' }, notifications: false, dateAdded: '2023-11-05' }
];

export default function SavedSearches() {
  const navigate = useNavigate();
  const [searches, setSearches] = useState<SavedSearch[]>(MOCK_SAVED);

  const toggleNotification = (id: string) => {
    setSearches(searches.map(s => s.id === id ? { ...s, notifications: !s.notifications } : s));
  };

  const removeSearch = (id: string) => {
    setSearches(searches.filter(s => s.id !== id));
  };

  return (
    <div className="container" style={{ padding: 'var(--spacing-8) var(--spacing-4)', maxWidth: '800px' }}>
      <h1 className="h2" style={{ marginBottom: 'var(--spacing-6)' }}>Saved Searches</h1>

      {searches.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 'var(--spacing-8)', backgroundColor: 'var(--color-surface)', borderRadius: 'var(--radius-lg)' }}>
          <Search size={48} color="var(--color-text-muted)" style={{ margin: '0 auto var(--spacing-4)' }} />
          <h3 className="h4" style={{ marginBottom: 'var(--spacing-2)' }}>No saved searches</h3>
          <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--spacing-4)' }}>Save your search criteria to receive alerts when new matching properties are added.</p>
          <Button onClick={() => navigate('/search')}>Start Searching</Button>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 'var(--spacing-4)' }}>
          {searches.map(s => (
            <div key={s.id} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)', padding: 'var(--spacing-4)', backgroundColor: 'var(--color-surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h3 className="h4">{s.name}</h3>
                  <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', marginTop: 'var(--spacing-1)' }}>
                    Saved on {new Date(s.dateAdded).toLocaleDateString()}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 'var(--spacing-2)' }}>
                  <button onClick={() => toggleNotification(s.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: s.notifications ? 'var(--color-primary)' : 'var(--color-text-muted)' }} title="Toggle Alerts">
                    <Bell size={20} fill={s.notifications ? 'currentColor' : 'none'} />
                  </button>
                  <button onClick={() => removeSearch(s.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-error)' }} title="Delete">
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 'var(--spacing-2)', flexWrap: 'wrap' }}>
                {Object.entries(s.criteria).map(([key, value]) => (
                  <span key={key} style={{ backgroundColor: 'var(--color-background)', padding: '4px 8px', borderRadius: '12px', fontSize: 'var(--font-size-xs)' }}>
                    {key}: {value as string}
                  </span>
                ))}
              </div>
              <div>
                <Button variant="outline" onClick={() => navigate('/search')} style={{ width: '100%' }}>View Results</Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
