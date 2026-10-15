import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { getAllProperties, syncPropertiesFromBackend, updateProperty, deleteProperty } from '../../utils/propertyUtils';
import type { Property } from '../../data/mockProperties';
import styles from './Admin.module.css';

export default function AdminProperties() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const live = await syncPropertiesFromBackend();
      setProperties(live);
    } catch {
      setProperties(getAllProperties());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleUpdateStatus = (id: string, newStatus: Property['status']) => {
    updateProperty(id, { status: newStatus });
    setProperties(prev => prev.map(p => p.id === id ? { ...p, status: newStatus } : p));
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this property? This cannot be undone.')) {
      deleteProperty(id);
      setProperties(prev => prev.filter(p => p.id !== id));
    }
  };

  const filtered = properties.filter(prop => {
    const matchesSearch = 
      prop.title.toLowerCase().includes(search.toLowerCase()) ||
      prop.id.toLowerCase().includes(search.toLowerCase()) ||
      (prop.seller?.name || '').toLowerCase().includes(search.toLowerCase()) ||
      (prop.location || '').toLowerCase().includes(search.toLowerCase()) ||
      (prop.district || '').toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === 'All' || prop.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-6)' }}>
        <h1 className="h2">Property Management</h1>
        <Button variant="outline" onClick={loadData}>Refresh</Button>
      </div>

      <div style={{ backgroundColor: 'var(--color-surface)', borderRadius: 'var(--radius-lg)', padding: 'var(--spacing-4)', border: '1px solid var(--color-border)', marginBottom: 'var(--spacing-6)' }}>
        <div style={{ display: 'flex', gap: 'var(--spacing-4)', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ flex: 1, minWidth: '250px' }}>
            <Input 
              placeholder="Search properties by title, ID, seller or location..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            {['All', 'Available', 'Published', 'Pending', 'Rejected'].map(status => (
              <button
                key={status}
                type="button"
                onClick={() => setStatusFilter(status)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '6px',
                  border: '1px solid var(--color-border)',
                  backgroundColor: statusFilter === status ? 'var(--color-primary)' : 'var(--color-surface)',
                  color: statusFilter === status ? '#ffffff' : 'var(--color-text)',
                  fontSize: '0.85rem',
                  fontWeight: 500,
                  cursor: 'pointer'
                }}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ backgroundColor: 'var(--color-surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Property ID</th>
                <th>Title</th>
                <th>Seller</th>
                <th>Type</th>
                <th>Price</th>
                <th>Status</th>
                <th>Location</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: 'var(--spacing-6)', color: 'var(--color-text-secondary)' }}>
                    Loading properties...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: 'var(--spacing-8)', color: 'var(--color-text-secondary)' }}>
                    {search || statusFilter !== 'All' 
                      ? 'No properties match your filter.'
                      : 'No properties registered yet. Properties added by users will appear here.'}
                  </td>
                </tr>
              ) : (
                filtered.map(prop => (
                  <tr key={prop.id}>
                    <td className={styles.tdId}>{prop.id}</td>
                    <td style={{ fontWeight: 600 }}>{prop.title}</td>
                    <td>{prop.seller?.name || 'Owner'}</td>
                    <td>{prop.propertyType}</td>
                    <td>₹ {prop.price ? prop.price.toLocaleString() : 'N/A'}</td>
                    <td>
                      <span className={`${styles.statusBadge} ${prop.status === 'Published' || prop.status === 'Available' ? styles.statusActive : styles.statusPending}`}>
                        {prop.status}
                      </span>
                    </td>
                    <td>{prop.district ? `${prop.location || ''}, ${prop.district}` : (prop.location || 'N/A')}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        <Link to={`/property/${prop.id}`} className={styles.actionLink} target="_blank">
                          View
                        </Link>
                        {prop.status !== 'Published' && (
                          <button 
                            type="button" 
                            className={styles.actionLink} 
                            style={{ color: 'var(--color-success)', background: 'none', border: 'none', cursor: 'pointer' }}
                            onClick={() => handleUpdateStatus(prop.id, 'Published')}
                          >
                            Approve
                          </button>
                        )}
                        {prop.status !== 'Rejected' && (
                          <button 
                            type="button" 
                            className={styles.actionLink} 
                            style={{ color: '#d97706', background: 'none', border: 'none', cursor: 'pointer' }}
                            onClick={() => handleUpdateStatus(prop.id, 'Rejected')}
                          >
                            Reject
                          </button>
                        )}
                        <button 
                          type="button" 
                          className={styles.actionLink} 
                          style={{ color: 'var(--color-error)', background: 'none', border: 'none', cursor: 'pointer' }}
                          onClick={() => handleDelete(prop.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
