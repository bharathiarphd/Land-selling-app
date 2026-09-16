import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Search as SearchIcon, MapPin, Handshake, CheckCircle2, Home as HomeIcon } from 'lucide-react';
import { SearchBar } from '../components/SearchBar';
import { LocationSelector } from '../components/LocationSelector';
import { PropertyCard } from '../components/PropertyCard';
import { Button } from '../components/Button';
import { getAllProperties } from '../utils/propertyUtils';
import { useLanguage } from '../context/LanguageContext';
import styles from './Home.module.css';

export default function Home() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [search, setSearch] = useState('');
  const [favorites, setFavorites] = useState<string[]>([]);

  const handleFavoriteToggle = (id: string) => {
    setFavorites(prev => 
      prev.includes(id) ? prev.filter(fId => fId !== id) : [...prev, id]
    );
  };

  const handleSearch = () => {
    navigate('/search');
  };

  const categories = [
    { name: t('categories.residentialLand'), icon: '🏠' },
    { name: t('categories.agriculturalLand'), icon: '🌾' },
    { name: t('categories.commercialLand'), icon: '🏢' },
    { name: t('categories.residentialPlot'), icon: '📐' },
    { name: t('categories.farmLand'), icon: '🌳' },
    { name: t('categories.other'), icon: '🏞️' }
  ];

  // Hardcoded English mock locations. In real app, they will be mapped or fetched dynamically.
  // We can use localized labels if needed.
  const popularLocations = [
    { name: 'Chennai', count: 1240, label: t('language') === 'ta' ? 'சென்னை' : 'Chennai' },
    { name: 'Tindivanam', count: 128, label: t('language') === 'ta' ? 'திண்டிவனம்' : 'Tindivanam' },
    { name: 'Villupuram', count: 345, label: t('language') === 'ta' ? 'விழுப்புரம்' : 'Villupuram' },
    { name: 'Gingee', count: 86, label: t('language') === 'ta' ? 'செஞ்சி' : 'Gingee' },
    { name: 'Kanchipuram', count: 210, label: t('language') === 'ta' ? 'காஞ்சிபுரம்' : 'Kanchipuram' },
    { name: 'Madurai', count: 430, label: t('language') === 'ta' ? 'மதுரை' : 'Madurai' }
  ];

  return (
    <div className="container">
      
      {/* 1. Hero Section */}
      <section className={styles.hero}>
        <h1 className={styles.heroTitle}>{t('home.heroTitle')}</h1>
        <p className={styles.heroSubtitle}>{t('home.heroSubtitle')}</p>
        
        <div className={styles.locationWrapper}>
          <LocationSelector location={t('common.location')} />
        </div>

        <div className={styles.searchContainer}>
          <SearchBar 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onSearch={handleSearch}
            placeholder={t('home.searchPlaceholder')}
          />
        </div>

        <div className={styles.heroActions}>
          <Button onClick={handleSearch} size="lg">{t('home.searchButton')}</Button>
          <Button variant="outline" size="lg" onClick={() => navigate('/add-property')}>{t('home.addPropertyButton')}</Button>
        </div>
      </section>

      {/* 2. Quick Property Categories */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>{t('home.exploreProperties')}</h2>
        </div>
        <div className={styles.categoriesScroll}>
          {categories.map(cat => (
            <div key={cat.name} className={styles.categoryCard} onClick={() => navigate('/search')}>
              <div className={styles.categoryIcon}>{cat.icon}</div>
              <div className={styles.categoryName}>{cat.name}</div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. Featured Properties */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>{t('home.featuredProperties')}</h2>
        </div>
        <div className={styles.propertyGrid}>
          {getAllProperties().map(property => (
            <PropertyCard 
              key={property.id} 
              property={property} 
              isFavorite={favorites.includes(property.id)}
              onFavoriteClick={handleFavoriteToggle}
            />
          ))}
        </div>
      </section>

      {/* 4. Recently Added */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>{t('home.recentlyAdded')}</h2>
        </div>
        <div className={styles.propertyGrid}>
          {getAllProperties().slice(0, 4).map(property => (
            <PropertyCard 
              key={property.id} 
              property={property}
              isFavorite={favorites.includes(property.id)}
              onFavoriteClick={handleFavoriteToggle} 
            />
          ))}
        </div>
      </section>

      {/* 5. Popular Locations */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>{t('home.popularLocations')}</h2>
        </div>
        <div className={styles.locationsGrid}>
          {popularLocations.map(loc => (
            <div key={loc.name} className={styles.locationCard} onClick={() => navigate('/search')}>
              <div style={{ padding: '8px', backgroundColor: 'var(--color-primary-light)', borderRadius: 'var(--radius-full)', color: 'var(--color-primary)' }}>
                <MapPin size={20} />
              </div>
              <div>
                <div style={{ fontWeight: 'var(--font-weight-semibold)' }}>{loc.label || loc.name}</div>
                <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>{loc.count} {t('home.propertiesCount')}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 6. Verified Properties / Trust */}
      <section className={styles.section} style={{ backgroundColor: 'var(--color-surface)', padding: 'var(--spacing-8)', borderRadius: 'var(--radius-xl)' }}>
        <div className={styles.sectionHeader} style={{ textAlign: 'center' }}>
          <h2 className={styles.sectionTitle}>{t('home.verifiedProperties')}</h2>
          <p className={styles.sectionSubtitle}>{t('home.verifiedSubtitle')}</p>
        </div>
        <div className={styles.featureGrid}>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}><ShieldCheck size={32} /></div>
            <h3 className="h3" style={{ marginBottom: 'var(--spacing-2)' }}>{t('home.verifiedListings')}</h3>
            <p className="body-text" style={{ color: 'var(--color-text-secondary)' }}>{t('home.verifiedListingsDesc')}</p>
          </div>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}><HomeIcon size={32} /></div>
            <h3 className="h3" style={{ marginBottom: 'var(--spacing-2)' }}>{t('home.propertyInfo')}</h3>
            <p className="body-text" style={{ color: 'var(--color-text-secondary)' }}>{t('home.propertyInfoDesc')}</p>
          </div>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}><Handshake size={32} /></div>
            <h3 className="h3" style={{ marginBottom: 'var(--spacing-2)' }}>{t('home.trustedSellers')}</h3>
            <p className="body-text" style={{ color: 'var(--color-text-secondary)' }}>{t('home.trustedSellersDesc')}</p>
          </div>
        </div>
      </section>

      {/* 7. Why Choose Us & How it Works */}
      <section className={styles.section}>
        <div className={styles.sectionHeader} style={{ textAlign: 'center' }}>
          <h2 className={styles.sectionTitle}>{t('home.howItWorks')}</h2>
        </div>
        <div className={styles.featureGrid}>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}><SearchIcon size={32} /></div>
            <h3 className="h3" style={{ marginBottom: 'var(--spacing-2)' }}>{t('home.step1')}</h3>
            <p className="body-text" style={{ color: 'var(--color-text-secondary)' }}>{t('home.step1Desc')}</p>
          </div>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}><MapPin size={32} /></div>
            <h3 className="h3" style={{ marginBottom: 'var(--spacing-2)' }}>{t('home.step2')}</h3>
            <p className="body-text" style={{ color: 'var(--color-text-secondary)' }}>{t('home.step2Desc')}</p>
          </div>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}><CheckCircle2 size={32} /></div>
            <h3 className="h3" style={{ marginBottom: 'var(--spacing-2)' }}>{t('home.step3')}</h3>
            <p className="body-text" style={{ color: 'var(--color-text-secondary)' }}>{t('home.step3Desc')}</p>
          </div>
        </div>
      </section>

      {/* 8. Call to Action */}
      <section className={styles.cta}>
        <h2 className={styles.ctaTitle}>{t('home.ctaTitle')}</h2>
        <p className={styles.ctaSubtitle}>{t('home.ctaSubtitle')}</p>
        <div className={styles.ctaActions}>
          <Button size="lg" style={{ backgroundColor: 'var(--color-surface)', color: 'var(--color-primary)' }} onClick={() => navigate('/search')}>{t('home.searchButton')}</Button>
          <Button variant="outline" size="lg" style={{ borderColor: 'var(--color-surface)', color: 'var(--color-surface)' }} onClick={() => navigate('/add-property')}>{t('nav.addProperty')}</Button>
        </div>
      </section>

    </div>
  );
}
