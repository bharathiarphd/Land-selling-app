import React from 'react';
import { CheckCircle2, Home, LayoutDashboard, MapPin, Tag, TrendingDown } from 'lucide-react';
import type { FilterOptions } from '../../utils/searchUtils';
import { useLanguage } from '../../context/LanguageContext';
import styles from './SearchComponents.module.css';

interface QuickFiltersProps {
  updateUrlParams: (params: Record<string, any>) => void;
  currentFilters: FilterOptions;
}

export const QuickFilters: React.FC<QuickFiltersProps> = ({ updateUrlParams }) => {
  const { t, language } = useLanguage();
  return (
    <div className={styles.quickFiltersRow}>
      <button 
        className={styles.quickFilterBtn}
        onClick={() => updateUrlParams({ verificationStatus: ['Verified Property', 'Fully Verified'] })}
      >
        <CheckCircle2 size={16} color="var(--color-success)" /> {t('filters.verifiedProperty')}
      </button>
      <button 
        className={styles.quickFilterBtn}
        onClick={() => updateUrlParams({ sellerType: ['Owner'] })}
      >
        <Home size={16} /> {t('filters.ownerOnly')}
      </button>
      <button 
        className={styles.quickFilterBtn}
        onClick={() => updateUrlParams({ maxPrice: 2000000, minPrice: undefined })}
      >
        <Tag size={16} /> {t('filters.under20L')}
      </button>
      <button 
        className={styles.quickFilterBtn}
        onClick={() => updateUrlParams({ maxPrice: 5000000, minPrice: undefined })}
      >
        <Tag size={16} /> {language === 'ta' ? '₹50 லட்சத்திற்குள்' : 'Under ₹50L'}
      </button>
      <button 
        className={styles.quickFilterBtn}
        onClick={() => updateUrlParams({ propertyType: ['Residential Land', 'Residential Plot', 'House Site'] })}
      >
        <Home size={16} /> {language === 'ta' ? 'குடியிருப்பு' : 'Residential'}
      </button>
      <button 
        className={styles.quickFilterBtn}
        onClick={() => updateUrlParams({ propertyType: ['Agricultural Land', 'Farm Land'] })}
      >
        <LayoutDashboard size={16} /> {language === 'ta' ? 'விவசாய' : 'Agricultural'}
      </button>
      <button 
        className={styles.quickFilterBtn}
        onClick={() => updateUrlParams({ minArea: 5, maxArea: undefined, areaUnit: 'Cent' })}
      >
        <MapPin size={16} /> {language === 'ta' ? '5+ சென்ட்' : '5+ Cent'}
      </button>
      <button 
        className={styles.quickFilterBtn}
        onClick={() => updateUrlParams({ sort: 'newest' })}
      >
        <Tag size={16} /> {language === 'ta' ? 'புதியவை' : 'New Listings'}
      </button>
      <button 
        className={styles.quickFilterBtn}
        onClick={() => updateUrlParams({ sort: 'price-reduced' })}
      >
        <TrendingDown size={16} /> {language === 'ta' ? 'விலை குறைக்கப்பட்டது' : 'Price Reduced'}
      </button>
    </div>
  );
};
