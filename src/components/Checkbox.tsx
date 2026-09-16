import { forwardRef, type InputHTMLAttributes } from 'react';
import styles from './Form.module.css';

export interface CheckboxProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string | React.ReactNode;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, className = '', ...props }, ref) => {
    return (
      <label className={`${styles.checkboxWrapper} ${className}`}>
        <input
          type="checkbox"
          ref={ref}
          className={styles.checkboxInput}
          {...props}
        />
        <span className={styles.checkboxLabel}>{label}</span>
      </label>
    );
  }
);
Checkbox.displayName = 'Checkbox';
