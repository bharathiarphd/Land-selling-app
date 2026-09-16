import { useState } from 'react';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import styles from './Admin.module.css';

// Mock Properties
const mockProps = [
  { id: 'prop-1', title: '5 Cents Plot in Madipakkam', seller: 'Ramesh Kumar', type: 'Residential', price: '₹45,00,000', status: 'Pending Review', date: '2023-10-25' },
  { id: 'prop-2', title: '2 Acres Farm Land in ECR', seller: 'Suresh Iyer', type: 'Farm Land', price: '₹1,20,00,000', status: 'Published', date: '2023-10-24' },
];

export default function AdminProperties() {
  const [search, setSearch] = useState('');

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-6)' }}>
        <h1 className="h2">Property Management</h1>
      </div>

      <div style={{ backgroundColor: 'var(--color-surface)', borderRadius: 'var(--radius-lg)', padding: 'var(--spacing-4)', border: '1px solid var(--color-border)', marginBottom: 'var(--spacing-6)' }}>
        <div style={{ display: 'flex', gap: 'var(--spacing-4)', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '250px' }}>
            <Input 
              placeholder="Search properties by title or ID..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button variant="outline">Filter by Status</Button>
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
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {mockProps.map(prop => (
                <tr key={prop.id}>
                  <td className={styles.tdId}>{prop.id}</td>
                  <td>{prop.title}</td>
                  <td>{prop.seller}</td>
                  <td>{prop.type}</td>
                  <td>{prop.price}</td>
                  <td>
                    <span className={`${styles.statusBadge} ${prop.status === 'Published' ? styles.statusActive : styles.statusPending}`}>
                      {prop.status}
                    </span>
                  </td>
                  <td>{prop.date}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button className={styles.actionLink}>View</button>
                      {prop.status === 'Pending Review' && (
                        <button className={styles.actionLink} style={{ color: 'var(--color-success)' }}>Approve</button>
                      )}
                      <button className={styles.actionLink} style={{ color: 'var(--color-error)' }}>Reject</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
