
import { MapPinHouse } from 'lucide-react';
import styles from './Logo.module.css';

interface LogoProps {
  className?: string;
}

export function Logo({ className = '' }: LogoProps) {
  return (
    <div className={`${styles.logo} ${className}`}>
      <div className={styles.icon}>
        <MapPinHouse size={24} strokeWidth={2.5} />
      </div>
      <span>Land App</span>
    </div>
  );
}
