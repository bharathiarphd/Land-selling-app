import React, { useState, useEffect } from 'react';
import { 
  PhoneCall, Shield, CheckCircle2, XCircle, Clock, Search, 
  RefreshCw, User, Home, ArrowUpRight, MessageSquare, Phone, 
  ExternalLink, Filter, AlertCircle 
} from 'lucide-react';
import { Button } from '../../components/Button';
import { contactRequestUtils, type PropertyContactRequest, type ContactRequestStatus } from '../../utils/contactRequestUtils';
import styles from './Admin.module.css';

export default function AdminContactRequests() {
  const [requests, setRequests] = useState<PropertyContactRequest[]>([]);
  const [filter, setFilter] = useState<'All' | ContactRequestStatus>('Pending');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const loadRequests = async () => {
    setLoading(true);
    try {
      const data = await contactRequestUtils.getAllRequests();
      setRequests(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const handleApprove = async (req: PropertyContactRequest) => {
    try {
      await contactRequestUtils.updateStatus(req.id, 'Approved', 'Approved by Admin');
      setActionSuccess(`✅ Approved! Owner contact details (+91 ${req.sellerPhone}) released to ${req.buyerName}.`);
      loadRequests();
      setTimeout(() => setActionSuccess(null), 4000);
    } catch (err) {
      console.error(err);
    }
  };

  const handleReject = async (req: PropertyContactRequest) => {
    const reason = window.prompt(`Enter reason for declining ${req.buyerName}'s request (optional):`, 'Insufficient verification');
    if (reason === null) return; // user cancelled prompt

    try {
      await contactRequestUtils.updateStatus(req.id, 'Rejected', reason);
      setActionSuccess(`Declined request for ${req.buyerName}.`);
      loadRequests();
      setTimeout(() => setActionSuccess(null), 4000);
    } catch (err) {
      console.error(err);
    }
  };

  // Filter & Search logic
  const filteredRequests = requests.filter(r => {
    const matchesFilter = filter === 'All' ? true : r.status === filter;
    const query = searchTerm.toLowerCase().trim();
    const matchesSearch = !query || 
      r.buyerName.toLowerCase().includes(query) ||
      r.buyerPhone.includes(query) ||
      r.propertyTitle.toLowerCase().includes(query) ||
      r.sellerName.toLowerCase().includes(query) ||
      (r.buyerUserId && r.buyerUserId.toLowerCase().includes(query));

    return matchesFilter && matchesSearch;
  });

  const totalCount = requests.length;
  const pendingCount = requests.filter(r => r.status === 'Pending').length;
  const approvedCount = requests.filter(r => r.status === 'Approved').length;
  const rejectedCount = requests.filter(r => r.status === 'Rejected').length;

  return (
    <div style={{ padding: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 className="h2" style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: 0 }}>
            <PhoneCall size={28} color="#0284c7" />
            <span>Buyer Purchase & Contact Requests</span>
          </h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', marginTop: '4px' }}>
            Review buyer requests to unlock and receive property owner contact details.
          </p>
        </div>

        <Button variant="outline" onClick={loadRequests} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <RefreshCw size={16} /> Refresh
        </Button>
      </div>

      {/* Action Success Alert */}
      {actionSuccess && (
        <div 
          style={{
            backgroundColor: '#f0fdf4',
            border: '1px solid #86efac',
            color: '#166534',
            padding: '12px 16px',
            borderRadius: '10px',
            marginBottom: '20px',
            fontSize: '0.9rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <CheckCircle2 size={18} />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px' }}>
          <div style={{ fontSize: '0.85rem', color: '#64748b' }}>Total Requests</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#0f172a', marginTop: '4px' }}>{totalCount}</div>
        </div>

        <div style={{ backgroundColor: '#fffbeb', border: '1px solid #fde68a', borderRadius: '12px', padding: '16px' }}>
          <div style={{ fontSize: '0.85rem', color: '#b45309', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Clock size={16} /> Pending Admin Approval
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#d97706', marginTop: '4px' }}>{pendingCount}</div>
        </div>

        <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '12px', padding: '16px' }}>
          <div style={{ fontSize: '0.85rem', color: '#166534', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
            <CheckCircle2 size={16} /> Approved & Released
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#15803d', marginTop: '4px' }}>{approvedCount}</div>
        </div>

        <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '12px', padding: '16px' }}>
          <div style={{ fontSize: '0.85rem', color: '#b91c1c', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
            <XCircle size={16} /> Declined
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#b91c1c', marginTop: '4px' }}>{rejectedCount}</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div 
        style={{ 
          backgroundColor: '#ffffff', 
          border: '1px solid #e2e8f0', 
          borderRadius: '12px', 
          padding: '16px', 
          marginBottom: '20px',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '16px',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        {/* Filter Pills */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {(['Pending', 'Approved', 'Rejected', 'All'] as const).map(tab => {
            const isSelected = filter === tab;
            const count = tab === 'All' ? totalCount : tab === 'Pending' ? pendingCount : tab === 'Approved' ? approvedCount : rejectedCount;

            return (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                style={{
                  padding: '6px 14px',
                  borderRadius: '20px',
                  border: isSelected ? '1px solid #0284c7' : '1px solid #e2e8f0',
                  backgroundColor: isSelected ? '#e0f2fe' : '#f8fafc',
                  color: isSelected ? '#0369a1' : '#475569',
                  fontWeight: isSelected ? 700 : 500,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.15s ease'
                }}
              >
                <span>{tab === 'Pending' ? '⏳ Pending Approval' : tab}</span>
                <span 
                  style={{
                    backgroundColor: isSelected ? '#0284c7' : '#cbd5e1',
                    color: '#ffffff',
                    fontSize: '0.75rem',
                    padding: '1px 6px',
                    borderRadius: '10px'
                  }}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div style={{ position: 'relative', minWidth: '260px' }}>
          <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            placeholder="Search buyer, phone, property..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 12px 8px 36px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              fontSize: '0.88rem',
              outline: 'none'
            }}
          />
        </div>
      </div>

      {/* Table / List */}
      <div className={styles.tableResponsive}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Buyer (Customer)</th>
              <th>Property Requested</th>
              <th>Property Owner</th>
              <th>Buyer Interest Note</th>
              <th>Status</th>
              <th>Requested On</th>
              <th style={{ textAlign: 'right' }}>Admin Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredRequests.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '40px 16px', color: '#64748b' }}>
                  {loading ? 'Loading requests...' : 'No contact requests found in this filter.'}
                </td>
              </tr>
            ) : (
              filteredRequests.map(req => {
                const isPending = req.status === 'Pending';
                const isApproved = req.status === 'Approved';
                const isRejected = req.status === 'Rejected';

                return (
                  <tr key={req.id}>
                    {/* Buyer */}
                    <td>
                      <div style={{ fontWeight: 600, color: '#0f172a' }}>{req.buyerName}</div>
                      <div style={{ fontSize: '0.82rem', color: '#0284c7', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Phone size={12} />
                        <a href={`tel:${req.buyerPhone}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                          +91 {req.buyerPhone}
                        </a>
                      </div>
                      {req.buyerUserId && (
                        <span style={{ fontSize: '0.75rem', color: '#64748b', backgroundColor: '#f1f5f9', padding: '1px 6px', borderRadius: '4px', display: 'inline-block', marginTop: '2px' }}>
                          {req.buyerUserId}
                        </span>
                      )}
                    </td>

                    {/* Property */}
                    <td>
                      <div style={{ maxWidth: '240px' }}>
                        <a 
                          href={`/property/${req.propertyId}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          style={{ fontWeight: 600, color: '#1e293b', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                        >
                          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{req.propertyTitle}</span>
                          <ExternalLink size={13} color="#64748b" style={{ flexShrink: 0 }} />
                        </a>
                        <div style={{ fontSize: '0.82rem', color: '#059669', fontWeight: 700 }}>
                          ₹{req.propertyPrice?.toLocaleString('en-IN') || 'Price On Request'}
                        </div>
                        <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                          {req.propertyLocation}
                        </div>
                      </div>
                    </td>

                    {/* Owner */}
                    <td>
                      <div style={{ fontWeight: 600, color: '#334155' }}>{req.sellerName}</div>
                      <div style={{ fontSize: '0.82rem', color: '#16a34a', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Phone size={12} />
                        <a href={`tel:${req.sellerPhone}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                          +91 {req.sellerPhone}
                        </a>
                      </div>
                      <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                        Role: {req.sellerType || 'Owner'}
                      </span>
                    </td>

                    {/* Message */}
                    <td>
                      <div style={{ maxWidth: '200px', fontSize: '0.82rem', color: '#475569', backgroundColor: '#f8fafc', padding: '6px 8px', borderRadius: '6px', border: '1px solid #e2e8f0', lineHeight: 1.3 }}>
                        {req.message || 'Customer liked property and requested contact'}
                      </div>
                    </td>

                    {/* Status */}
                    <td>
                      {isPending && (
                        <span style={{ backgroundColor: '#fef3c7', color: '#b45309', padding: '4px 10px', borderRadius: '20px', fontSize: '0.78rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <Clock size={12} /> Pending Approval
                        </span>
                      )}
                      {isApproved && (
                        <span style={{ backgroundColor: '#dcfce7', color: '#15803d', padding: '4px 10px', borderRadius: '20px', fontSize: '0.78rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <CheckCircle2 size={12} /> Contact Released
                        </span>
                      )}
                      {isRejected && (
                        <span style={{ backgroundColor: '#fee2e2', color: '#b91c1c', padding: '4px 10px', borderRadius: '20px', fontSize: '0.78rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <XCircle size={12} /> Declined
                        </span>
                      )}
                    </td>

                    {/* Date */}
                    <td>
                      <div style={{ fontSize: '0.82rem', color: '#334155' }}>
                        {new Date(req.createdAt).toLocaleDateString()}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                        {new Date(req.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </td>

                    {/* Action buttons */}
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '6px', justifyContent: 'flex-end' }}>
                        {isPending ? (
                          <>
                            <button
                              onClick={() => handleApprove(req)}
                              style={{
                                backgroundColor: '#16a34a',
                                color: '#ffffff',
                                border: 'none',
                                borderRadius: '8px',
                                padding: '6px 12px',
                                fontSize: '0.82rem',
                                fontWeight: 700,
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                boxShadow: '0 2px 4px rgba(22, 163, 74, 0.2)'
                              }}
                              title="Approve permission and release owner contact details to buyer"
                            >
                              <CheckCircle2 size={14} /> Approve & Send
                            </button>

                            <button
                              onClick={() => handleReject(req)}
                              style={{
                                backgroundColor: '#ffffff',
                                color: '#dc2626',
                                border: '1px solid #fecaca',
                                borderRadius: '8px',
                                padding: '6px 10px',
                                fontSize: '0.82rem',
                                fontWeight: 600,
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px'
                              }}
                              title="Decline request"
                            >
                              <XCircle size={14} /> Decline
                            </button>
                          </>
                        ) : isApproved ? (
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ fontSize: '0.8rem', color: '#16a34a', fontWeight: 600 }}>
                              ✓ Unlocked
                            </span>
                            <button
                              onClick={() => handleReject(req)}
                              style={{
                                backgroundColor: 'transparent',
                                color: '#94a3b8',
                                border: 'none',
                                fontSize: '0.75rem',
                                cursor: 'pointer',
                                textDecoration: 'underline'
                              }}
                            >
                              Revoke
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleApprove(req)}
                            style={{
                              backgroundColor: '#f1f5f9',
                              color: '#475569',
                              border: '1px solid #cbd5e1',
                              borderRadius: '6px',
                              padding: '4px 8px',
                              fontSize: '0.75rem',
                              cursor: 'pointer'
                            }}
                          >
                            Re-Approve
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
