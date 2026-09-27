import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { MapPin } from 'lucide-react';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { authService } from '../services/authService';
import { useLanguage } from '../context/LanguageContext';
import styles from './Auth.module.css';

export default function Login() {
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { t, language } = useLanguage();
  
  const navigate = useNavigate();
  const location = useLocation();

  const validatePhone = (p: string) => /^[6-9]\d{9}$/.test(p);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

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
      await authService.sendOtp(phone);
      sessionStorage.setItem('pending_auth_phone', phone);
      const state = location.state as { from?: Location };
      navigate('/verify-otp', { state: { from: state?.from } });
    } catch (err: any) {
      setError(err.message || 'Failed to send OTP. Please try again.');
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
        <h1 className={styles.title}>{t('auth.login')}</h1>
        <p className={styles.subtitle}>{t('auth.loginSubtitle')}</p>
      </div>

      <div className={styles.formCard}>
        <form onSubmit={handleSubmit}>
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

          <Button type="submit" style={{ width: '100%' }} disabled={isLoading}>
            {isLoading ? (language === 'ta' ? 'OTP அனுப்பப்படுகிறது...' : 'Sending OTP...') : t('auth.sendOtp')}
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
