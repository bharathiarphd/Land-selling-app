import { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { SlidersHorizontal, ArrowDownUp, Map as MapIcon, List as ListIcon } from 'lucide-react';
import { SearchBar } from '../components/SearchBar';
import { PropertyCard } from '../components/PropertyCard';
import { Button } from '../components/Button';
import { Modal } from '../components/Modal';
import { Select } from '../components/Select';
import { GoogleMap, type MarkerData } from '../components/GoogleMap';
import { getAllProperties } from '../utils/propertyUtils';
import { filterProperties, sortProperties, type SortOption, type FilterOptions } from '../utils/searchUtils';
import { FilterSections } from '../components/search/FilterSections';
import { QuickFilters } from '../components/search/QuickFilters';
import { ActiveFilterChips } from '../components/search/ActiveFilterChips';
import { useLanguage } from '../context/LanguageContext';
import styles from './Search.module.css';

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [visibleCount, setVisibleCount] = useState(10);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  
  const [draftFilters, setDraftFilters] = useState<FilterOptions>({});
  
  const appliedFilters: FilterOptions = useMemo(() => {
    const filters: FilterOptions = {};
    for (const [key, value] of searchParams.entries()) {
      if (['minPrice', 'maxPrice', 'minArea', 'maxArea', 'minRoadWidth'].includes(key)) {
        (filters as any)[key] = Number(value);
      } else if (['propertyType', 'features', 'utilities', 'documents', 'verificationStatus', 'sellerType'].includes(key)) {
        const arr = searchParams.getAll(key);
        if (arr.length > 0) (filters as any)[key] = arr;
      } else {
        (filters as any)[key] = value;
      }
    }
    return filters;
  }, [searchParams]);

  const currentSort = (searchParams.get('sort') as SortOption) || 'relevance';

  const results = useMemo(() => {
    const filtered = filterProperties(getAllProperties(), appliedFilters);
    return sortProperties(filtered, currentSort);
  }, [appliedFilters, currentSort]);

  useEffect(() => {
    if (isFilterOpen) {
      setDraftFilters(appliedFilters);
    }
  }, [isFilterOpen, appliedFilters]);

  const updateUrlParams = useCallback((newParams: Record<string, any>) => {
    const params = new URLSearchParams(searchParams);
    
    Object.entries(newParams).forEach(([key, value]) => {
      if (value === undefined || value === '' || value === 'All Properties' || value === 'All Districts' || (Array.isArray(value) && value.length === 0)) {
        params.delete(key);
      } else if (Array.isArray(value)) {
        params.delete(key);
        value.forEach(v => params.append(key, String(v)));
      } else {
        params.set(key, String(value));
      }
    });
    
    setVisibleCount(10);
    setSearchParams(params);
  }, [searchParams, setSearchParams]);

  const handleSearch = (keyword: string) => {
    updateUrlParams({ keyword });
  };

  const applyFilters = () => {
    updateUrlParams(draftFilters);
    setIsFilterOpen(false);
  };

  const clearAllFilters = () => {
    setSearchParams(new URLSearchParams());
    setDraftFilters({});
    setIsFilterOpen(false);
  };

  const removeFilter = (key: keyof FilterOptions, valueToRemove?: string | number) => {
    if (valueToRemove !== undefined && Array.isArray(appliedFilters[key])) {
      const current = (appliedFilters[key] as any[]) || [];
      updateUrlParams({ [key]: current.filter(f => f !== valueToRemove) });
    } else {
      updateUrlParams({ [key]: undefined });
    }
  };

  const handleFavoriteToggle = (id: string) => {
    setFavorites(prev => 
      prev.includes(id) ? prev.filter(fId => fId !== id) : [...prev, id]
    );
  };

  const mapMarkers: MarkerData[] = useMemo(() => {
    return results
      .filter(p => p.latitude && p.longitude)
      .map(p => ({
        id: p.id,
        lat: p.latitude!,
        lng: p.longitude!,
        title: p.title,
        onClick: () => navigate(`/property/${p.id}`)
      }));
  }, [results, navigate]);

  return (
    <div className={`container ${styles.searchPage}`}>
      
      <div className={styles.header}>
        <h1 className={styles.title}>{t('search.searchProperties')}</h1>
        
        <div className={styles.controlsRow}>
          <div style={{ flex: 1, minWidth: '280px' }}>
            <SearchBar 
              value={appliedFilters.keyword || appliedFilters.query || ''}
              onChange={e => handleSearch(e.target.value)}
              placeholder={language === 'ta' ? '"திண்டிவனம் அருகில் 20 லட்சத்திற்குள் வீட்டு மனை" என தேடுக' : 'Try "5 cent residential land near Tindivanam under 20 lakh"'}
            />
          </div>
          <div className={styles.actionButtons}>
            <div style={{ display: 'flex', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
              <button 
                onClick={() => setViewMode('list')}
                style={{ padding: '8px 12px', border: 'none', background: viewMode === 'list' ? 'var(--color-primary-light)' : 'transparent', color: viewMode === 'list' ? 'var(--color-primary-dark)' : 'var(--color-text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                <ListIcon size={16} /> <span className="hide-mobile">{language === 'ta' ? 'பட்டியல்' : 'List'}</span>
              </button>
              <button 
                onClick={() => setViewMode('map')}
                style={{ padding: '8px 12px', border: 'none', background: viewMode === 'map' ? 'var(--color-primary-light)' : 'transparent', color: viewMode === 'map' ? 'var(--color-primary-dark)' : 'var(--color-text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                <MapIcon size={16} /> <span className="hide-mobile">{language === 'ta' ? 'வரைபடம்' : 'Map'}</span>
              </button>
            </div>
            
            <Button className="mobileFilterBtn" variant="outline" onClick={() => setIsFilterOpen(true)}>
              <SlidersHorizontal size={18} style={{ marginRight: 'var(--spacing-2)' }} />
              {t('search.filters')}
            </Button>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)' }}>
              <ArrowDownUp size={18} color="var(--color-text-secondary)" />
              <Select 
                value={currentSort} 
                onChange={e => updateUrlParams({ sort: e.target.value })}
                style={{ minWidth: '160px' }}
                options={[
                  { value: 'relevance', label: language === 'ta' ? 'பொருத்தமானது' : 'Best Match' },
                  { value: 'newest', label: language === 'ta' ? 'புதியவை' : 'Newest First' },
                  { value: 'price-asc', label: language === 'ta' ? 'விலை: குறைவு முதல் அதிகம்' : 'Price: Low to High' },
                  { value: 'price-desc', label: language === 'ta' ? 'விலை: அதிகம் முதல் குறைவு' : 'Price: High to Low' },
                  { value: 'area-asc', label: language === 'ta' ? 'பரப்பளவு: குறைவு முதல் அதிகம்' : 'Area: Low to High' },
                  { value: 'area-desc', label: language === 'ta' ? 'பரப்பளவு: அதிகம் முதல் குறைவு' : 'Area: High to Low' }
                ]}
              />
            </div>
          </div>
        </div>

        <QuickFilters updateUrlParams={updateUrlParams} currentFilters={appliedFilters} />
        <ActiveFilterChips filters={appliedFilters} removeFilter={removeFilter} clearAll={clearAllFilters} resultCount={results.length} />
      </div>

      <div className={styles.mainContent}>
        {/* Desktop Sidebar Filters */}
        <aside className={styles.sidebar}>
          <div style={{ backgroundColor: 'var(--color-surface)', padding: 'var(--spacing-4)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-4)' }}>
              <h2 className="h3">{t('search.filters')}</h2>
              <button style={{ background: 'none', border: 'none', color: 'var(--color-text-secondary)', cursor: 'pointer', textDecoration: 'underline' }} onClick={clearAllFilters}>{t('common.resetFilters')}</button>
            </div>
            
            <FilterSections filters={draftFilters} setFilters={f => {
              setDraftFilters(f);
              updateUrlParams(f);
            }} />
          </div>
        </aside>

        {/* Results */}
        <section className={styles.results}>
          {results.length === 0 ? (
            <div style={{ padding: 'var(--spacing-8)', textAlign: 'center', backgroundColor: 'var(--color-surface)', borderRadius: 'var(--radius-lg)' }}>
              <h3 className="h3" style={{ marginBottom: 'var(--spacing-2)' }}>{t('common.noPropertiesFound')}</h3>
              <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--spacing-6)' }}>{language === 'ta' ? 'உங்கள் தேடல் நிபந்தனைகளை மாற்ற முயற்சிக்கவும்:' : 'Try adjusting your search criteria:'}</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--spacing-2)', justifyContent: 'center' }}>
                <Button variant="outline" onClick={() => removeFilter('minArea')}>{language === 'ta' ? 'குறைந்தபட்ச பரப்பளவை குறைக்கவும்' : 'Reduce minimum area'}</Button>
                <Button variant="outline" onClick={() => removeFilter('maxPrice')}>{language === 'ta' ? 'விலையை அதிகரிக்கவும்' : 'Increase budget'}</Button>
                <Button variant="outline" onClick={() => removeFilter('district')}>{language === 'ta' ? 'அருகிலுள்ள இடங்களை தேடவும்' : 'Search nearby locations'}</Button>
                <Button variant="outline" onClick={() => updateUrlParams({ propertyType: undefined })}>{language === 'ta' ? 'எந்த சொத்து வகையும்' : 'Any property type'}</Button>
              </div>
            </div>
          ) : viewMode === 'map' ? (
            <div style={{ height: '600px', width: '100%', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
              <GoogleMap 
                center={mapMarkers.length > 0 ? { lat: mapMarkers[0].lat, lng: mapMarkers[0].lng } : { lat: 12.9716, lng: 80.0415 }}
                zoom={9}
                markers={mapMarkers}
                style={{ width: '100%', height: '100%' }}
              />
            </div>
          ) : (
            <>
              <div className={styles.propertyGrid}>
                {results.slice(0, visibleCount).map(prop => (
                  <PropertyCard 
                    key={prop.id} 
                    property={prop} 
                    isFavorite={favorites.includes(prop.id)}
                    onFavoriteClick={handleFavoriteToggle}
                  />
                ))}
              </div>
              
              {visibleCount < results.length && (
                <div className={styles.loadMoreContainer}>
                  <Button variant="outline" size="lg" onClick={() => setVisibleCount(v => v + 10)}>
                    {language === 'ta' ? 'மேலும் ஏற்றுக' : 'Load More'}
                  </Button>
                </div>
              )}
            </>
          )}
        </section>
      </div>

      {/* Mobile Filter Drawer */}
      <Modal 
        isOpen={isFilterOpen} 
        onClose={() => setIsFilterOpen(false)} 
        title={t('search.filters')}
        isDrawerOnMobile={true}
        footer={
          <>
            <Button variant="outline" onClick={() => setDraftFilters({})}>{t('common.resetFilters')}</Button>
            <Button onClick={applyFilters} style={{ flex: 1 }}>{t('common.applyFilters')}</Button>
          </>
        }
      >
        <FilterSections filters={draftFilters} setFilters={setDraftFilters} />
      </Modal>

    </div>
  );
}
