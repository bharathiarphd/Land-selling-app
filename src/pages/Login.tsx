import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { MapPin, Phone, Mail, KeyRound } from 'lucide-react';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { authService } from '../services/authService';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import styles from './Auth.module.css';

type LoginMode = 'phone' | 'email' | 'pin';

export default function Login() {
  const [loginMode, setLoginMode] = useState<LoginMode>('phone');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { t, language } = useLanguage();
  const { login } = useAuth();
  
  const navigate = useNavigate();
  const location = useLocation();

  const validatePhone = (p: string) => /^[6-9]\d{9}$/.test(p);
  const validateEmail = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (loginMode === 'phone') {
      if (!phone) {
        setError(language === 'ta' ? 'தயவுசெய்து உங்கள் கைபேசி எண்ணை உள்ளிடவும்' : 'Please enter your mobile number');
        return;
      }
      if (!validatePhone(phone)) {
        setError(language === 'ta' ? 'தயவுசெய்து சரியான 10-இலக்க கைபேசி எண்ணை உள்ளிடவும்' : 'Please enter a valid 10-digit mobile number');
        return;
      }

      setIsLoading(true);
      try {
        const result = await authService.sendOtp(phone);
        sessionStorage.setItem('pending_auth_phone', phone);
        if (result.isTestMode) {
          sessionStorage.setItem('test_otp_hint', result.testOtp || '123456');
        } else {
          sessionStorage.removeItem('test_otp_hint');
        }
        const state = location.state as { from?: Location };
        navigate('/verify-otp', { state: { from: state?.from } });
      } catch (err: any) {
        setError(err.message || 'Failed to send OTP. Please try again.');
      } finally {
        setIsLoading(false);
      }
    } else if (loginMode === 'email') {
      if (!email || !password) {
        setError('Please enter your email and password');
        return;
      }
      if (!validateEmail(email)) {
        setError('Please enter a valid email address');
        return;
      }

      setIsLoading(true);
      try {
        const user = await authService.loginWithEmail(email, password);
        login(user);
        const state = location.state as { from?: { pathname: string } };
        navigate(state?.from?.pathname || '/', { replace: true });
      } catch (err: any) {
        setError(err.message || 'Login failed');
      } finally {
        setIsLoading(false);
      }
    } else if (loginMode === 'pin') {
      if (!phone || !pin) {
        setError('Please enter your phone number and 4-digit PIN');
        return;
      }
      if (pin.length !== 4) {
        setError('PIN must be 4 digits');
        return;
      }

      setIsLoading(true);
      try {
        const user = await authService.loginWithPin(phone, pin);
        login(user);
        const state = location.state as { from?: { pathname: string } };
        navigate(state?.from?.pathname || '/', { replace: true });
      } catch (err: any) {
        setError(err.message || 'Login failed. Default PIN is 1234.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className={`container ${styles.authContainer}`}>
      <div className={styles.logo}>
        <MapPin size={48} />
      </div>
      
      <div className={styles.header}>
        <h1 className={styles.title}>{t('auth.login')}</h1>
        <p className={styles.subtitle}>{t('auth.loginSubtitle')}</p>
      </div>

      <div className={styles.formCard}>
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
          <button 
            type="button"
            onClick={() => { setLoginMode('phone'); setError(''); }}
            style={{ flex: 1, padding: '0.5rem', border: 'none', background: 'none', borderBottom: loginMode === 'phone' ? '2px solid var(--primary-color)' : 'none', color: loginMode === 'phone' ? 'var(--primary-color)' : 'var(--text-secondary)', fontWeight: loginMode === 'phone' ? '600' : '400', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
          >
            <Phone size={18} /> OTP
          </button>
          <button 
            type="button"
            onClick={() => { setLoginMode('email'); setError(''); }}
            style={{ flex: 1, padding: '0.5rem', border: 'none', background: 'none', borderBottom: loginMode === 'email' ? '2px solid var(--primary-color)' : 'none', color: loginMode === 'email' ? 'var(--primary-color)' : 'var(--text-secondary)', fontWeight: loginMode === 'email' ? '600' : '400', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
          >
            <Mail size={18} /> Email
          </button>
          <button 
            type="button"
            onClick={() => { setLoginMode('pin'); setError(''); }}
            style={{ flex: 1, padding: '0.5rem', border: 'none', background: 'none', borderBottom: loginMode === 'pin' ? '2px solid var(--primary-color)' : 'none', color: loginMode === 'pin' ? 'var(--primary-color)' : 'var(--text-secondary)', fontWeight: loginMode === 'pin' ? '600' : '400', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
          >
            <KeyRound size={18} /> PIN
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {loginMode === 'phone' && (
            <>
              <label style={{ display: 'block', marginBottom: 'var(--spacing-2)', fontWeight: 'var(--font-weight-medium)' }}>
                {t('auth.mobileNumber')}
              </label>
              <div className={styles.phoneInputGroup} style={{ marginBottom: '1rem', display: 'flex', gap: '0.5rem' }}>
                <div className={styles.countryCode} style={{ width: '60px' }}>
                  <Input value="+91" disabled />
                </div>
                <div className={styles.phoneNumber} style={{ flex: 1 }}>
                  <Input 
                    type="tel"
                    placeholder={t('auth.mobilePlaceholder')}
                    value={phone}
                    onChange={e => {
                      const val = e.target.value.replace(/\D/g, '').substring(0, 10);
                      setPhone(val);
                      if (error) setError('');
                    }}
                    error={error}
                    maxLength={10}
                  />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', alignItems: 'center', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary, #64748b)' }}>Quick Test Numbers:</span>
                <button
                  type="button"
                  onClick={() => { setPhone('8248843385'); setError(''); }}
                  style={{
                    backgroundColor: '#eff6ff',
                    color: '#1d4ed8',
                    border: '1px solid #bfdbfe',
                    borderRadius: '999px',
                    padding: '3px 10px',
                    fontSize: '0.78rem',
                    cursor: 'pointer',
                    fontWeight: 600
                  }}
                >
                  📱 8248843385
                </button>
                <button
                  type="button"
                  onClick={() => { setPhone('7904494617'); setError(''); }}
                  style={{
                    backgroundColor: '#f1f5f9',
                    color: '#475569',
                    border: '1px solid #cbd5e1',
                    borderRadius: '999px',
                    padding: '3px 10px',
                    fontSize: '0.78rem',
                    cursor: 'pointer',
                    fontWeight: 500
                  }}
                >
                  📱 7904494617
                </button>
              </div>
            </>
          )}

          {loginMode === 'email' && (
            <>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: 'var(--spacing-2)', fontWeight: 'var(--font-weight-medium)' }}>
                  Email Address
                </label>
                <Input 
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={e => { setEmail(e.target.value); if (error) setError(''); }}
                  error={error && !password ? error : ''}
                />
              </div>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: 'var(--spacing-2)', fontWeight: 'var(--font-weight-medium)' }}>
                  Password
                </label>
                <Input 
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={e => { setPassword(e.target.value); if (error) setError(''); }}
                  error={error && password ? error : ''}
                />
              </div>
            </>
          )}

          {loginMode === 'pin' && (
            <>
              <label style={{ display: 'block', marginBottom: 'var(--spacing-2)', fontWeight: 'var(--font-weight-medium)' }}>
                {t('auth.mobileNumber')}
              </label>
              <div className={styles.phoneInputGroup} style={{ marginBottom: '1rem', display: 'flex', gap: '0.5rem' }}>
                <div className={styles.countryCode} style={{ width: '60px' }}>
                  <Input value="+91" disabled />
                </div>
                <div className={styles.phoneNumber} style={{ flex: 1 }}>
                  <Input 
                    type="tel"
                    placeholder={t('auth.mobilePlaceholder')}
                    value={phone}
                    onChange={e => {
                      const val = e.target.value.replace(/\D/g, '').substring(0, 10);
                      setPhone(val);
                      if (error) setError('');
                    }}
                    error={error && !pin ? error : ''}
                    maxLength={10}
                  />
                </div>
              </div>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: 'var(--spacing-2)', fontWeight: 'var(--font-weight-medium)' }}>
                  4-Digit PIN
                </label>
                <Input 
                  type="password"
                  placeholder="Enter your 4-digit PIN"
                  value={pin}
                  onChange={e => { 
                    const val = e.target.value.replace(/\D/g, '').substring(0, 4);
                    setPin(val); 
                    if (error) setError(''); 
                  }}
                  error={error && pin ? error : ''}
                  maxLength={4}
                  style={{ letterSpacing: '0.5em', fontSize: '1.2rem', textAlign: 'center' }}
                />
              </div>
            </>
          )}

          <Button type="submit" style={{ width: '100%', marginTop: '1rem' }} disabled={isLoading}>
            {isLoading ? 'Processing...' : loginMode === 'phone' ? t('auth.sendOtp') : 'Login'}
          </Button>
        </form>

        <div id="recaptcha-container"></div>

        <div className={styles.footer}>
          {language === 'ta' ? 'நிலம் விற்பனை செயலியில் புதியவரா?' : 'New to Land Selling App?'} <Link to="/register" className={styles.link}>{t('auth.register')}</Link>
        </div>
      </div>
    </div>
  );
}
