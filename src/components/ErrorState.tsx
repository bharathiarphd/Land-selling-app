
import { AlertTriangle } from 'lucide-react';
import { Button } from './Button';

interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
}

export function ErrorState({ 
  title = 'Something went wrong', 
  description = 'We encountered an error while trying to process your request. Please try again.', 
  onRetry 
}: ErrorStateProps) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 'var(--spacing-8) var(--spacing-4)',
      textAlign: 'center',
      backgroundColor: 'var(--color-error-bg)',
      borderRadius: 'var(--radius-lg)',
      margin: 'var(--spacing-4) 0'
    }}>
      <AlertTriangle size={48} color="var(--color-error)" style={{ marginBottom: 'var(--spacing-4)' }} />
      <h3 className="h3" style={{ marginBottom: 'var(--spacing-2)', color: 'var(--color-error-text)' }}>{title}</h3>
      <p className="body-text" style={{ color: 'var(--color-error-text)', marginBottom: 'var(--spacing-6)', maxWidth: '400px' }}>
        {description}
      </p>
      {onRetry && (
        <Button variant="danger" onClick={onRetry}>Try Again</Button>
      )}
    </div>
  );
}
