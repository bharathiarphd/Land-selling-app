import { useState } from 'react';
import { Camera, X, ChevronLeft, ChevronRight } from 'lucide-react';
import styles from './ImageGallery.module.css';

interface ImageGalleryProps {
  images: string[];
  alt?: string;
}

export function ImageGallery({ images, alt = 'Property image' }: ImageGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [imgError, setImgError] = useState(false);

  const safeImages = images && images.length > 0 ? images : ['https://placehold.co/800x600/e2e8f0/64748b?text=No+Image+Available'];

  const handleNext = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentIndex((prev) => (prev === safeImages.length - 1 ? 0 : prev + 1));
  };

  const handlePrev = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentIndex((prev) => (prev === 0 ? safeImages.length - 1 : prev - 1));
  };

  return (
    <>
      <div className={styles.galleryWrapper}>
        <div className={styles.galleryContainer} onClick={() => setIsFullscreen(true)}>
          <img 
            src={imgError ? 'https://placehold.co/800x600/fee2e2/ef4444?text=Image+Load+Error' : safeImages[currentIndex]} 
            alt={`${alt} - view ${currentIndex + 1}`} 
            className={styles.mainImage}
            onError={() => setImgError(true)}
          />
          <div className={styles.imageCount}>
            <Camera size={16} />
            <span>{currentIndex + 1} / {safeImages.length}</span>
          </div>
        </div>
        
        {safeImages.length > 1 && (
          <div className={styles.thumbnailStrip}>
            {safeImages.map((img, idx) => (
              <img 
                key={idx}
                src={img}
                alt={`Thumbnail ${idx + 1}`}
                className={`${styles.thumbnail} ${idx === currentIndex ? styles.active : ''}`}
                onClick={() => { setCurrentIndex(idx); setImgError(false); }}
              />
            ))}
          </div>
        )}
      </div>

      {isFullscreen && (
        <div className={styles.fullscreenOverlay}>
          <div className={styles.fullscreenHeader}>
            <span>{currentIndex + 1} / {safeImages.length}</span>
            <button className={styles.closeBtn} onClick={() => setIsFullscreen(false)} aria-label="Close fullscreen">
              <X size={24} />
            </button>
          </div>
          
          <div className={styles.fullscreenContent}>
            {safeImages.length > 1 && (
              <button className={`${styles.navBtn} ${styles.navPrev}`} onClick={handlePrev} aria-label="Previous image">
                <ChevronLeft size={32} />
              </button>
            )}
            
            <img 
              src={imgError ? 'https://placehold.co/800x600/fee2e2/ef4444?text=Image+Load+Error' : safeImages[currentIndex]} 
              alt={`${alt} - view ${currentIndex + 1}`} 
              className={styles.fullscreenImage}
              onError={() => setImgError(true)}
            />
            
            {safeImages.length > 1 && (
              <button className={`${styles.navBtn} ${styles.navNext}`} onClick={handleNext} aria-label="Next image">
                <ChevronRight size={32} />
              </button>
            )}
          </div>
          
          <div className={styles.fullscreenFooter}>
            {safeImages.map((img, idx) => (
              <img 
                key={idx}
                src={img}
                alt={`Thumbnail ${idx + 1}`}
                className={`${styles.thumbnail} ${idx === currentIndex ? styles.active : ''}`}
                onClick={() => { setCurrentIndex(idx); setImgError(false); }}
              />
            ))}
          </div>
        </div>
      )}
    </>
  );
}
