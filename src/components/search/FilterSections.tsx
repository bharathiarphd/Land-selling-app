import React from 'react';
import { Select } from '../Select';
import { Input } from '../Input';
import { Checkbox } from '../Checkbox';
import type { FilterOptions } from '../../utils/searchUtils';
import { useLanguage } from '../../context/LanguageContext';
import styles from './SearchComponents.module.css';

interface FilterSectionsProps {
  filters: FilterOptions;
  setFilters: (filters: FilterOptions) => void;
}

export const FilterSections: React.FC<FilterSectionsProps> = ({ filters, setFilters }) => {
  const { t } = useLanguage();

  const updateFilter = (key: keyof FilterOptions, value: any) => {
    setFilters({ ...filters, [key]: value });
  };

  const toggleArrayFilter = (key: keyof FilterOptions, value: string) => {
    const current = (filters[key] as string[]) || [];
    if (current.includes(value)) {
      updateFilter(key, current.filter(v => v !== value));
    } else {
      updateFilter(key, [...current, value]);
    }
  };

  const propertyTypes = [
    { key: 'Residential Land', label: t('categories.residentialLand') },
    { key: 'Agricultural Land', label: t('categories.agriculturalLand') },
    { key: 'Commercial Land', label: t('categories.commercialLand') },
    { key: 'Plot', label: t('categories.residentialPlot') },
    { key: 'Farm Land', label: t('categories.farmLand') },
    { key: 'Industrial Land', label: t('categories.industrialLand') }
  ];

  return (
    <div className={styles.filterSectionsWrapper}>
      {/* Property Type */}
      <div className={styles.filterSection}>
        <h3 className={styles.filterSectionTitle}>{t('common.type')}</h3>
        <div className={styles.filterOptionsGrid}>
          {propertyTypes.map(type => (
            <Checkbox 
              key={type.key}
              label={type.label}
              checked={(filters.propertyType || []).includes(type.key)}
              onChange={() => toggleArrayFilter('propertyType', type.key)}
            />
          ))}
        </div>
      </div>

      {/* Location */}
      <div className={styles.filterSection}>
        <h3 className={styles.filterSectionTitle}>{t('common.location')}</h3>
        <Select 
          value={filters.district || ''} 
          onChange={e => updateFilter('district', e.target.value)}
          options={[
            {value: '', label: t('filters.allDistricts')}, 
            {value: 'Chennai', label: t('language') === 'ta' ? 'சென்னை' : 'Chennai'}, 
            {value: 'Coimbatore', label: t('language') === 'ta' ? 'கோயம்புத்தூர்' : 'Coimbatore'}, 
            {value: 'Villupuram', label: t('language') === 'ta' ? 'விழுப்புரம்' : 'Villupuram'}, 
            {value: 'Tindivanam', label: t('language') === 'ta' ? 'திண்டிவனம்' : 'Tindivanam'}
          ]}
          style={{ marginBottom: '8px' }}
        />
        <Input 
          placeholder={t('search.village') + ' / ' + t('search.locality')} 
          value={filters.locality || ''}
          onChange={e => updateFilter('locality', e.target.value)}
        />
      </div>

      {/* Price */}
      <div className={styles.filterSection}>
        <h3 className={styles.filterSectionTitle}>{t('common.price')} (₹)</h3>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
          <Input 
            type="number" placeholder={t('filters.min')} 
            value={filters.minPrice || ''} 
            onChange={e => updateFilter('minPrice', e.target.value ? Number(e.target.value) : undefined)} 
          />
          <Input 
            type="number" placeholder={t('filters.max')} 
            value={filters.maxPrice || ''} 
            onChange={e => updateFilter('maxPrice', e.target.value ? Number(e.target.value) : undefined)} 
          />
        </div>
        <div className={styles.quickOptions}>
          <button className={styles.quickChip} onClick={() => { updateFilter('minPrice', undefined); updateFilter('maxPrice', 500000); }}>{t('language') === 'ta' ? '₹5 லட்சத்திற்குள்' : 'Under ₹5L'}</button>
          <button className={styles.quickChip} onClick={() => { updateFilter('minPrice', 500000); updateFilter('maxPrice', 1000000); }}>₹5L - ₹10L</button>
          <button className={styles.quickChip} onClick={() => { updateFilter('minPrice', 1000000); updateFilter('maxPrice', 2500000); }}>₹10L - ₹25L</button>
          <button className={styles.quickChip} onClick={() => { updateFilter('minPrice', 2500000); updateFilter('maxPrice', 5000000); }}>₹25L - ₹50L</button>
          <button className={styles.quickChip} onClick={() => { updateFilter('minPrice', 5000000); updateFilter('maxPrice', undefined); }}>{t('language') === 'ta' ? '₹50 லட்சத்திற்கு மேல்' : 'Above ₹50L'}</button>
        </div>
      </div>

      {/* Area */}
      <div className={styles.filterSection}>
        <h3 className={styles.filterSectionTitle}>{t('common.area')}</h3>
        <div style={{ display: 'flex', gap: '8px' }}>
          <Input 
            type="number" placeholder={t('filters.min')} 
            value={filters.minArea || ''} 
            onChange={e => updateFilter('minArea', e.target.value ? Number(e.target.value) : undefined)} 
          />
          <Input 
            type="number" placeholder={t('filters.max')} 
            value={filters.maxArea || ''} 
            onChange={e => updateFilter('maxArea', e.target.value ? Number(e.target.value) : undefined)} 
          />
          <Select 
            value={filters.areaUnit || 'Sq.Ft'} 
            onChange={e => updateFilter('areaUnit', e.target.value)}
            options={[
              {value: 'Sq.Ft', label: t('units.sqft')}, 
              {value: 'Cent', label: t('units.cent')}, 
              {value: 'Acre', label: t('units.acre')}, 
              {value: 'Ground', label: t('units.ground')}
            ]}
          />
        </div>
      </div>

      {/* Road & Utilities */}
      <div className={styles.filterSection}>
        <h3 className={styles.filterSectionTitle}>{t('search.roadWidth')} & {t('propertyDetails.water')}</h3>
        <div className={styles.filterOptionsGrid}>
          {['Electricity', 'Water', 'Borewell', 'Fencing', 'Drainage'].map(util => (
            <Checkbox 
              key={util} label={t('language') === 'ta' && util === 'Electricity' ? 'மின்சாரம்' : t('language') === 'ta' && util === 'Water' ? 'தண்ணீர்' : t('language') === 'ta' && util === 'Borewell' ? 'ஆழ்துளை கிணறு' : t('language') === 'ta' && util === 'Fencing' ? 'வேலி' : t('language') === 'ta' && util === 'Drainage' ? 'வடிகால்' : util}
              checked={(filters.utilities || []).includes(util)}
              onChange={() => toggleArrayFilter('utilities', util)}
            />
          ))}
        </div>
        <div style={{ marginTop: '12px' }}>
          <Select 
            value={filters.minRoadWidth || ''} 
            onChange={e => updateFilter('minRoadWidth', e.target.value ? Number(e.target.value) : undefined)}
            options={[
              {value: '', label: t('filters.any')}, 
              {value: '10', label: '10+ ft'}, 
              {value: '20', label: '20+ ft'}, 
              {value: '30', label: '30+ ft'}, 
              {value: '40', label: '40+ ft'}
            ]}
          />
        </div>
      </div>

      {/* Documents & Verification */}
      <div className={styles.filterSection}>
        <h3 className={styles.filterSectionTitle}>{t('search.documents')} & {t('search.verification')}</h3>
        <div className={styles.filterOptionsGrid}>
          {['Patta', 'Chitta', 'EC', 'Sale Deed', 'FMB / Survey Sketch'].map(doc => (
            <Checkbox 
              key={doc} label={t('language') === 'ta' && doc === 'Patta' ? 'பட்டா' : t('language') === 'ta' && doc === 'Chitta' ? 'சிட்டா' : t('language') === 'ta' && doc === 'EC' ? 'வில்லங்கச் சான்றிதழ் (EC)' : t('language') === 'ta' && doc === 'Sale Deed' ? 'விற்பனை பத்திரம்' : t('language') === 'ta' && doc === 'FMB / Survey Sketch' ? 'FMB / சர்வே வரைபடம்' : doc}
              checked={(filters.documents || []).includes(doc)}
              onChange={() => toggleArrayFilter('documents', doc)}
            />
          ))}
          {['Verified Property', 'Verified Seller'].map(ver => (
            <Checkbox 
              key={ver} label={ver === 'Verified Property' ? t('filters.verifiedProperty') : t('language') === 'ta' ? 'சரிபார்க்கப்பட்ட விற்பனையாளர்' : ver}
              checked={(filters.verificationStatus || []).includes(ver)}
              onChange={() => toggleArrayFilter('verificationStatus', ver)}
            />
          ))}
        </div>
      </div>

      {/* Seller Type */}
      <div className={styles.filterSection}>
        <h3 className={styles.filterSectionTitle}>{t('search.sellerType')}</h3>
        <div className={styles.filterOptionsGrid}>
          {['Owner', 'Agent', 'Builder', 'Company'].map(type => (
            <Checkbox 
              key={type} label={t('language') === 'ta' && type === 'Owner' ? 'உரிமையாளர்' : t('language') === 'ta' && type === 'Agent' ? 'முகவர்' : t('language') === 'ta' && type === 'Builder' ? 'பில்டர்' : t('language') === 'ta' && type === 'Company' ? 'நிறுவனம்' : type}
              checked={(filters.sellerType || []).includes(type)}
              onChange={() => toggleArrayFilter('sellerType', type)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
