import React, { useState, useEffect } from 'react';
import { Heart, ArrowLeft, Search, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { wishlistUtils, formatCapitalizedName } from '../utils/wishlistUtils';
import { PropertyCard } from '../components/PropertyCard';
import { EmptyState } from '../components/EmptyState';
import { Button } from '../components/Button';
import type { Property } from '../data/mockProperties';

export default function Favorites() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { language } = useLanguage();
  const [wishedProps, setWishedProps] = useState<Property[]>([]);

  const loadWishes = () => {
    const list = wishlistUtils.getUserWishedProperties(user?.id);
    setWishedProps(list);
  };

  useEffect(() => {
    loadWishes();

    const handleUpdate = () => loadWishes();
    window.addEventListener('wishlist_updated', handleUpdate);
    return () => window.removeEventListener('wishlist_updated', handleUpdate);
  }, [user]);

  const handleToggleFavorite = (propId: string) => {
    const prop = wishedProps.find(p => p.id === propId);
    if (prop) {
      wishlistUtils.toggleWish(prop, user || undefined);
      loadWishes();
    }
  };

  const displayName = formatCapitalizedName(user?.name || '');

  return (
    <div className="container" style={{ padding: 'var(--spacing-8) var(--spacing-4)', minHeight: '70vh' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-6)', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <button
            onClick={() => navigate(-1)}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--color-primary, #0284c7)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              fontSize: '0.88rem',
              fontWeight: 500,
              padding: 0,
              marginBottom: '8px'
            }}
          >
            <ArrowLeft size={16} />
            <span>{language === 'ta' ? 'பின்செல்க' : 'Back'}</span>
          </button>
          
          <h1 className="h2" style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: 0 }}>
            <span style={{ 
              width: '40px', 
              height: '40px', 
              borderRadius: '50%', 
              backgroundColor: '#fee2e2', 
              color: '#e11d48', 
              border: '1.5px solid #fecaca',
              display: 'inline-flex', 
              alignItems: 'center', 
              justifyContent: 'center' 
            }}>
              <Heart size={20} fill="#e11d48" />
            </span>
            <span>{language === 'ta' ? 'எனது விருப்பப்பட்டியல்' : 'My Wished Properties'}</span>
          </h1>

          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', marginTop: '6px' }}>
            {displayName ? `Curated wishlist for ${displayName} • ` : ''}
            {language === 'ta'
              ? 'நீங்கள் விரும்பிய மற்றும் வாங்க திட்டமிட்டுள்ள நிலங்கள்.'
              : 'Lands and properties you have liked and wished to purchase.'}
          </p>
        </div>

        <Button variant="outline" onClick={() => navigate('/search')} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Search size={16} /> {language === 'ta' ? 'கூடுதல் நிலங்களை தேட' : 'Explore More Lands'}
        </Button>
      </div>

      {/* Grid or Empty State */}
      {wishedProps.length === 0 ? (
        <EmptyState 
          title={language === 'ta' ? 'விருப்பப்பட்டியலில் சொத்துகள் எதுவும் இல்லை' : "Your Wishlist is Empty"} 
          description={language === 'ta' ? 'நீங்கள் விரும்பும் நிலங்களின் இதயக் குறியீட்டைத் (Heart Icon) தொட்டு இங்கு சேமிக்கலாம்.' : "Click the heart icon on any land or property to save it to your personal wishlist."}
          icon={<Heart size={48} color="#e11d48" />}
          actionText={language === 'ta' ? 'நிலங்களை உலாவுக' : "Browse Lands"}
          onAction={() => navigate('/search')}
        />
      ) : (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--spacing-4)', fontSize: '0.9rem', color: '#64748b' }}>
            <span>{wishedProps.length} {language === 'ta' ? 'விருப்ப நிலங்கள்' : 'wished properties'}</span>
            <span style={{ color: '#0284c7', fontWeight: 600 }}>
              💡 Click on any card to request owner contact from Admin
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 'var(--spacing-6)' }}>
            {wishedProps.map(property => (
              <PropertyCard
                key={property.id}
                property={property}
                isFavorite={true}
                onFavoriteClick={handleToggleFavorite}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
