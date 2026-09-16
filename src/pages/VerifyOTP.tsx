import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { MapPin } from 'lucide-react';
import { Button } from '../components/Button';
import { authService, type RegisterData } from '../services/authService';
import { useAuth } from '../context/AuthContext';
import styles from './Auth.module.css';

export default function VerifyOTP() {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(30);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const phone = sessionStorage.getItem('pending_auth_phone');

  useEffect(() => {
    if (!phone) {
      navigate('/login');
    }
  }, [phone, navigate]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (timer > 0) {
      interval = setInterval(() => setTimer(t => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);
    setError('');

    // Auto-focus next
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').substring(0, 6);
    if (pastedData) {
      const newOtp = [...otp];
      for (let i = 0; i < pastedData.length; i++) {
        newOtp[i] = pastedData[i];
      }
      setOtp(newOtp);
      inputRefs.current[Math.min(pastedData.length, 5)]?.focus();
    }
  };

  const handleResend = async () => {
    setTimer(30);
    setError('');
    // Mock re-send logic
    try {
      if (phone) await authService.sendOtp(phone);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpValue = otp.join('');
    
    if (otpValue.length !== 6) {
      setError('Please enter the complete 6-digit OTP');
      return;
    }

    if (!phone) return;

    setIsLoading(true);
    setError('');

    try {
      const pendingRegRaw = sessionStorage.getItem('pending_registration');
      const pendingReg: RegisterData | undefined = pendingRegRaw ? JSON.parse(pendingRegRaw) : undefined;
      
      const { user } = await authService.verifyOtp(phone, otpValue, pendingReg);
      
      // Update global context
      login(user);
      
      // Cleanup
      sessionStorage.removeItem('pending_auth_phone');
      sessionStorage.removeItem('pending_registration');

      // Navigate back to intended page or home
      const state = location.state as { from?: { pathname: string } };
      if (state?.from?.pathname) {
        navigate(state.from.pathname, { replace: true });
      } else {
        navigate('/', { replace: true });
      }

    } catch (err) {
      setError('Invalid OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`container ${styles.authContainer}`}>
      <div className={styles.logo}>
        <MapPin size={48} />
      </div>
      
      <div className={styles.header}>
        <h1 className={styles.title}>Verify Your Mobile Number</h1>
        <p className={styles.subtitle}>Enter the 6-digit OTP sent to +91 {phone?.replace(/(\d{5})(\d{5})/, '$1 $2')}</p>
      </div>

      <div className={styles.formCard}>
        <div style={{ padding: 'var(--spacing-3)', backgroundColor: 'var(--color-primary-light)', color: 'var(--color-primary-dark)', borderRadius: 'var(--radius-md)', textAlign: 'center', marginBottom: 'var(--spacing-6)', fontWeight: 'var(--font-weight-medium)' }}>
          Demo OTP: 123456
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'flex', gap: 'var(--spacing-2)', justifyContent: 'space-between', marginBottom: 'var(--spacing-6)' }}>
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={el => { inputRefs.current[index] = el; }}
                type="text"
                inputMode="numeric"
                value={digit}
                onChange={e => handleChange(index, e.target.value)}
                onKeyDown={e => handleKeyDown(index, e)}
                onPaste={handlePaste}
                style={{
                  width: '45px',
                  height: '56px',
                  fontSize: 'var(--font-size-2xl)',
                  textAlign: 'center',
                  borderRadius: 'var(--radius-md)',
                  border: `1px solid ${error ? 'var(--color-error)' : 'var(--color-border)'}`,
                  backgroundColor: 'var(--color-background)',
                  color: 'var(--color-text-primary)'
                }}
                maxLength={1}
                aria-label={`Digit ${index + 1}`}
              />
            ))}
          </div>

          {error && <p style={{ color: 'var(--color-error)', marginBottom: 'var(--spacing-4)', textAlign: 'center' }}>{error}</p>}

          <Button type="submit" style={{ width: '100%' }} disabled={isLoading || otp.join('').length !== 6}>
            {isLoading ? 'Verifying...' : 'Verify OTP'}
          </Button>
        </form>

        <div className={styles.footer}>
          {timer > 0 ? (
            <span>Resend OTP in {timer} seconds</span>
          ) : (
            <button onClick={handleResend} style={{ background: 'none', border: 'none', color: 'var(--color-primary)', fontWeight: 'var(--font-weight-medium)', cursor: 'pointer' }}>
              Resend OTP
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
