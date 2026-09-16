
import { MapPin, ChevronDown } from 'lucide-react';
import styles from './LocationSelector.module.css';

interface LocationSelectorProps {
  location?: string;
  onClick?: () => void;
  className?: string;
}

export function LocationSelector({ location = 'Select location', onClick, className = '' }: LocationSelectorProps) {
  return (
    <button className={`${styles.selector} ${className}`} onClick={onClick}>
      <MapPin size={16} className={styles.icon} />
      <span className={styles.text}>{location}</span>
      <ChevronDown size={16} className={styles.chevron} />
    </button>
  );
}
