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
  const districtCounts = properties.reduce<Record<string, number>>((acc, p) => {
    if (p.district) {
      acc[p.district] = (acc[p.district] || 0) + 1;
    }
    return acc;
  }, {});

  const locations = [
    { name: 'Chennai', label: t('language') === 'ta' ? 'சென்னை' : 'Chennai' },
    { name: 'Tindivanam', label: t('language') === 'ta' ? 'திண்டிவனம்' : 'Tindivanam' },
    { name: 'Villupuram', label: t('language') === 'ta' ? 'விழுப்புரம்' : 'Villupuram' },
    { name: 'Gingee', label: t('language') === 'ta' ? 'செஞ்சி' : 'Gingee' },
    { name: 'Kanchipuram', label: t('language') === 'ta' ? 'காஞ்சிபுரம்' : 'Kanchipuram' },
    { name: 'Madurai', label: t('language') === 'ta' ? 'மதுரை' : 'Madurai' }
  ];

  const popularLocations = locations.map(loc => ({
    ...loc,
    count: districtCounts[loc.name] || 0
  }));

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

      {/* 3. Featured Properties */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>{t('home.featuredProperties')}</h2>
        </div>
        <div className={styles.propertyGrid}>
          {properties.length === 0 ? (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: 'var(--spacing-8)', backgroundColor: 'var(--color-surface)', borderRadius: 'var(--radius-lg)' }}>
              <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--spacing-4)', fontSize: 'var(--font-size-base)' }}>
                {t('home.noProperties') || 'No properties listed yet.'}
              </p>
              <Button onClick={() => navigate('/add-property')}>
                {t('common.addProperty') || 'List Your Land'}
              </Button>
            </div>
          ) : (
            properties.map(property => (
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
