import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { KeyRound } from 'lucide-react';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { authService } from '../services/authService';
import { useAuth } from '../context/AuthContext';
import styles from './Auth.module.css';

export default function SetupPin() {
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (pin.length !== 4) {
      setError('PIN must be exactly 4 digits');
      return;
    }

    if (pin !== confirmPin) {
      setError('PINs do not match');
      return;
    }

    setIsLoading(true);

    try {
      if (user?.phone) {
        await authService.setPin(user.phone, pin);
      }
      localStorage.setItem('user_pin', pin);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('PIN set successfully:', pin);

      // Navigate back to intended page or home
      const state = location.state as { from?: { pathname: string } };
      if (state?.from?.pathname) {
        navigate(state.from.pathname, { replace: true });
      } else {
        navigate('/', { replace: true });
      }

    } catch (err: any) {
      setError(err.message || 'Failed to set PIN. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`container ${styles.authContainer}`}>
      <div className={styles.logo}>
        <KeyRound size={48} />
      </div>
      
      <div className={styles.header}>
        <h1 className={styles.title}>Set Login PIN</h1>
        <p className={styles.subtitle}>Create a 4-digit PIN for quick login in the future.</p>
      </div>

      <div className={styles.formCard}>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: 'var(--spacing-2)', fontWeight: 'var(--font-weight-medium)' }}>
              Enter 4-Digit PIN
            </label>
            <Input 
              type="password"
              placeholder="e.g. 1234"
              value={pin}
              onChange={e => {
                const val = e.target.value.replace(/\D/g, '').substring(0, 4);
                setPin(val);
                if (error) setError('');
              }}
              maxLength={4}
              style={{ letterSpacing: '0.5em', fontSize: '1.2rem', textAlign: 'center' }}
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: 'var(--spacing-2)', fontWeight: 'var(--font-weight-medium)' }}>
              Confirm PIN
            </label>
            <Input 
              type="password"
              placeholder="Re-enter PIN"
              value={confirmPin}
              onChange={e => {
                const val = e.target.value.replace(/\D/g, '').substring(0, 4);
                setConfirmPin(val);
                if (error) setError('');
              }}
              maxLength={4}
              style={{ letterSpacing: '0.5em', fontSize: '1.2rem', textAlign: 'center' }}
              error={error}
            />
          </div>

          <Button type="submit" style={{ width: '100%' }} disabled={isLoading}>
            {isLoading ? 'Saving...' : 'Set PIN'}
          </Button>
          
          <div style={{ marginTop: '1rem', textAlign: 'center' }}>
            <button 
              type="button" 
              onClick={() => {
                const state = location.state as { from?: { pathname: string } };
                navigate(state?.from?.pathname || '/', { replace: true });
              }}
              style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', textDecoration: 'underline' }}
            >
              Skip for now
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
