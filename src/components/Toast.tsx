import { useEffect } from 'react';
import { CheckCircle, AlertCircle, Info, XCircle, X } from 'lucide-react';

export interface ToastProps {
  message: string;
  variant?: 'success' | 'error' | 'warning' | 'info';
  onClose?: () => void;
  duration?: number;
}

export function Toast({ message, variant = 'info', onClose, duration = 3000 }: ToastProps) {
  useEffect(() => {
    if (duration > 0 && onClose) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const config = {
    success: { icon: CheckCircle, bg: 'var(--color-success-bg)', color: 'var(--color-success-text)' },
    error: { icon: XCircle, bg: 'var(--color-error-bg)', color: 'var(--color-error-text)' },
    warning: { icon: AlertCircle, bg: 'var(--color-warning-bg)', color: 'var(--color-warning-text)' },
    info: { icon: Info, bg: 'var(--color-info-bg)', color: 'var(--color-info-text)' },
  };

  const { icon: Icon, bg, color } = config[variant];

  return (
    <div style={{
      position: 'fixed',
      bottom: 'calc(var(--bottom-nav-height) + var(--spacing-4))',
      left: '50%',
      transform: 'translateX(-50%)',
      backgroundColor: bg,
      color: color,
      padding: 'var(--spacing-3) var(--spacing-4)',
      borderRadius: 'var(--radius-lg)',
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--spacing-3)',
      boxShadow: 'var(--shadow-md)',
      zIndex: 100,
      width: 'max-content',
      maxWidth: '90vw'
    }}>
      <Icon size={20} />
      <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)' }}>
        {message}
      </span>
      {onClose && (
        <button onClick={onClose} style={{ color: color, padding: 'var(--spacing-1)' }}>
          <X size={16} />
        </button>
      )}
    </div>
  );
}
