import { forwardRef, useState, type InputHTMLAttributes, type ReactNode } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import styles from './Form.module.css';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string | ReactNode;
  error?: string;
  helperText?: string;
  showPasswordToggle?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      showPasswordToggle = false,
      leftIcon,
      rightIcon,
      type,
      className = '',
      ...props
    },
    ref
  ) => {
    const isPasswordType = type === 'password';
    const enablePasswordToggle = showPasswordToggle || isPasswordType;
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);

    const actualType = isPasswordType
      ? isPasswordVisible
        ? 'text'
        : 'password'
      : type;

    return (
      <div className={styles.wrapper}>
        {label && <label className={styles.label}>{label}</label>}
        <div className={styles.inputContainer}>
          {leftIcon && <span className={styles.leftIcon}>{leftIcon}</span>}
          <input
            ref={ref}
            type={actualType}
            className={`${styles.input} ${error ? styles.error : ''} ${
              leftIcon ? styles.hasLeftIcon : ''
            } ${enablePasswordToggle || rightIcon ? styles.hasRightIcon : ''} ${className}`}
            {...props}
          />
          {enablePasswordToggle ? (
            <button
              type="button"
              className={styles.passwordToggleBtn}
              onClick={() => setIsPasswordVisible(!isPasswordVisible)}
              aria-label={isPasswordVisible ? 'Hide password' : 'Show password'}
              title={isPasswordVisible ? 'Hide password' : 'Show password'}
              tabIndex={-1}
            >
              {isPasswordVisible ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          ) : rightIcon ? (
            <span className={styles.rightIcon}>{rightIcon}</span>
          ) : null}
        </div>
        {error && <span className={styles.errorText}>{error}</span>}
        {!error && helperText && <span className={styles.helperText}>{helperText}</span>}
      </div>
    );
  }
);
Input.displayName = 'Input';

