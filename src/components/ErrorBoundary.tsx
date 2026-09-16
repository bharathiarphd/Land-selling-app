import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: 'var(--spacing-8)', textAlign: 'center', backgroundColor: 'var(--color-background)' }}>
          <AlertTriangle size={64} color="var(--color-error)" style={{ marginBottom: 'var(--spacing-4)' }} />
          <h1 className="h2" style={{ marginBottom: 'var(--spacing-2)' }}>Something went wrong.</h1>
          <p style={{ color: 'var(--color-text-secondary)', maxWidth: '500px', marginBottom: 'var(--spacing-6)' }}>
            We encountered an unexpected error while trying to display this page.
          </p>
          <button 
            onClick={() => window.location.reload()}
            style={{ padding: 'var(--spacing-3) var(--spacing-6)', backgroundColor: 'var(--color-primary)', color: 'white', border: 'none', borderRadius: 'var(--radius-md)', cursor: 'pointer', fontWeight: 'bold' }}
          >
            Refresh Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
