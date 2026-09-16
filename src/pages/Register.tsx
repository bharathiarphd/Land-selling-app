import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { MapPin } from 'lucide-react';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { Select } from '../components/Select';
import { Checkbox } from '../components/Checkbox';
import { authService, type UserRole, type RegisterData } from '../services/authService';
import { useLanguage } from '../context/LanguageContext';
import styles from './Auth.module.css';

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    role: 'Buyer' as UserRole
  });
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const { t, language } = useLanguage();

  const navigate = useNavigate();

  const validatePhone = (p: string) => /^[6-9]\d{9}$/.test(p);
  const validateEmail = (e: string) => !e || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = language === 'ta' ? 'தயவுசெய்து உங்கள் பெயரை உள்ளிடவும்' : 'Please enter your name';
    if (!formData.phone) {
      newErrors.phone = language === 'ta' ? 'தயவுசெய்து உங்கள் கைபேசி எண்ணை உள்ளிடவும்' : 'Please enter your mobile number';
    } else if (!validatePhone(formData.phone)) {
      newErrors.phone = language === 'ta' ? 'தயவுசெய்து சரியான 10-இலக்க கைபேசி எண்ணை உள்ளிடவும்' : 'Please enter a valid 10-digit mobile number';
    }
    
    if (formData.email && !validateEmail(formData.email)) {
      newErrors.email = language === 'ta' ? 'தயவுசெய்து சரியான மின்னஞ்சலை உள்ளிடவும்' : 'Please enter a valid email address';
    }

    if (!acceptedTerms) {
      newErrors.terms = language === 'ta' ? 'விதிமுறைகள் மற்றும் நிபந்தனைகளை ஏற்கவும்' : 'Please accept the Terms & Conditions';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);

    try {
      // Mock OTP send
      await authService.sendOtp(formData.phone);
      
      // Store registration data to be consumed by verify-otp
      sessionStorage.setItem('pending_auth_phone', formData.phone);
      sessionStorage.setItem('pending_registration', JSON.stringify(formData as RegisterData));
      
      navigate('/verify-otp');
    } catch (err) {
      setErrors({ submit: language === 'ta' ? 'கணக்கை உருவாக்க முடியவில்லை. மீண்டும் முயற்சிக்கவும்.' : 'Unable to create account. Please try again.' });
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
        <h1 className={styles.title}>{t('auth.register')}</h1>
        <p className={styles.subtitle}>{t('auth.registerSubtitle')}</p>
      </div>

      <div className={styles.formCard}>
        <form onSubmit={handleSubmit}>
          
          <div style={{ marginBottom: 'var(--spacing-4)' }}>
            <Input 
              label={t('auth.name')}
              placeholder={language === 'ta' ? 'உங்கள் முழு பெயரை உள்ளிடவும்' : 'Enter your full name'}
              value={formData.name}
              onChange={e => { setFormData({...formData, name: e.target.value}); setErrors({...errors, name: ''}); }}
              error={errors.name}
            />
          </div>

          <label style={{ display: 'block', marginBottom: 'var(--spacing-2)', fontWeight: 'var(--font-weight-medium)' }}>
            {t('auth.mobileNumber')}
          </label>
          <div className={styles.phoneInputGroup}>
            <div className={styles.countryCode}>
              <Input value="+91" disabled />
            </div>
            <div className={styles.phoneNumber}>
              <Input 
                type="tel"
                placeholder={t('auth.mobilePlaceholder')}
                value={formData.phone}
                onChange={e => {
                  const val = e.target.value.replace(/\D/g, '').substring(0, 10);
                  setFormData({...formData, phone: val});
                  setErrors({...errors, phone: ''});
                }}
                error={errors.phone}
                maxLength={10}
              />
            </div>
          </div>

          <div style={{ marginBottom: 'var(--spacing-4)' }}>
            <Input 
              label={language === 'ta' ? 'மின்னஞ்சல் (விரும்பினால்)' : 'Email (Optional)'}
              type="email"
              placeholder={language === 'ta' ? 'உங்கள் மின்னஞ்சலை உள்ளிடவும்' : 'Enter your email address'}
              value={formData.email}
              onChange={e => { setFormData({...formData, email: e.target.value}); setErrors({...errors, email: ''}); }}
              error={errors.email}
            />
          </div>

          <div style={{ marginBottom: 'var(--spacing-4)' }}>
            <Select 
              label={t('auth.userType')}
              value={formData.role}
              onChange={e => setFormData({...formData, role: e.target.value as UserRole})}
              options={[
                { value: 'Buyer', label: language === 'ta' ? 'வாங்குபவர்' : 'Buyer' },
                { value: 'Seller', label: language === 'ta' ? 'விற்பனையாளர்' : 'Seller' },
                { value: 'Agent', label: language === 'ta' ? 'முகவர்' : 'Agent' }
              ]}
            />
          </div>

          <div style={{ marginBottom: 'var(--spacing-6)' }}>
            <Checkbox 
              label={
                <span>
                  {language === 'ta' ? 'நான் ' : 'I agree to the '}<Link to="/terms" className={styles.link}>{language === 'ta' ? 'விதிமுறைகள் & நிபந்தனைகள்' : 'Terms & Conditions'}</Link>{language === 'ta' ? ' மற்றும் ' : ' and '}<Link to="/privacy" className={styles.link}>{language === 'ta' ? 'தனியுரிமைக் கொள்கையை' : 'Privacy Policy'}</Link>{language === 'ta' ? ' ஏற்கிறேன்' : ''}
                </span>
              }
              checked={acceptedTerms}
              onChange={e => { setAcceptedTerms(e.target.checked); setErrors({...errors, terms: ''}); }}
            />
            {errors.terms && <p style={{ color: 'var(--color-error)', fontSize: 'var(--font-size-sm)', marginTop: 'var(--spacing-1)' }}>{errors.terms}</p>}
          </div>

          {errors.submit && <p style={{ color: 'var(--color-error)', marginBottom: 'var(--spacing-4)', textAlign: 'center' }}>{errors.submit}</p>}

          <Button type="submit" style={{ width: '100%' }} disabled={isLoading}>
            {isLoading ? (language === 'ta' ? 'கணக்கு உருவாக்கப்படுகிறது...' : 'Creating Account...') : t('auth.createAccount')}
          </Button>
        </form>

        <div className={styles.footer}>
          {language === 'ta' ? 'ஏற்கனவே கணக்கு உள்ளதா?' : 'Already have an account?'} <Link to="/login" className={styles.link}>{t('auth.login')}</Link>
        </div>
      </div>
    </div>
  );
}
