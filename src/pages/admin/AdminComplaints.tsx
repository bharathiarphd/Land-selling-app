import { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import type { Complaint } from '../../services/adminService';
import { ShieldAlert, CheckCircle, Clock, XCircle } from 'lucide-react';
import { Input } from '../../components/Input';

export default function AdminComplaints() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadComplaints();
  }, []);

  const loadComplaints = () => {
    adminService.getComplaints().then(setComplaints);
  };

  const updateStatus = async (id: string, status: Complaint['status']) => {
    await adminService.updateComplaintStatus(id, status);
    loadComplaints();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'New': return <span style={{ backgroundColor: '#fee2e2', color: '#991b1b', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}>New</span>;
      case 'Under Investigation': return <span style={{ backgroundColor: '#fef3c7', color: '#92400e', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}>Investigating</span>;
      case 'Resolved': return <span style={{ backgroundColor: '#dcfce7', color: '#166534', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}>Resolved</span>;
      case 'Rejected': return <span style={{ backgroundColor: '#f3f4f6', color: '#4b5563', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}>Rejected</span>;
      default: return null;
    }
  };

  const filtered = complaints.filter(c => c.propertyTitle.toLowerCase().includes(search.toLowerCase()) || c.id.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-6)' }}>
        <h1 className="h2" style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)' }}>
          <ShieldAlert color="var(--color-error)" /> Complaints & Reports
        </h1>
      </div>

      <div style={{ backgroundColor: 'var(--color-surface)', padding: 'var(--spacing-6)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)', marginBottom: 'var(--spacing-6)' }}>
        <Input 
          placeholder="Search by Complaint ID or Property Title..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div style={{ backgroundColor: 'var(--color-surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ backgroundColor: 'var(--color-background)', borderBottom: '1px solid var(--color-border)' }}>
              <th style={{ padding: 'var(--spacing-4)', fontWeight: 'var(--font-weight-medium)' }}>Complaint ID</th>
              <th style={{ padding: 'var(--spacing-4)', fontWeight: 'var(--font-weight-medium)' }}>Property</th>
              <th style={{ padding: 'var(--spacing-4)', fontWeight: 'var(--font-weight-medium)' }}>Reason</th>
              <th style={{ padding: 'var(--spacing-4)', fontWeight: 'var(--font-weight-medium)' }}>Status</th>
              <th style={{ padding: 'var(--spacing-4)', fontWeight: 'var(--font-weight-medium)' }}>Date</th>
              <th style={{ padding: 'var(--spacing-4)', fontWeight: 'var(--font-weight-medium)', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: 'var(--spacing-8)', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                  No complaints found.
                </td>
              </tr>
            ) : (
              filtered.map(c => (
                <tr key={c.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                  <td style={{ padding: 'var(--spacing-4)', fontSize: 'var(--font-size-sm)' }}>{c.id.toUpperCase()}</td>
                  <td style={{ padding: 'var(--spacing-4)', fontWeight: 'var(--font-weight-medium)' }}>{c.propertyTitle}</td>
                  <td style={{ padding: 'var(--spacing-4)', color: 'var(--color-error)' }}>{c.reason}</td>
                  <td style={{ padding: 'var(--spacing-4)' }}>{getStatusBadge(c.status)}</td>
                  <td style={{ padding: 'var(--spacing-4)', fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>
                    {new Date(c.dateReported).toLocaleDateString()}
                  </td>
                  <td style={{ padding: 'var(--spacing-4)', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: 'var(--spacing-2)', justifyContent: 'flex-end' }}>
                      {c.status === 'New' && (
                        <button onClick={() => updateStatus(c.id, 'Under Investigation')} style={{ padding: '6px', backgroundColor: '#fffbeb', color: '#92400e', border: '1px solid #fde68a', borderRadius: '4px', cursor: 'pointer' }} title="Investigate">
                          <Clock size={16} />
                        </button>
                      )}
                      {(c.status === 'New' || c.status === 'Under Investigation') && (
                        <>
                          <button onClick={() => updateStatus(c.id, 'Resolved')} style={{ padding: '6px', backgroundColor: '#f0fdf4', color: '#166534', border: '1px solid #bbf7d0', borderRadius: '4px', cursor: 'pointer' }} title="Resolve">
                            <CheckCircle size={16} />
                          </button>
                          <button onClick={() => updateStatus(c.id, 'Rejected')} style={{ padding: '6px', backgroundColor: '#f9fafb', color: '#374151', border: '1px solid #e5e7eb', borderRadius: '4px', cursor: 'pointer' }} title="Reject">
                            <XCircle size={16} />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
