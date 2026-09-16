
import { Heart, MapPin, Maximize, Map } from 'lucide-react';
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
        </div>

        {/* Premium/Featured Badge - Mock logic for Phase 17 */}
        {(property.id === 'prop-1' || property.price > 10000000) && (
          <div style={{ position: 'absolute', top: '12px', right: '12px', zIndex: 10, backgroundColor: '#f59e0b', color: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
            ★ PREMIUM
          </div>
        )}

        {/* Favorite Button */}
        <button 
          className={styles.favoriteBtn}
          onClick={(e) => {
            e.preventDefault();
            onFavoriteClick?.(property.id);
          }}
          aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
        >
          <Heart size={20} fill={isFavorite ? "var(--color-error)" : "none"} color={isFavorite ? "var(--color-error)" : "currentColor"} />
        </button>
      </div>

      <div className={styles.content}>
        <div className={styles.header}>
          <div>
            <h3 className={styles.title}>{property.title}</h3>
            <div className={styles.location}>
              <MapPin size={14} />
              <span>{property.location}, {property.district}</span>
            </div>
          </div>
          <div className="price-text">{formatPrice(property.price)}</div>
        </div>

        <div className={styles.details}>
          <div className={styles.detailItem}>
            <Maximize size={16} />
            <span>{property.area} {property.areaUnit}</span>
          </div>
          <div className={styles.detailItem}>
            <Map size={16} />
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
