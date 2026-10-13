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
  const [notRegistered, setNotRegistered] = useState(false);
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
    setNotRegistered(false);

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
        // 1. Check if user is registered first
        const check = await authService.checkUser(phone);
        if (!check.exists) {
          setIsLoading(false);
          setNotRegistered(true);
          setError(
            language === 'ta'
              ? 'இந்த கைபேசி எண் பதிவு செய்யப்படவில்லை. தயவுசெய்து முதலில் பதிவு செய்யவும்!'
              : 'You do not have an account yet. Please register first!'
          );
          return;
        }

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
        if (err.message && (err.message.includes('No account found') || err.message.includes('register') || err.message.includes('not found'))) {
          setNotRegistered(true);
        }
        setError(err.message || 'PIN Login failed. Please check your credentials or register.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleTestSimulator = async () => {
    if (!phone || !validatePhone(phone)) {
      setError(language === 'ta' ? 'தயவுசெய்து சரியான 10-இலக்க கைபேசி எண்ணை உள்ளிடவும்' : 'Please enter a valid 10-digit mobile number');
      return;
    }
    const res = await authService.sendSimulatorOtp(phone);
    sessionStorage.setItem('test_otp_hint', res.testOtp);
    const state = location.state as { from?: Location };
    navigate('/verify-otp', { state: { from: state?.from } });
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
            onClick={() => { setLoginMode('pin'); setError(''); }}
            style={{ flex: 1, padding: '0.5rem', border: 'none', background: 'none', borderBottom: loginMode === 'pin' ? '2px solid var(--primary-color)' : 'none', color: loginMode === 'pin' ? 'var(--primary-color)' : 'var(--text-secondary)', fontWeight: loginMode === 'pin' ? '600' : '400', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
          >
            <KeyRound size={18} /> PIN
          </button>
          <button 
            type="button"
            onClick={() => { setLoginMode('email'); setError(''); setNotRegistered(false); }}
            style={{ flex: 1, padding: '0.5rem', border: 'none', background: 'none', borderBottom: loginMode === 'email' ? '2px solid var(--primary-color)' : 'none', color: loginMode === 'email' ? 'var(--primary-color)' : 'var(--text-secondary)', fontWeight: loginMode === 'email' ? '600' : '400', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
          >
            <Mail size={18} /> Email
          </button>
        </div>

        {notRegistered && (
          <div style={{
            backgroundColor: '#eff6ff',
            border: '1px solid #93c5fd',
            borderRadius: '8px',
            padding: '1rem',
            marginBottom: '1.25rem',
            textAlign: 'center'
          }}>
            <p style={{ margin: '0 0 0.5rem 0', color: '#1e40af', fontWeight: 600, fontSize: '0.95rem' }}>
              {language === 'ta' ? '⚠️ இந்த எண் இன்னும் பதிவு செய்யப்படவில்லை' : '⚠️ No account found for this mobile number'}
            </p>
            <p style={{ margin: '0 0 0.85rem 0', color: '#3b82f6', fontSize: '0.85rem' }}>
              {language === 'ta' 
                ? 'முதல் முறை பயனரா? மின்னஞ்சல் மற்றும் 4-இலக்க PIN உடன் பதிவு செய்யவும்.' 
                : 'First time logging in? Please register first with your email and 4-digit PIN.'}
            </p>
            <Button
              type="button"
              onClick={() => navigate('/register', { state: { phone } })}
              style={{ width: '100%', backgroundColor: '#2563eb' }}
            >
              {language === 'ta' ? 'இப்போது பதிவு செய்க (Register)' : 'Register First (Free)'}
            </Button>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {loginMode === 'phone' && (
            <>
              <label style={{ display: 'block', marginBottom: 'var(--spacing-2)', fontWeight: 'var(--font-weight-medium)' }}>
                {t('auth.mobileNumber')}
              </label>
              <div className={styles.phoneInputGroup} style={{ marginBottom: '1.25rem', display: 'flex', gap: '0.5rem' }}>
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
              {error && error.includes('Firebase') && (
                <div style={{ marginBottom: '1rem', textAlign: 'center' }}>
                  <button
                    type="button"
                    onClick={handleTestSimulator}
                    style={{
                      background: '#f8fafc',
                      border: '1px dashed #94a3b8',
                      color: '#475569',
                      padding: '6px 12px',
                      borderRadius: '6px',
                      fontSize: '0.8rem',
                      cursor: 'pointer'
                    }}
                  >
                    ⚡ Test using simulator code (123456)
                  </button>
                </div>
              )}
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
