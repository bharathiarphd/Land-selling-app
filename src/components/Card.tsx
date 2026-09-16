import type { HTMLAttributes } from 'react';
import styles from './Card.module.css';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  noPadding?: boolean;
}

export function Card({ children, className = '', noPadding = false, ...props }: CardProps) {
  return (
    <div className={`${styles.card} ${className}`} {...props}>
      {noPadding ? children : <div className={styles.body}>{children}</div>}
    </div>
  );
}
