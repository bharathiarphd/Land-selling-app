import React from 'react';
import { X } from 'lucide-react';
import type { FilterOptions } from '../../utils/searchUtils';
import { useLanguage } from '../../context/LanguageContext';
import styles from './SearchComponents.module.css';

interface ActiveFilterChipsProps {
  filters: FilterOptions;
  removeFilter: (key: keyof FilterOptions, valueToRemove?: string | number) => void;
  clearAll: () => void;
  resultCount: number;
}

export const ActiveFilterChips: React.FC<ActiveFilterChipsProps> = ({ filters, removeFilter, clearAll, resultCount }) => {
  const { t, language } = useLanguage();
  
  const formatPrice = (val: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);
  };

  const hasFilters = Object.entries(filters).some(([k, v]) => {
    if (k === 'keyword' || k === 'query') return false;
    if (Array.isArray(v)) return v.length > 0;
    return v !== undefined && v !== '';
  });

  const translateAreaUnit = (unit: string) => {
    switch (unit.toLowerCase()) {
      case 'sq.ft': return t('units.sqft');
      case 'sq.m': return t('units.sqm');
      case 'cent': return t('units.cent');
      case 'acre': return t('units.acre');
      case 'ground': return t('units.ground');
      default: return unit;
    }
  };

  return (
    <div className={styles.activeChipsWrapper}>
      <div style={{ fontWeight: 'var(--font-weight-semibold)', marginRight: 'var(--spacing-4)' }}>
        {resultCount} {resultCount === 1 ? (language === 'ta' ? 'சொத்து கண்டறியப்பட்டது' : 'Property Found') : (language === 'ta' ? 'சொத்துகள் கண்டறியப்பட்டன' : 'Properties Found')}
      </div>
      
      {filters.district && (
        <div className={styles.activeChip}>
          {language === 'ta' && filters.district === 'Chennai' ? 'சென்னை' : language === 'ta' && filters.district === 'Villupuram' ? 'விழுப்புரம்' : language === 'ta' && filters.district === 'Tindivanam' ? 'திண்டிவனம்' : filters.district} <button className={styles.removeChipBtn} onClick={() => removeFilter('district')}><X size={14} /></button>
        </div>
      )}
      
      {filters.propertyType && filters.propertyType.map(pt => (
        <div key={pt} className={styles.activeChip}>
          {language === 'ta' && pt === 'Residential Land' ? t('categories.residentialLand') : language === 'ta' && pt === 'Agricultural Land' ? t('categories.agriculturalLand') : language === 'ta' && pt === 'Commercial Land' ? t('categories.commercialLand') : language === 'ta' && pt === 'Plot' ? t('categories.residentialPlot') : language === 'ta' && pt === 'Farm Land' ? t('categories.farmLand') : pt} <button className={styles.removeChipBtn} onClick={() => removeFilter('propertyType', pt)}><X size={14} /></button>
        </div>
      ))}
      
      {(filters.minPrice || filters.maxPrice) && (
        <div className={styles.activeChip}>
          {filters.minPrice ? formatPrice(filters.minPrice) : '0'} - {filters.maxPrice ? formatPrice(filters.maxPrice) : t('filters.any')} 
          <button className={styles.removeChipBtn} onClick={() => { removeFilter('minPrice'); removeFilter('maxPrice'); }}><X size={14} /></button>
        </div>
      )}
      
      {(filters.minArea || filters.maxArea) && (
        <div className={styles.activeChip}>
          {filters.minArea || '0'} - {filters.maxArea || t('filters.any')} {translateAreaUnit(filters.areaUnit || 'Sq.Ft')}
          <button className={styles.removeChipBtn} onClick={() => { removeFilter('minArea'); removeFilter('maxArea'); }}><X size={14} /></button>
        </div>
      )}

      {filters.utilities && filters.utilities.map(ut => (
        <div key={ut} className={styles.activeChip}>
          {language === 'ta' && ut === 'Electricity' ? 'மின்சாரம்' : language === 'ta' && ut === 'Water' ? 'தண்ணீர்' : language === 'ta' && ut === 'Borewell' ? 'ஆழ்துளை கிணறு' : ut} <button className={styles.removeChipBtn} onClick={() => removeFilter('utilities', ut)}><X size={14} /></button>
        </div>
      ))}

      {filters.verificationStatus && filters.verificationStatus.map(vs => (
        <div key={vs} className={styles.activeChip}>
          {vs === 'Verified Property' ? t('filters.verifiedProperty') : language === 'ta' ? 'சரிபார்க்கப்பட்ட விற்பனையாளர்' : vs} <button className={styles.removeChipBtn} onClick={() => removeFilter('verificationStatus', vs)}><X size={14} /></button>
        </div>
      ))}

      {hasFilters && (
        <button className={styles.clearAllBtn} onClick={clearAll}>{t('common.clearAll')}</button>
      )}
    </div>
  );
};
