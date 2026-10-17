import React, { useState, useEffect } from 'react';
import { 
  Heart, Search, RefreshCw, ArrowUpRight, Phone, MessageSquare, 
  Trash2, MapPin, Tag, Users, Flame, Eye, CheckCircle2, 
  Calendar, ShieldCheck, Download, Filter
} from 'lucide-react';
import { wishlistUtils, formatCapitalizedName } from '../../utils/wishlistUtils';
import type { WishItem } from '../../utils/wishlistUtils';
import { contactRequestUtils } from '../../utils/contactRequestUtils';
import { getAllProperties } from '../../utils/propertyUtils';
import type { Property } from '../../data/mockProperties';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Link } from 'react-router-dom';
import styles from './Admin.module.css';

export default function AdminWishlists() {
  const [wishes, setWishes] = useState<WishItem[]>([]);
  const [propertyStats, setPropertyStats] = useState<{ property: Property | undefined; count: number; users: WishItem[] }[]>([]);
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'properties' | 'individual'>('properties');
  const [notification, setNotification] = useState<string | null>(null);

  const loadData = () => {
    const all = wishlistUtils.getAllPlatformWishes();
    setWishes(all);
    const stats = wishlistUtils.getPropertyWishStats();
    setPropertyStats(stats);
  };

  useEffect(() => {
    loadData();
    window.addEventListener('wishlist_updated', loadData);
    return () => window.removeEventListener('wishlist_updated', loadData);
  }, []);

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleDeleteWish = (wishId: string) => {
    if (window.confirm('Are you sure you want to remove this customer wish record?')) {
      wishlistUtils.removeWish(wishId);
      loadData();
      showToast('Wish record removed successfully.');
    }
  };

  const handleCreateContactRequestForUser = async (wish: WishItem) => {
    const allProps = getAllProperties();
    const prop = allProps.find(p => p.id === wish.propertyId);
    
    await contactRequestUtils.createRequest({
      propertyId: wish.propertyId,
      propertyTitle: wish.propertyTitle,
      propertyLocation: wish.propertyLocation,
      propertyPrice: wish.propertyPrice,
      propertyImage: wish.propertyImage,
      sellerId: prop?.seller?.id || 'owner_default',
      sellerName: prop?.seller?.name || 'Land Owner',
      sellerPhone: prop?.seller?.phone || '9876543210',
      sellerType: prop?.seller?.type || 'Owner',
      buyerId: wish.userId,
      buyerName: formatCapitalizedName(wish.userName),
      buyerPhone: wish.userPhone || '9840123456',
      message: 'Admin initiated contact permit from customer wishlist page.'
    });

    showToast(`Contact Permission request generated for ${formatCapitalizedName(wish.userName)}!`);
  };

  // Filtered lists
  const filteredWishes = wishes.filter(w => {
    const q = search.toLowerCase();
    return (
      w.propertyTitle.toLowerCase().includes(q) ||
      w.propertyLocation.toLowerCase().includes(q) ||
      (w.userName && w.userName.toLowerCase().includes(q)) ||
      (w.userPhone && w.userPhone.includes(q)) ||
      w.userId.toLowerCase().includes(q)
    );
  });

  const filteredStats = propertyStats.filter(s => {
    const q = search.toLowerCase();
    const title = s.property?.title?.toLowerCase() || '';
    const loc = s.property?.location?.toLowerCase() || '';
    const hasMatchingUser = s.users.some(u => 
      u.userName.toLowerCase().includes(q) || u.userPhone.includes(q)
    );
    return title.includes(q) || loc.includes(q) || hasMatchingUser;
  });

  // Calculate high-level stats
  const totalWishes = wishes.length;
  const uniquePropertiesCount = propertyStats.length;
  const uniqueCustomersCount = new Set(wishes.map(w => w.userPhone || w.userId)).size;
  const priceReducedWishes = propertyStats.filter(s => s.property?.isPriceReduced).reduce((acc, s) => acc + s.count, 0);

  return (
    <div style={{ padding: '1.5rem 0' }}>
      {/* Toast Notification */}
      {notification && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          backgroundColor: '#0f172a',
          color: '#ffffff',
          padding: '12px 20px',
          borderRadius: '8px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          border: '1.5px solid #38bdf8'
        }}>
          <CheckCircle2 size={18} color="#38bdf8" />
          <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>{notification}</span>
        </div>
      )}

      {/* Page Header */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '10px',
              backgroundColor: '#ffe4e6',
              border: '2px solid #f43f5e',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#e11d48'
            }}>
              <Heart size={22} fill="#e11d48" />
            </div>
            <div>
              <h1 style={{ fontSize: '1.6rem', fontWeight: 800, margin: 0, color: 'var(--color-text, #0f172a)' }}>
                Customer Wished Properties Registry
              </h1>
              <p style={{ margin: 0, fontSize: '0.875rem', color: '#64748b' }}>
                Exclusive Admin View: Track all buyer & account holder liked properties, demand analytics, and purchase interest.
              </p>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Button variant="outline" size="sm" onClick={loadData} style={{ display: 'flex', alignItems: 'center', gap: '6px', border: '1.5px solid #cbd5e1' }}>
            <RefreshCw size={15} /> Refresh
          </Button>
          <div style={{
            display: 'inline-flex',
            borderRadius: '8px',
            border: '1.5px solid #e2e8f0',
            backgroundColor: '#f8fafc',
            padding: '2px'
          }}>
            <button
              onClick={() => setViewMode('properties')}
              style={{
                padding: '6px 14px',
                border: 'none',
                borderRadius: '6px',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: 'pointer',
                backgroundColor: viewMode === 'properties' ? '#ffffff' : 'transparent',
                color: viewMode === 'properties' ? '#0284c7' : '#64748b',
                boxShadow: viewMode === 'properties' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                transition: 'all 0.15s ease'
              }}
            >
              By Properties ({propertyStats.length})
            </button>
            <button
              onClick={() => setViewMode('individual')}
              style={{
                padding: '6px 14px',
                border: 'none',
                borderRadius: '6px',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: 'pointer',
                backgroundColor: viewMode === 'individual' ? '#ffffff' : 'transparent',
                color: viewMode === 'individual' ? '#0284c7' : '#64748b',
                boxShadow: viewMode === 'individual' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                transition: 'all 0.15s ease'
              }}
            >
              All Customer Logs ({wishes.length})
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          border: '1.5px solid #e2e8f0',
          padding: '1.25rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
        }}>
          <div style={{
            width: '46px',
            height: '46px',
            borderRadius: '10px',
            border: '1.5px solid #f43f5e',
            backgroundColor: '#fff1f2',
            color: '#e11d48',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Heart size={22} fill="#e11d48" />
          </div>
          <div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>{totalWishes}</div>
            <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '4px' }}>Total Customer Wishes</div>
          </div>
        </div>

        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          border: '1.5px solid #e2e8f0',
          padding: '1.25rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
        }}>
          <div style={{
            width: '46px',
            height: '46px',
            borderRadius: '10px',
            border: '1.5px solid #0284c7',
            backgroundColor: '#f0f9ff',
            color: '#0284c7',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <MapPin size={22} />
          </div>
          <div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>{uniquePropertiesCount}</div>
            <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '4px' }}>Distinct Lands Liked</div>
          </div>
        </div>

        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          border: '1.5px solid #e2e8f0',
          padding: '1.25rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
        }}>
          <div style={{
            width: '46px',
            height: '46px',
            borderRadius: '10px',
            border: '1.5px solid #16a34a',
            backgroundColor: '#f0fdf4',
            color: '#16a34a',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Users size={22} />
          </div>
          <div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>{uniqueCustomersCount}</div>
            <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '4px' }}>Active Wishing Buyers</div>
          </div>
        </div>

        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          border: '1.5px solid #e2e8f0',
          padding: '1.25rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
        }}>
          <div style={{
            width: '46px',
            height: '46px',
            borderRadius: '10px',
            border: '1.5px solid #ea580c',
            backgroundColor: '#fff7ed',
            color: '#ea580c',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Flame size={22} />
          </div>
          <div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>{priceReducedWishes}</div>
            <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '4px' }}>Price Drop Wishes (Hot)</div>
          </div>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div style={{
        backgroundColor: '#ffffff',
        border: '1.5px solid #e2e8f0',
        borderRadius: '12px',
        padding: '1rem',
        marginBottom: '1.5rem',
        display: 'flex',
        alignItems: 'center',
        gap: '1rem'
      }}>
        <div style={{
          width: '36px',
          height: '36px',
          borderRadius: '8px',
          border: '1.5px solid #cbd5e1',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#64748b',
          flexShrink: 0
        }}>
          <Search size={18} />
        </div>
        <input
          type="text"
          placeholder="Search by customer name, phone number, user ID, property title or district..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            flex: 1,
            border: 'none',
            outline: 'none',
            fontSize: '0.95rem',
            color: '#1e293b'
          }}
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            style={{
              background: 'none',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              fontSize: '0.85rem'
            }}
          >
            Clear
          </button>
        )}
      </div>

      {/* VIEW 1: Aggregated By Properties */}
      {viewMode === 'properties' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {filteredStats.length === 0 ? (
            <div style={{
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              border: '1.5px dashed #cbd5e1',
              padding: '3rem',
              textAlign: 'center',
              color: '#64748b'
            }}>
              <Heart size={42} style={{ color: '#cbd5e1', marginBottom: '1rem' }} />
              <h3>No Wished Properties Found</h3>
              <p>No customer has added matching properties to their wishlist yet.</p>
            </div>
          ) : (
            filteredStats.map((stat) => {
              const prop = stat.property;
              const isReduced = prop?.isPriceReduced || (prop?.originalPrice && prop?.originalPrice > prop?.price);
              const dropAmount = prop?.reducedAmount || (prop?.originalPrice ? prop.originalPrice - prop.price : 0);

              return (
                <div
                  key={prop?.id || Math.random()}
                  style={{
                    backgroundColor: '#ffffff',
                    borderRadius: '12px',
                    border: '1.5px solid #e2e8f0',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                    overflow: 'hidden'
                  }}
                >
                  {/* Property Banner Header */}
                  <div style={{
                    padding: '1.25rem',
                    borderBottom: '1px solid #e2e8f0',
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '1rem',
                    backgroundColor: '#f8fafc'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <img
                        src={prop?.images?.[0] || 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400'}
                        alt={prop?.title}
                        style={{
                          width: '80px',
                          height: '60px',
                          borderRadius: '8px',
                          objectFit: 'cover',
                          border: '1.5px solid #cbd5e1'
                        }}
                      />
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                          <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: '#0f172a' }}>
                            {prop?.title || 'Land Plot'}
                          </h3>
                          {/* Price Reduced Islet */}
                          {isReduced && (
                            <span style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              padding: '2px 8px',
                              borderRadius: '9999px',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              background: 'linear-gradient(135deg, #ef4444, #f97316)',
                              color: '#ffffff',
                              border: '1px solid #b91c1c'
                            }}>
                              <Flame size={12} />
                              Price Reduced: ₹{(dropAmount / 100000).toFixed(1)}L OFF
                            </span>
                          )}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '4px', fontSize: '0.85rem', color: '#64748b' }}>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                            <MapPin size={14} color="#0284c7" /> {prop?.location}, {prop?.district || 'Tamil Nadu'}
                          </span>
                          <span>•</span>
                          <strong style={{ color: '#0f172a' }}>₹{(Number(prop?.price || 0) / 100000).toFixed(2)} Lakhs</strong>
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '6px 14px',
                        borderRadius: '9999px',
                        backgroundColor: '#fff1f2',
                        border: '1.5px solid #fda4af',
                        color: '#e11d48',
                        fontWeight: 700,
                        fontSize: '0.875rem'
                      }}>
                        <Heart size={16} fill="#e11d48" />
                        <span>{stat.count} Customer Wish{stat.count > 1 ? 'es' : ''}</span>
                      </div>

                      <Link
                        to={`/property/${prop?.id}`}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '6px 12px',
                          borderRadius: '8px',
                          border: '1.5px solid #cbd5e1',
                          backgroundColor: '#ffffff',
                          color: '#0f172a',
                          fontSize: '0.85rem',
                          fontWeight: 600,
                          textDecoration: 'none'
                        }}
                      >
                        <Eye size={14} /> View Property
                      </Link>
                    </div>
                  </div>

                  {/* List of Wishing Customers */}
                  <div style={{ padding: '1rem 1.25rem' }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', color: '#64748b', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>
                      Customers Who Wished This Property ({stat.users.length}):
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0.75rem' }}>
                      {stat.users.map((u) => (
                        <div
                          key={u.id}
                          style={{
                            padding: '0.75rem 1rem',
                            borderRadius: '8px',
                            border: '1.5px solid #e2e8f0',
                            backgroundColor: '#f8fafc',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: '0.5rem'
                          }}
                        >
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <strong style={{ fontSize: '0.925rem', color: '#0f172a' }}>
                                {formatCapitalizedName(u.userName || 'Customer')}
                              </strong>
                              <span style={{
                                fontSize: '0.7rem',
                                padding: '1px 6px',
                                borderRadius: '4px',
                                backgroundColor: '#e2e8f0',
                                color: '#475569',
                                fontWeight: 600
                              }}>
                                {u.userRole || 'Buyer'}
                              </span>
                            </div>
                            <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <Phone size={12} />
                              <span>{u.userPhone || 'No phone'}</span>
                              <span>•</span>
                              <span>{new Date(u.createdAt).toLocaleDateString()}</span>
                            </div>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            {u.userPhone && (
                              <a
                                href={`tel:${u.userPhone}`}
                                title="Direct Call Customer"
                                style={{
                                  width: '32px',
                                  height: '32px',
                                  borderRadius: '6px',
                                  border: '1.5px solid #16a34a',
                                  backgroundColor: '#dcfce7',
                                  color: '#15803d',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  textDecoration: 'none'
                                }}
                              >
                                <Phone size={14} />
                              </a>
                            )}
                            <button
                              type="button"
                              onClick={() => handleCreateContactRequestForUser(u)}
                              title="Permit & Send Contact Request"
                              style={{
                                height: '32px',
                                padding: '0 8px',
                                borderRadius: '6px',
                                border: '1.5px solid #0284c7',
                                backgroundColor: '#e0f2fe',
                                color: '#0369a1',
                                fontSize: '0.75rem',
                                fontWeight: 600,
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px'
                              }}
                            >
                              <ShieldCheck size={14} /> Permit
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* VIEW 2: Individual Customer Log Table */}
      {viewMode === 'individual' && (
        <div style={{
          backgroundColor: '#ffffff',
          border: '1.5px solid #e2e8f0',
          borderRadius: '12px',
          overflow: 'hidden',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
        }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '700px' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1.5px solid #e2e8f0' }}>
                  <th style={{ padding: '12px 16px', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Property</th>
                  <th style={{ padding: '12px 16px', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Customer Name</th>
                  <th style={{ padding: '12px 16px', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Contact</th>
                  <th style={{ padding: '12px 16px', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Role</th>
                  <th style={{ padding: '12px 16px', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Wished Date</th>
                  <th style={{ padding: '12px 16px', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredWishes.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>
                      No wishes found matching search criteria.
                    </td>
                  </tr>
                ) : (
                  filteredWishes.map((w) => (
                    <tr key={w.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <img
                            src={w.propertyImage || 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=200'}
                            alt=""
                            style={{ width: '42px', height: '36px', borderRadius: '6px', objectFit: 'cover', border: '1px solid #cbd5e1' }}
                          />
                          <div>
                            <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '0.875rem' }}>{w.propertyTitle}</div>
                            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{w.propertyLocation} • ₹{(w.propertyPrice / 100000).toFixed(2)}L</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '12px 16px', fontWeight: 600, color: '#0f172a' }}>
                        {formatCapitalizedName(w.userName || 'Customer')}
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: '0.85rem', color: '#334155' }}>
                        {w.userPhone || '—'}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          padding: '2px 8px',
                          borderRadius: '4px',
                          backgroundColor: '#f1f5f9',
                          border: '1px solid #cbd5e1',
                          color: '#475569'
                        }}>
                          {w.userRole || 'Buyer'}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: '0.8rem', color: '#64748b' }}>
                        {new Date(w.createdAt).toLocaleString()}
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                          <button
                            type="button"
                            onClick={() => handleCreateContactRequestForUser(w)}
                            title="Generate Contact Permission"
                            style={{
                              padding: '5px 8px',
                              borderRadius: '6px',
                              border: '1.5px solid #0284c7',
                              backgroundColor: '#e0f2fe',
                              color: '#0284c7',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                          >
                            <ShieldCheck size={13} /> Grant Contact
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteWish(w.id)}
                            title="Delete Record"
                            style={{
                              width: '28px',
                              height: '28px',
                              borderRadius: '6px',
                              border: '1.5px solid #ef4444',
                              backgroundColor: '#fef2f2',
                              color: '#ef4444',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer'
                            }}
                          >
                            <Trash2 size={13} />
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
      )}
    </div>
  );
}
