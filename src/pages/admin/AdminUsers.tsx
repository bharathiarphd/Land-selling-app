import { useState } from 'react';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import styles from './Admin.module.css';

// Mock users
const mockUsers = [
  { id: '1', name: 'Ramesh Kumar', phone: '9876543210', role: 'Seller', status: 'Active', registered: '2023-10-10' },
  { id: '2', name: 'Suresh Iyer', phone: '9876543211', role: 'Buyer', status: 'Active', registered: '2023-10-12' },
  { id: '3', name: 'Priya Properties', phone: '9876543212', role: 'Agent', status: 'Suspended', registered: '2023-10-15' },
];

export default function AdminUsers() {
  const [search, setSearch] = useState('');

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-6)' }}>
        <h1 className="h2">User Management</h1>
      </div>

      <div style={{ backgroundColor: 'var(--color-surface)', borderRadius: 'var(--radius-lg)', padding: 'var(--spacing-4)', border: '1px solid var(--color-border)', marginBottom: 'var(--spacing-6)' }}>
        <div style={{ display: 'flex', gap: 'var(--spacing-4)', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '250px' }}>
            <Input 
              placeholder="Search users by name or phone..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button variant="outline">Filter by Role</Button>
        </div>
      </div>

      <div style={{ backgroundColor: 'var(--color-surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Phone</th>
                <th>Role</th>
                <th>Status</th>
                <th>Registered</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {mockUsers.map(user => (
                <tr key={user.id}>
                  <td className={styles.tdId}>#{user.id}</td>
                  <td>{user.name}</td>
                  <td>{user.phone}</td>
                  <td><span className={styles.roleBadge}>{user.role}</span></td>
                  <td>
                    <span className={`${styles.statusBadge} ${user.status === 'Active' ? styles.statusActive : styles.statusInactive}`}>
                      {user.status}
                    </span>
                  </td>
                  <td>{user.registered}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button className={styles.actionLink}>View</button>
                      <button className={styles.actionLink} style={{ color: user.status === 'Active' ? 'var(--color-error)' : 'var(--color-success)' }}>
                        {user.status === 'Active' ? 'Suspend' : 'Activate'}
                      </button>
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
