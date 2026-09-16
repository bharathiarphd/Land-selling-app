import { Loader2 } from 'lucide-react';

export function Loading({ size = 24, className = '' }: { size?: number; className?: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 'var(--spacing-8)' }} className={className}>
      <Loader2 size={size} color="var(--color-primary)" style={{ animation: 'spin 1s linear infinite' }} />
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export function Skeleton({ width = '100%', height = '20px', borderRadius = 'var(--radius-md)' }) {
  return (
    <div style={{
      width,
      height,
      borderRadius,
      backgroundColor: 'var(--color-border)',
      animation: 'pulse 1.5s ease-in-out infinite'
    }}>
      <style>{`
        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.5; }
          100% { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
