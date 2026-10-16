import { useState, useEffect } from 'react';
import { Copy, Check, Search, RefreshCw, Trash2, MapPin } from 'lucide-react';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { BACKEND_URL } from '../../config/api';
import styles from './Admin.module.css';

const AUTH_STORAGE_KEY = 'land_selling_app_token';

export default function AdminUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (id: string) => {
    if (!id) return;
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => {
      setCopiedId(null);
    }, 2000);
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError('');
      const token = localStorage.getItem(AUTH_STORAGE_KEY);
      
      try {
        const response = await fetch(`${BACKEND_URL}/api/admin/users`, {
          headers: {
            'Authorization': `Bearer ${token || 'mock-admin-token'}`,
            'x-admin-phone': '8248843385'
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          if (Array.isArray(data) && data.length > 0) {
            setUsers(data);
            return;
          }
        }
      } catch (networkErr) {
        console.warn('Backend unavailable, displaying local users:', networkErr);
      }

      // Offline / Local resilience fallback
      const savedUsersRaw = localStorage.getItem('registered_users') || '{}';
      const registeredMap = JSON.parse(savedUsersRaw);
      const uniqueUsers: Record<string, any> = {};

      // Seed default admin with official ADM-000001
      uniqueUsers['+918248843385'] = {
        _id: 'usr_admin_8248843385',
        userId: 'ADM-000001',
        name: 'raja',
        phone: '+918248843385',
        email: 'admin@landsellingapp.com',
        role: 'Admin',
        district: 'Chennai',
        town: 'Chennai',
        pincode: '600001',
        createdAt: new Date().toISOString()
      };

      Object.values(registeredMap).forEach((u: any, idx: number) => {
        if (u && (u.phone || u.id)) {
          const role = u.role || 'Buyer';
          const prefix = role === 'Admin' ? 'ADM' : role === 'Seller' ? 'SLR' : role === 'Agent' ? 'AGT' : 'USR';
          const fallbackId = u.userId || `${prefix}-${String(idx + 1).padStart(6, '0')}`;
          uniqueUsers[u.phone || u.id] = {
            ...u,
            userId: fallbackId
          };
        }
      });

      setUsers(Object.values(uniqueUsers));
    } catch (err: any) {
      setError(err.message || 'Unable to load user list');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDeleteUser = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this user? Deleted IDs will never be reused.')) return;
    
    try {
      const token = localStorage.getItem(AUTH_STORAGE_KEY);
      if (token) {
        await fetch(`${BACKEND_URL}/api/admin/users/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'x-admin-phone': '8248843385'
          }
        });
      }
      
      setUsers(users.filter(u => u._id !== id && u.userId !== id));
      
      // Update local storage registry if exists
      const savedUsersRaw = localStorage.getItem('registered_users') || '{}';
      const registeredMap = JSON.parse(savedUsersRaw);
      for (const k of Object.keys(registeredMap)) {
        if (registeredMap[k]?._id === id || registeredMap[k]?.userId === id) {
          delete registeredMap[k];
        }
      }
      localStorage.setItem('registered_users', JSON.stringify(registeredMap));
    } catch (err: any) {
      alert(err.message);
    }
  };

  const term = search.trim().toLowerCase();
  const filteredUsers = users.filter(user => {
    if (!term) return true;
    const uid = (user.userId || user._id || '').toLowerCase();
    const name = (user.name || '').toLowerCase();
    const email = (user.email || '').toLowerCase();
    const phone = (user.phone || '').toLowerCase();
    const district = (user.district || '').toLowerCase();
    const town = (user.town || '').toLowerCase();
    const role = (user.role || '').toLowerCase();

    return (
      uid.includes(term) ||
      name.includes(term) ||
      email.includes(term) ||
      phone.includes(term) ||
      district.includes(term) ||
      town.includes(term) ||
      role.includes(term)
    );
  });

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-6)' }}>
        <div>
          <h1 className="h2" style={{ margin: 0 }}>User Management</h1>
          <p style={{ margin: '4px 0 0 0', color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>
            System-generated unique sequential User IDs (ADM-000001, USR-000001, SLR-000001, AGT-000001).
          </p>
        </div>
      </div>

      {error && <div style={{ color: 'red', marginBottom: '1rem' }}>{error}</div>}

      <div style={{ backgroundColor: 'var(--color-surface)', borderRadius: 'var(--radius-lg)', padding: 'var(--spacing-4)', border: '1px solid var(--color-border)', marginBottom: 'var(--spacing-6)' }}>
        <div style={{ display: 'flex', gap: 'var(--spacing-4)', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ flex: 1, minWidth: '280px' }}>
            <Input 
              leftIcon={<Search size={16} />}
              placeholder="Search by User ID (e.g. ADM-000001), name, mobile, email, or district..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button variant="outline" onClick={fetchUsers} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <RefreshCw size={14} /> Refresh
          </Button>
        </div>
      </div>

      <div style={{ backgroundColor: 'var(--color-surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th style={{ minWidth: '160px' }}>User ID</th>
                <th>Name</th>
                <th>Mobile Number</th>
                <th>Email</th>
                <th>District / Town</th>
                <th>Role</th>
                <th>Registration Date</th>
                <th>Account Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={9} style={{ textAlign: 'center', padding: '1.5rem' }}>Loading users...</td></tr>
              ) : filteredUsers.length === 0 ? (
                <tr><td colSpan={9} style={{ textAlign: 'center', padding: '1.5rem' }}>No users matching your search</td></tr>
              ) : (
                filteredUsers.map(user => {
                  const role = user.role || 'Buyer';
                  const prefix = role === 'Admin' ? 'ADM' : role === 'Seller' ? 'SLR' : role === 'Agent' ? 'AGT' : 'USR';
                  const displayUserId = user.userId || (user.phone?.includes('8248843385') ? 'ADM-000001' : `${prefix}-000001`);
                  const isCopied = copiedId === displayUserId;
                  const isSuspended = user.status === 'Suspended';

                  return (
                    <tr key={user._id || displayUserId}>
                      {/* Full User ID with Copy Functionality */}
                      <td>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{
                            fontFamily: 'monospace',
                            fontWeight: 700,
                            color: role === 'Admin' ? '#0284c7' : '#0f172a',
                            backgroundColor: role === 'Admin' ? 'rgba(2, 132, 199, 0.1)' : 'rgba(100, 116, 139, 0.08)',
                            border: `1px solid ${role === 'Admin' ? '#bae6fd' : '#e2e8f0'}`,
                            padding: '3px 8px',
                            borderRadius: '6px',
                            fontSize: '0.85rem',
                            letterSpacing: '0.04em'
                          }}>
                            {displayUserId}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopy(displayUserId)}
                            title={isCopied ? 'Copied!' : 'Copy User ID'}
                            style={{
                              background: isCopied ? '#dcfce7' : 'transparent',
                              border: '1px solid',
                              borderColor: isCopied ? '#86efac' : '#cbd5e1',
                              cursor: 'pointer',
                              padding: '3px 6px',
                              borderRadius: '4px',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              fontSize: '11px',
                              color: isCopied ? '#15803d' : '#64748b',
                              transition: 'all 0.15s ease'
                            }}
                          >
                            {isCopied ? <Check size={12} color="#15803d" /> : <Copy size={12} />}
                            <span>{isCopied ? 'Copied' : 'Copy'}</span>
                          </button>
                        </div>
                      </td>

                      <td style={{ fontWeight: 600 }}>{user.name || 'User'}</td>
                      
                      <td style={{ fontFamily: 'monospace' }}>
                        {user.phone ? user.phone.replace('+91', '+91 ') : '—'}
                      </td>

                      <td>{user.email || '—'}</td>

                      <td>
                        {user.district || user.town ? (
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem', color: '#475569' }}>
                            <MapPin size={12} color="#0284c7" />
                            <span>
                              {[user.town, user.district, user.pincode].filter(Boolean).join(', ')}
                            </span>
                          </div>
                        ) : (
                          <span style={{ color: '#94a3b8' }}>—</span>
                        )}
                      </td>

                      <td>
                        <span className={`${styles.roleBadge} ${role === 'Admin' ? styles.statusActive : ''}`}>
                          {role}
                        </span>
                      </td>

                      <td>{user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Recent'}</td>

                      <td>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '4px 10px',
                          borderRadius: '999px',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          backgroundColor: isSuspended ? '#fee2e2' : '#dcfce7',
                          color: isSuspended ? '#dc2626' : '#15803d',
                          border: `1px solid ${isSuspended ? '#fca5a5' : '#86efac'}`
                        }}>
                          <span style={{
                            width: '6px',
                            height: '6px',
                            borderRadius: '50%',
                            backgroundColor: isSuspended ? '#dc2626' : '#16a34a'
                          }} />
                          {user.status || 'Active'}
                        </span>
                      </td>

                      <td>
                        <button 
                          className={styles.actionLink} 
                          style={{ color: 'var(--color-error)', background: 'none', border: 'none', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                          onClick={() => handleDeleteUser(user._id)}
                        >
                          <Trash2 size={13} /> Delete
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
