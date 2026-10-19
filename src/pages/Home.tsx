import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ShieldCheck, Search as SearchIcon, MapPin, Handshake, CheckCircle2, 
  Home as HomeIcon, Heart, TrendingDown, Sparkles 
} from 'lucide-react';
import { SearchBar } from '../components/SearchBar';
import { LocationSelector } from '../components/LocationSelector';
import { PropertyCard } from '../components/PropertyCard';
import { Button } from '../components/Button';
import { getAllProperties, syncPropertiesFromBackend } from '../utils/propertyUtils';
import type { Property } from '../data/mockProperties';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { isAdminUser } from '../utils/adminAuth';
import { wishlistUtils } from '../utils/wishlistUtils';
import styles from './Home.module.css';

export default function Home() {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [properties, setProperties] = useState<Property[]>(getAllProperties());
  const [selectedCityFilter, setSelectedCityFilter] = useState<string>('All');

  const isAdmin = isAdminUser(user);

  const loadPropertiesAndWishes = () => {
    const all = getAllProperties();
    setProperties(all);
    const userWishIds = wishlistUtils.getUserWishIds(user?.id);
    setFavorites(userWishIds);
  };

  useEffect(() => {
    loadPropertiesAndWishes();
    syncPropertiesFromBackend().then(props => {
      setProperties(props);
      const userWishIds = wishlistUtils.getUserWishIds(user?.id);
      setFavorites(userWishIds);
    });

    const handleWishlistUpdated = () => {
      const userWishIds = wishlistUtils.getUserWishIds(user?.id);
      setFavorites(userWishIds);
    };

    window.addEventListener('wishlist_updated', handleWishlistUpdated);
    return () => window.removeEventListener('wishlist_updated', handleWishlistUpdated);
  }, [user]);

  const handleFavoriteToggle = (id: string) => {
    const prop = properties.find(p => p.id === id);
    if (prop) {
      wishlistUtils.toggleWish(prop, user || undefined);
      const updatedWishIds = wishlistUtils.getUserWishIds(user?.id);
      setFavorites(updatedWishIds);
    }
  };

  // Filter user wished properties (for non-admins)
  const wishedProperties = !isAdmin 
    ? properties.filter(p => favorites.includes(p.id))
    : [];

  // Filter properties with reduced amount / price drop
  const reducedProperties = properties.filter(
    p => p.isPriceReduced || (p.originalPrice && p.originalPrice > p.price)
  );

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

  // Dynamic location counts based on live properties
  const tamilNaduCityLabels: Record<string, string> = {
    'Chennai': 'சென்னை',
    'Tindivanam': 'திண்டிவனம்',
    'Villupuram': 'விழுப்புரம்',
    'Coimbatore': 'கோயம்புத்தூர்',
    'Madurai': 'மதுரை',
    'Kanchipuram': 'காஞ்சிபுரம்',
    'Salem': 'சேலம்',
    'Gingee': 'செஞ்சி',
    'Tiruchirappalli': 'திருச்சிராப்பள்ளி',
    'Pollachi': 'பொள்ளாச்சி',
    'Tirunelveli': 'திருநெல்வேலி',
    'Erode': 'ஈரோடு',
    'Vellore': 'வேலூர்',
    'Thanjavur': 'தஞ்சாவூர்',
    'Dindigul': 'திண்டுக்கல்',
    'Tiruppur': 'திருப்பூர்',
    'Hosur': 'ஓசூர்',
    'Karur': 'கரூர்',
    'Cuddalore': 'கடலூர்'
  };

  const getCityPropertyCount = (cityName: string) => {
    const q = cityName.toLowerCase().trim();
    return properties.filter(p => {
      const c = (p.city || '').toLowerCase().trim();
      const d = (p.district || '').toLowerCase().trim();
      const l = (p.location || '').toLowerCase().trim();
      const v = (p.village || '').toLowerCase().trim();
      return c === q || d === q || l.includes(q) || v.includes(q);
    }).length;
  };

  const defaultCities = ['Chennai', 'Tindivanam', 'Villupuram', 'Coimbatore', 'Madurai', 'Kanchipuram', 'Salem', 'Gingee', 'Pollachi'];
  
  // Extract all unique cities/districts from live user properties
  const propertyCities = Array.from(new Set(
    properties.map(p => p.city || p.district).filter(Boolean)
  )) as string[];

  const allCityNames = Array.from(new Set([...defaultCities, ...propertyCities]));

  const popularLocations = allCityNames.map(name => ({
    name,
    label: language === 'ta' && tamilNaduCityLabels[name] ? tamilNaduCityLabels[name] : name,
    count: getCityPropertyCount(name)
  })).sort((a, b) => b.count - a.count);

  // Filter properties on Home page when a city shortlink pill is selected
  const displayedProperties = selectedCityFilter === 'All'
    ? properties
    : properties.filter(p => {
        const q = selectedCityFilter.toLowerCase().trim();
        const c = (p.city || '').toLowerCase().trim();
        const d = (p.district || '').toLowerCase().trim();
        const l = (p.location || '').toLowerCase().trim();
        const v = (p.village || '').toLowerCase().trim();
        return c === q || d === q || l.includes(q) || v.includes(q);
      });

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

      {/* 1b. Customer & Account Holder Wished Properties (Not for Admin) */}
      {!isAdmin && wishedProperties.length > 0 && (
        <section className={styles.section} style={{ backgroundColor: '#fff1f2', padding: 'var(--spacing-6)', borderRadius: 'var(--radius-xl)', border: '1.5px solid #fecaca', marginBottom: 'var(--spacing-8)' }}>
          <div className={styles.sectionHeader} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
            <div>
              <h2 className={styles.sectionTitle} style={{ color: '#be123c', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                <Heart size={22} fill="#e11d48" color="#e11d48" />
                <span>{language === 'ta' ? 'உங்களுக்கு பிடித்த நிலங்கள் (விருப்பப்பட்டியல்)' : 'Your Wished & Liked Properties'}</span>
                <span style={{ backgroundColor: '#e11d48', color: '#ffffff', fontSize: '0.78rem', padding: '2px 8px', borderRadius: '12px', fontWeight: 700 }}>
                  {wishedProperties.length}
                </span>
              </h2>
              <p style={{ color: '#9f1239', fontSize: '0.85rem', margin: '4px 0 0' }}>
                {language === 'ta'
                  ? 'நீங்கள் விரும்பிய நிலங்கள் - உரிமையாளர் தொடர்பு விவரங்களை கோரலாம்.'
                  : 'Lands you liked. Request owner contact details or buy directly.'}
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={() => navigate('/favorites')} style={{ borderColor: '#fca5a5', color: '#be123c', fontWeight: 600 }}>
              {language === 'ta' ? 'அனைத்தையும் பார்க்க' : 'View Full Wishlist'} →
            </Button>
          </div>
          <div className={styles.propertyGrid} style={{ marginTop: 'var(--spacing-4)' }}>
            {wishedProperties.map(property => (
              <PropertyCard 
                key={property.id} 
                property={property} 
                isFavorite={true}
                onFavoriteClick={handleFavoriteToggle}
              />
            ))}
          </div>
        </section>
      )}

      {/* 1c. Amount Reduced Properties / Price Drop Deals with Islets */}
      {reducedProperties.length > 0 && (
        <section className={styles.section} style={{ backgroundColor: '#fef2f2', padding: 'var(--spacing-6)', borderRadius: 'var(--radius-xl)', border: '1px solid #fee2e2', marginBottom: 'var(--spacing-8)' }}>
          <div className={styles.sectionHeader} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
            <div>
              <h2 className={styles.sectionTitle} style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#b91c1c', margin: 0 }}>
                <TrendingDown size={22} color="#dc2626" />
                <span>{language === 'ta' ? 'விலை குறைக்கப்பட்ட நிலங்கள்' : 'Amount Reduced Properties'}</span>
                <span style={{ backgroundColor: '#dc2626', color: '#ffffff', fontSize: '0.72rem', padding: '2px 8px', borderRadius: '12px', fontWeight: 700, letterSpacing: '0.5px' }}>
                  🔥 {language === 'ta' ? 'விலை தள்ளுபடி' : 'PRICE DROPS'}
                </span>
              </h2>
              <p style={{ color: '#991b1b', fontSize: '0.85rem', margin: '4px 0 0' }}>
                {language === 'ta'
                  ? 'உரிமையாளர்களால் விலை குறைக்கப்பட்ட சிறப்பு சலுகை நிலங்கள்.'
                  : 'Recently discounted plots and lands with lowered prices.'}
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={() => navigate('/search')} style={{ borderColor: '#fca5a5', color: '#dc2626' }}>
              {language === 'ta' ? 'அனைத்து சலுகைகளையும் காண்க' : 'View All Deals'} →
            </Button>
          </div>
          <div className={styles.propertyGrid} style={{ marginTop: 'var(--spacing-4)' }}>
            {reducedProperties.map(property => (
              <PropertyCard 
                key={property.id} 
                property={property} 
                isFavorite={favorites.includes(property.id)}
                onFavoriteClick={handleFavoriteToggle}
              />
            ))}
          </div>
        </section>
      )}

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

      {/* 3. Featured & Listed Properties with Popular City Shortlinks */}
      <section className={styles.section}>
        <div className={styles.sectionHeader} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
          <div>
            <h2 className={styles.sectionTitle}>{t('home.featuredProperties')}</h2>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.88rem', margin: '4px 0 0' }}>
              {language === 'ta'
                ? 'பிரபல நகரங்களின் குறுக்குவழிகள் மூலம் நிலங்களை விரைவாக காண்க.'
                : 'Browse user properties in popular cities via quick shortlinks.'}
            </p>
          </div>
          {selectedCityFilter !== 'All' && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => navigate(`/search?city=${encodeURIComponent(selectedCityFilter)}`)}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
            >
              <span>{language === 'ta' ? `${selectedCityFilter} முடிவுகள் பார்க்க` : `View all in ${selectedCityFilter}`}</span> →
            </Button>
          )}
        </div>

        {/* Popular Cities Shortlinks Pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflowX: 'auto', paddingBottom: '12px', marginBottom: '16px' }}>
          <button
            onClick={() => setSelectedCityFilter('All')}
            style={{
              padding: '6px 14px',
              borderRadius: '20px',
              border: selectedCityFilter === 'All' ? '1.5px solid var(--color-primary)' : '1px solid var(--color-border)',
              backgroundColor: selectedCityFilter === 'All' ? 'var(--color-primary)' : 'var(--color-surface)',
              color: selectedCityFilter === 'All' ? '#ffffff' : 'var(--color-text-primary)',
              fontWeight: selectedCityFilter === 'All' ? 600 : 500,
              fontSize: '0.85rem',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <span>{language === 'ta' ? 'அனைத்து நகரங்கள்' : 'All Cities'}</span>
            <span style={{ 
              backgroundColor: selectedCityFilter === 'All' ? 'rgba(255,255,255,0.25)' : 'var(--color-border)',
              padding: '1px 6px',
              borderRadius: '10px',
              fontSize: '0.75rem'
            }}>
              {properties.length}
            </span>
          </button>

          {popularLocations.filter(loc => loc.count > 0 || defaultCities.slice(0, 6).includes(loc.name)).map(loc => {
            const isSelected = selectedCityFilter.toLowerCase() === loc.name.toLowerCase();
            return (
              <button
                key={loc.name}
                onClick={() => setSelectedCityFilter(isSelected ? 'All' : loc.name)}
                style={{
                  padding: '6px 14px',
                  borderRadius: '20px',
                  border: isSelected ? '1.5px solid var(--color-primary)' : '1px solid var(--color-border)',
                  backgroundColor: isSelected ? 'var(--color-primary)' : 'var(--color-surface)',
                  color: isSelected ? '#ffffff' : 'var(--color-text-primary)',
                  fontWeight: isSelected ? 600 : 500,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <span>{loc.label || loc.name}</span>
                <span style={{ 
                  backgroundColor: isSelected ? 'rgba(255,255,255,0.25)' : 'rgba(2, 132, 199, 0.1)',
                  color: isSelected ? '#ffffff' : 'var(--color-primary)',
                  padding: '1px 6px',
                  borderRadius: '10px',
                  fontSize: '0.75rem',
                  fontWeight: 700
                }}>
                  {loc.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Selected City Filter Banner */}
        {selectedCityFilter !== 'All' && (
          <div style={{ 
            marginBottom: '16px', 
            padding: '8px 14px', 
            backgroundColor: 'rgba(2, 132, 199, 0.08)', 
            borderRadius: '8px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            border: '1px solid rgba(2, 132, 199, 0.2)'
          }}>
            <span style={{ fontSize: '0.88rem', color: 'var(--color-primary-dark)', fontWeight: 600 }}>
              📍 {language === 'ta' ? `காண்பிக்கப்படும் நிலங்கள்:` : `Showing user properties in:`} <strong>{selectedCityFilter}</strong> ({displayedProperties.length} {t('home.propertiesCount')})
            </span>
            <button 
              onClick={() => setSelectedCityFilter('All')} 
              style={{ background: 'none', border: 'none', color: 'var(--color-primary)', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer', textDecoration: 'underline' }}
            >
              {language === 'ta' ? 'அனைத்தையும் காட்டு' : 'Show All'}
            </button>
          </div>
        )}

        <div className={styles.propertyGrid}>
          {displayedProperties.length === 0 ? (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: 'var(--spacing-8)', backgroundColor: 'var(--color-surface)', borderRadius: 'var(--radius-lg)' }}>
              <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--spacing-4)', fontSize: 'var(--font-size-base)' }}>
                {language === 'ta' ? `${selectedCityFilter} நகரில் இன்னும் நிலங்கள் பட்டியலிடப்படவில்லை.` : `No properties listed in ${selectedCityFilter} yet.`}
              </p>
              <Button onClick={() => navigate('/add-property')}>
                {t('common.addProperty') || 'List Your Land'}
              </Button>
            </div>
          ) : (
            displayedProperties.map(property => (
              <PropertyCard 
                key={property.id} 
                property={property} 
                isFavorite={favorites.includes(property.id)}
                onFavoriteClick={handleFavoriteToggle}
              />
            ))
          )}
        </div>
      </section>

      {/* 4. Recently Added */}
      {properties.length > 0 && (
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>{t('home.recentlyAdded')}</h2>
          </div>
          <div className={styles.propertyGrid}>
            {properties.slice(0, 4).map(property => (
              <PropertyCard 
                key={property.id} 
                property={property}
                isFavorite={favorites.includes(property.id)}
                onFavoriteClick={handleFavoriteToggle} 
              />
            ))}
          </div>
        </section>
      )}

      {/* 5. Popular Locations with Direct Shortlinks */}
      <section className={styles.section}>
        <div className={styles.sectionHeader} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
          <div>
            <h2 className={styles.sectionTitle}>{t('home.popularLocations')}</h2>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.88rem', margin: '4px 0 0' }}>
              {language === 'ta'
                ? 'பிரபல நகரங்களின் குறுக்குவழிகளை அழுத்தி அனைத்து பட்டியலிடப்பட்ட நிலங்களையும் காண்க.'
                : 'Click city shortlinks to instantly view listed properties in each location.'}
            </p>
          </div>
        </div>
        <div className={styles.locationsGrid}>
          {popularLocations.slice(0, 8).map(loc => (
            <div 
              key={loc.name} 
              className={styles.locationCard} 
              onClick={() => navigate(`/search?city=${encodeURIComponent(loc.name)}`)}
              title={`View properties in ${loc.label || loc.name}`}
              style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: 'var(--spacing-4)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                border: '1.5px solid var(--color-border)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ 
                  padding: '10px', 
                  backgroundColor: 'var(--color-primary-light)', 
                  borderRadius: 'var(--radius-full)', 
                  color: 'var(--color-primary)' 
                }}>
                  <MapPin size={22} />
                </div>
                <div>
                  <div style={{ fontWeight: 'var(--font-weight-semibold)', fontSize: '1rem' }}>
                    {loc.label || loc.name}
                  </div>
                  <div style={{ fontSize: 'var(--font-size-sm)', color: loc.count > 0 ? 'var(--color-primary)' : 'var(--color-text-secondary)', fontWeight: loc.count > 0 ? 600 : 400 }}>
                    {loc.count} {t('home.propertiesCount')}
                  </div>
                </div>
              </div>

              <div style={{
                color: 'var(--color-primary)',
                fontSize: '1.2rem',
                fontWeight: 'bold',
                paddingRight: '4px'
              }}>
                →
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
