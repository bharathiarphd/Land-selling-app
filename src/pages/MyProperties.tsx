import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, SlidersHorizontal, ArrowDownUp, MoreVertical, X, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/Button';
import { Select } from '../components/Select';
import { Modal } from '../components/Modal';
import { EmptyState } from '../components/EmptyState';
import { Toast } from '../components/Toast';
import { getUserProperties, deleteProperty, updatePropertyStatus } from '../utils/propertyUtils';
import type { Property } from '../data/mockProperties';
import { useLanguage } from '../context/LanguageContext';
import styles from './MyProperties.module.css';

export default function MyProperties() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [toast, setToast] = useState<{ message: string; variant: 'success' | 'error' | 'info' } | null>(null);
  const { t, language } = useLanguage();
  
  const [filters, setFilters] = useState({
    status: 'All',
    type: 'All'
  });
  
  const [sort, setSort] = useState('newest');
  const [dropdownOpenId, setDropdownOpenId] = useState<string | null>(null);
  const [propertyToDelete, setPropertyToDelete] = useState<Property | null>(null);

  useEffect(() => {
    if (user?.id) {
      // Simulate network delay
      setTimeout(() => {
        setProperties(getUserProperties(user.id));
        setLoading(false);
      }, 500);
    } else {
      setLoading(false);
    }
  }, [user]);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClick = () => setDropdownOpenId(null);
    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, []);

  // Stats
  const stats = useMemo(() => {
    return {
      total: properties.length,
      published: properties.filter(p => p.status === 'Available' || p.status === 'Published').length,
      drafts: properties.filter(p => p.status === 'Draft').length,
      pending: properties.filter(p => p.status === 'Pending').length,
      inactive: properties.filter(p => p.status === 'Inactive').length,
      sold: properties.filter(p => p.status === 'Sold').length,
    };
  }, [properties]);

  // Filter & Sort
  const filteredProperties = useMemo(() => {
    let result = properties;

    // Search
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p => 
        p.title.toLowerCase().includes(q) || 
        p.id.toLowerCase().includes(q) ||
        p.village.toLowerCase().includes(q) ||
        p.district.toLowerCase().includes(q) ||
        p.propertyType.toLowerCase().includes(q)
      );
    }

    // Filters
    if (filters.status !== 'All') {
      result = result.filter(p => {
        if (filters.status === 'Published') return p.status === 'Available' || p.status === 'Published';
        return p.status === filters.status;
      });
    }
    if (filters.type !== 'All') {
      result = result.filter(p => p.propertyType === filters.type);
    }

    // Sort
    return result.sort((a, b) => {
      if (sort === 'newest') return new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime();
      if (sort === 'oldest') return new Date(a.dateAdded).getTime() - new Date(b.dateAdded).getTime();
      if (sort === 'price-asc') return a.price - b.price;
      if (sort === 'price-desc') return b.price - a.price;
      if (sort === 'area-asc') return a.area - b.area;
      if (sort === 'area-desc') return b.area - a.area;
      return 0;
    });
  }, [properties, searchQuery, filters, sort]);

  const handleStatusChange = (id: string, status: any) => {
    if (updatePropertyStatus(id, status)) {
      setProperties(getUserProperties(user!.id));
      setToast({ message: `Listing marked as ${status.toLowerCase()}.`, variant: 'success' });
    }
  };

  const handleDeleteConfirm = () => {
    if (propertyToDelete) {
      if (deleteProperty(propertyToDelete.id)) {
        setProperties(getUserProperties(user!.id));
        setToast({ message: language === 'ta' ? 'சொத்து வெற்றிகரமாக நீக்கப்பட்டது.' : 'Property deleted successfully.', variant: 'success' });
      }
      setPropertyToDelete(null);
    }
  };

  const handleShare = (id: string) => {
    navigator.clipboard.writeText(`${window.location.origin}/property/${id}`);
    setToast({ message: language === 'ta' ? 'சொத்து இணைப்பு நகலெடுக்கப்பட்டது' : 'Property link copied', variant: 'info' });
  };

  const copyId = (id: string) => {
    navigator.clipboard.writeText(id);
    setToast({ message: language === 'ta' ? 'சொத்து ID நகலெடுக்கப்பட்டது' : 'Property ID copied', variant: 'info' });
  };

  const formatPrice = (val: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);
  };

  const getStatusColorClass = (status: string) => {
    const s = status.toLowerCase();
    if (s === 'available' || s === 'published') return styles['status-published'];
    if (s === 'draft') return styles['status-draft'];
    if (s === 'pending') return styles['status-pending'];
    if (s === 'rejected') return styles['status-rejected'];
    if (s === 'inactive') return styles['status-inactive'];
    if (s === 'sold') return styles['status-sold'];
    return styles['status-draft'];
  };

  if (user?.role === 'Buyer') {
    return (
      <div className="container" style={{ paddingTop: 'var(--spacing-16)' }}>
        <EmptyState 
          title={language === 'ta' ? 'விற்பனையாளர் கணக்கு தேவை' : "Seller Account Required"} 
          description={language === 'ta' ? 'பட்டியல்களை நிர்வகிக்க உங்களுக்கு விற்பனையாளர் அல்லது முகவர் கணக்கு தேவை.' : "You need a Seller or Agent account to manage listings."}
          icon={<User size={48} color="var(--color-text-muted)" />}
        />
        <div style={{ textAlign: 'center', marginTop: 'var(--spacing-4)' }}>
          <Button onClick={() => navigate('/profile')}>{language === 'ta' ? 'சுயவிவரத்திற்கு செல்ல' : 'Go to Profile'}</Button>
          <div style={{ marginTop: 'var(--spacing-4)' }}>
            <Button variant="outline" onClick={() => navigate('/search')}>{language === 'ta' ? 'சொத்துகளை உலாவு' : 'Browse Properties'}</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`container ${styles.container}`}>
      
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>{language === 'ta' ? 'எனது சொத்துகள்' : 'My Properties'}</h1>
          <p className={styles.subtitle}>{language === 'ta' ? 'உங்கள் நிலம் மற்றும் சொத்து பட்டியல்களை நிர்வகிக்கவும்.' : 'Manage your land and property listings.'}</p>
        </div>
        <div className={styles.headerActions}>
          <Button onClick={() => navigate('/add-property')}>
            <Plus size={18} style={{ marginRight: '4px' }} /> {language === 'ta' ? 'சொத்து சேர்க்க' : 'Add Property'}
          </Button>
        </div>
      </div>

      {!loading && properties.length > 0 && (
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <span className={styles.statValue}>{stats.total}</span>
            <span className={styles.statLabel}>Total Properties</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statValue}>{stats.published}</span>
            <span className={styles.statLabel}>Published</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statValue}>{stats.drafts}</span>
            <span className={styles.statLabel}>Drafts</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statValue}>{stats.pending}</span>
            <span className={styles.statLabel}>Pending</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statValue}>{stats.inactive}</span>
            <span className={styles.statLabel}>Inactive</span>
          </div>
        </div>
      )}

      <div className={styles.controlsBar}>
        <div className={styles.searchWrap}>
          <div style={{ position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '10px', color: 'var(--color-text-muted)' }} />
            <input 
              type="text" 
              placeholder={language === 'ta' ? 'தலைப்பு, ID, கிராமம் அல்லது வகையைத் தேடவும்' : "Search by title, ID, village or type"} 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{ width: '100%', padding: '10px 12px 10px 38px', borderRadius: 'var(--radius-full)', border: '1px solid var(--color-border)', outline: 'none' }}
            />
          </div>
        </div>
        <div className={styles.filterSortWrap}>
          <Button variant="outline" onClick={() => setIsFilterOpen(true)}>
            <SlidersHorizontal size={16} style={{ marginRight: '4px' }} /> {t('common.filter')}
          </Button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <ArrowDownUp size={16} color="var(--color-text-secondary)" />
            <Select 
              value={sort} 
              onChange={e => setSort(e.target.value)}
              options={language === 'ta' ? [
                { value: 'newest', label: 'புதியது முதலில்' },
                { value: 'oldest', label: 'பழையது முதலில்' },
                { value: 'price-asc', label: 'விலை: குறைவு முதல் அதிகம்' },
                { value: 'price-desc', label: 'விலை: அதிகம் முதல் குறைவு' },
              ] : [
                { value: 'newest', label: 'Newest First' },
                { value: 'oldest', label: 'Oldest First' },
                { value: 'price-asc', label: 'Price: Low to High' },
                { value: 'price-desc', label: 'Price: High to Low' },
              ]}
              style={{ padding: '8px', border: 'none', background: 'transparent', fontWeight: 'var(--font-weight-medium)' }}
            />
          </div>
        </div>
      </div>

      {(filters.status !== 'All' || filters.type !== 'All') && (
        <div className={styles.activeFilters}>
          {filters.status !== 'All' && (
            <div className={styles.filterChip}>
              {filters.status} <X size={14} className={styles.removeChip} onClick={() => setFilters({...filters, status: 'All'})} />
            </div>
          )}
          {filters.type !== 'All' && (
            <div className={styles.filterChip}>
              {filters.type} <X size={14} className={styles.removeChip} onClick={() => setFilters({...filters, type: 'All'})} />
            </div>
          )}
          <button className={styles.clearAllBtn} onClick={() => setFilters({ status: 'All', type: 'All' })}>Clear All</button>
        </div>
      )}

      {loading ? (
        <div style={{ padding: 'var(--spacing-16)', textAlign: 'center', color: 'var(--color-text-secondary)' }}>{language === 'ta' ? 'சொத்துகளை ஏற்றுகிறது...' : 'Loading properties...'}</div>
      ) : properties.length === 0 ? (
        <EmptyState 
          title={language === 'ta' ? 'நீங்கள் இன்னும் எந்த சொத்துகளையும் பட்டியலிடவில்லை.' : "You haven't listed any properties yet."} 
          description={language === 'ta' ? 'உங்கள் முதல் சொத்து பட்டியலை உருவாக்குவதன் மூலம் உங்கள் நிலத்தை விற்கத் தொடங்குங்கள்.' : "Start selling your land by creating your first property listing."}
          actionText={language === 'ta' ? 'உங்கள் சொத்தை சேர்க்க' : "Add Your Property"}
          onAction={() => navigate('/add-property')}
        />
      ) : filteredProperties.length === 0 ? (
        <EmptyState 
          title={language === 'ta' ? 'சொத்துகள் ஏதும் கிடைக்கவில்லை' : "No properties found"} 
          description={language === 'ta' ? 'உங்கள் தேடல் அல்லது வடிப்பான்களை மாற்ற முயற்சிக்கவும்.' : "Try changing your search or filters."}
          actionText={language === 'ta' ? 'வடிகட்டிகளை அழி' : "Clear Filters"}
          onAction={() => { setSearchQuery(''); setFilters({ status: 'All', type: 'All' }); }}
        />
      ) : (
        <div className={styles.propertyList}>
          {filteredProperties.map(p => (
            <div key={p.id} className={styles.propertyCard}>
              <div className={styles.cardImage}>
                <span className={`${styles.statusBadge} ${getStatusColorClass(p.status)}`}>
                  {p.status === 'Available' ? 'PUBLISHED' : p.status.toUpperCase()}
                </span>
                <img src={p.images[0] || 'https://via.placeholder.com/300x200?text=No+Image'} alt={p.title} />
              </div>
              <div className={styles.cardContent}>
                <div className={styles.cardHeader}>
                  <div>
                    <h3 className={styles.cardTitle}>{p.title}</h3>
                    <div className={styles.cardId} onClick={() => copyId(p.id)} style={{ cursor: 'pointer' }} title="Copy ID">
                      ID: {p.id.toUpperCase()}
                    </div>
                  </div>
                  <div className={styles.cardPrice}>{formatPrice(p.price)}</div>
                </div>
                
                <div className={styles.cardDetails}>
                  <span>{p.propertyType}</span> • 
                  <span>{p.area} {p.areaUnit}</span> • 
                  <span>{p.village}, {p.district}</span>
                </div>

                <div className={styles.cardActions}>
                  <div className={styles.actionBtns}>
                    {(p.status === 'Available' || p.status === 'Published') && (
                      <Button variant="outline" size="sm" onClick={() => navigate(`/property/${p.id}`)}>View Listing</Button>
                    )}
                    <Button variant="outline" size="sm" onClick={() => navigate(`/add-property?edit=${p.id}`)}>Edit</Button>
                  </div>

                  <div className={styles.moreMenuWrapper}>
                    <button className={styles.moreBtn} onClick={(e) => { e.stopPropagation(); setDropdownOpenId(dropdownOpenId === p.id ? null : p.id); }}>
                      <MoreVertical size={20} />
                    </button>
                    {dropdownOpenId === p.id && (
                      <div className={styles.dropdownMenu}>
                        {(p.status === 'Available' || p.status === 'Published') && (
                          <>
                            <button className={styles.dropdownItem} onClick={() => handleShare(p.id)}>{language === 'ta' ? 'பகிர்' : 'Share'}</button>
                            <button className={styles.dropdownItem} onClick={() => handleStatusChange(p.id, 'Sold')}>{language === 'ta' ? 'விற்கப்பட்டது எனக் குறி' : 'Mark as Sold'}</button>
                            <button className={styles.dropdownItem} onClick={() => handleStatusChange(p.id, 'Inactive')}>{language === 'ta' ? 'செயலற்றதாகக் குறி' : 'Mark as Inactive'}</button>
                          </>
                        )}
                        {p.status === 'Inactive' && (
                          <button className={styles.dropdownItem} onClick={() => handleStatusChange(p.id, 'Available')}>{language === 'ta' ? 'பட்டியலை செயல்படுத்து' : 'Activate Listing'}</button>
                        )}
                        <button className={`${styles.dropdownItem} ${styles.danger}`} onClick={(e) => { e.stopPropagation(); setPropertyToDelete(p); setDropdownOpenId(null); }}>
                          {language === 'ta' ? 'சொத்தை நீக்கு' : 'Delete Property'}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Filter Modal */}
      <Modal 
        isOpen={isFilterOpen} 
        onClose={() => setIsFilterOpen(false)}
        title="Filter Properties"
        isDrawerOnMobile
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)' }}>
          <Select 
            label="Status"
            value={filters.status}
            onChange={e => setFilters({...filters, status: e.target.value})}
            options={[
              { value: 'All', label: 'All Statuses' },
              { value: 'Published', label: 'Published' },
              { value: 'Draft', label: 'Draft' },
              { value: 'Pending', label: 'Pending' },
              { value: 'Inactive', label: 'Inactive' },
              { value: 'Sold', label: 'Sold' },
            ]}
          />
          <Select 
            label="Property Type"
            value={filters.type}
            onChange={e => setFilters({...filters, type: e.target.value})}
            options={[
              { value: 'All', label: 'All Types' },
              { value: 'Plot', label: 'Plot' },
              { value: 'Agricultural Land', label: 'Agricultural Land' },
              { value: 'Commercial Land', label: 'Commercial Land' },
              { value: 'Farm Land', label: 'Farm Land' },
            ]}
          />
          <Button onClick={() => setIsFilterOpen(false)} style={{ marginTop: 'var(--spacing-4)' }}>Apply Filters</Button>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!propertyToDelete}
        onClose={() => setPropertyToDelete(null)}
        title="Delete this property?"
      >
        <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--spacing-6)' }}>
          This action cannot be undone. The property will be permanently removed from your dashboard.
        </p>
        <div style={{ display: 'flex', gap: 'var(--spacing-4)' }}>
          <Button variant="outline" style={{ flex: 1 }} onClick={() => setPropertyToDelete(null)}>Cancel</Button>
          <Button style={{ flex: 1, backgroundColor: 'var(--color-error)' }} onClick={handleDeleteConfirm}>Delete</Button>
        </div>
      </Modal>

      {toast && <Toast message={toast.message} variant={toast.variant} onClose={() => setToast(null)} />}
    </div>
  );
}
