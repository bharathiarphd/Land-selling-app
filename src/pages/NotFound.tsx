import { useNavigate } from 'react-router-dom';
import { FileQuestion } from 'lucide-react';
import { Button } from '../components/Button';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '60vh',
      textAlign: 'center',
      padding: 'var(--spacing-8)'
    }}>
      <FileQuestion size={80} color="var(--color-text-muted)" style={{ marginBottom: 'var(--spacing-6)' }} />
      <h1 style={{ fontSize: 'var(--font-size-3xl)', marginBottom: 'var(--spacing-2)' }}>Page Not Found</h1>
      <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--spacing-8)', maxWidth: '400px' }}>
        The page you are looking for doesn't exist or has been moved.
      </p>
      <div style={{ display: 'flex', gap: 'var(--spacing-4)', flexWrap: 'wrap', justifyContent: 'center' }}>
        <Button onClick={() => navigate('/')}>Go Home</Button>
        <Button variant="outline" onClick={() => navigate('/search')}>Search Properties</Button>
      </div>
    </div>
  );
}
