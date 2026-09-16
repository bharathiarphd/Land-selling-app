import React from 'react';
import { SearchX } from 'lucide-react';
import { Button } from './Button';

interface EmptyStateProps {
  title?: string;
  description?: string;
  actionText?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}

export function EmptyState({ 
  title = 'No Results Found', 
  description = 'Try adjusting your filters or searching another area.', 
  actionText, 
  onAction,
  icon = <SearchX size={48} color="var(--color-text-muted)" />
}: EmptyStateProps) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 'var(--spacing-8) var(--spacing-4)',
      textAlign: 'center'
    }}>
      <div style={{ marginBottom: 'var(--spacing-4)' }}>{icon}</div>
      <h3 className="h3" style={{ marginBottom: 'var(--spacing-2)' }}>{title}</h3>
      <p className="body-text" style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--spacing-6)', maxWidth: '400px' }}>
        {description}
      </p>
      {actionText && onAction && (
        <Button onClick={onAction}>{actionText}</Button>
      )}
    </div>
  );
}
