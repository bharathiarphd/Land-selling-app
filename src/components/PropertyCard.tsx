import React from 'react';
import { Heart, MapPin, Maximize, Map, TrendingDown, Sparkles } from 'lucide-react';
import { Card } from './Card';
import { Badge } from './Badge';
import { Button } from './Button';
import type { Property } from '../data/mockProperties';
import { Link } from 'react-router-dom';
import styles from './PropertyCard.module.css';

interface PropertyCardProps {
  property: Property;
  isFavorite?: boolean;
  onFavoriteClick?: (id: string) => void;
}

export function PropertyCard({ property, isFavorite = false, onFavoriteClick }: PropertyCardProps) {
  // Simple formatter for Indian Rupee
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const isReduced = Boolean(
    property.isPriceReduced || 
    (property.originalPrice && property.originalPrice > property.price)
  );

  const reducedDifference = property.originalPrice && property.originalPrice > property.price
    ? property.originalPrice - property.price
    : property.reducedAmount || 0;

  return (
    <Card noPadding>
      <div className={styles.imageContainer}>
        <img 
          src={property.images[0] || 'https://placehold.co/600x400/e2e8f0/64748b?text=No+Image'} 
          alt={property.title} 
          className={styles.image}
        />
        
        <div className={styles.badges}>
          {property.approval && (
            <Badge variant={property.approval === 'Unapproved' ? 'error' : 'success'}>
              {property.approval} Approved
            </Badge>
          )}

          {/* Amount Reduced Islet Pill */}
          {isReduced && (
            <div className={styles.priceReducedIslet}>
              <TrendingDown size={13} strokeWidth={2.5} />
              <span>
                {reducedDifference > 0 
                  ? `₹${reducedDifference.toLocaleString('en-IN')} OFF` 
                  : 'PRICE REDUCED'}
              </span>
            </div>
          )}
        </div>

        {/* Premium/Featured Badge */}
        {(property.id === 'prop-1' || property.price > 10000000) && (
          <div style={{ position: 'absolute', top: '12px', right: '48px', zIndex: 10, backgroundColor: '#f59e0b', color: 'white', padding: '3px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px', boxShadow: '0 2px 4px rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.4)' }}>
            <Sparkles size={12} /> PREMIUM
          </div>
        )}

        {/* Favorite / Wishlist Button with defined border */}
        <button 
          className={styles.favoriteBtn}
          onClick={(e) => {
            e.preventDefault();
            onFavoriteClick?.(property.id);
          }}
          aria-label={isFavorite ? "Remove from wishlist" : "Add to wishlist"}
          title={isFavorite ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart size={18} fill={isFavorite ? "var(--color-error)" : "none"} color={isFavorite ? "var(--color-error)" : "currentColor"} />
        </button>
      </div>

      <div className={styles.content}>
        <div className={styles.header}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h3 className={styles.title} style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {property.title}
            </h3>
            <div className={styles.location}>
              <span className={styles.iconBox}>
                <MapPin size={13} />
              </span>
              <span>{property.location}, {property.district}</span>
            </div>
          </div>

          <div className={styles.priceContainer}>
            {isReduced && property.originalPrice && (
              <span className={styles.originalPrice}>
                {formatPrice(property.originalPrice)}
              </span>
            )}
            <div className="price-text" style={{ fontSize: '1.15rem' }}>
              {formatPrice(property.price)}
            </div>
            {isReduced && reducedDifference > 0 && (
              <span className={styles.reducedBadgeInline}>
                Save ₹{reducedDifference.toLocaleString('en-IN')}
              </span>
            )}
          </div>
        </div>

        <div className={styles.details}>
          <div className={styles.detailItem}>
            <span className={styles.iconBox}>
              <Maximize size={13} />
            </span>
            <span>{property.area} {property.areaUnit}</span>
          </div>
          <div className={styles.detailItem}>
            <span className={styles.iconBox}>
              <Map size={13} />
            </span>
            <span>{property.propertyType}</span>
          </div>
        </div>

        <div className={styles.actions}>
          <Link to={`/property/${property.id}`} style={{ width: '100%', display: 'block' }}>
            <Button variant="outline" style={{ width: '100%' }}>View Details</Button>
          </Link>
        </div>
      </div>
    </Card>
  );
}
