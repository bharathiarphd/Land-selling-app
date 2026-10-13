import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { MapPin, KeyRound, Mail, Phone, User as UserIcon } from 'lucide-react';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { Select } from '../components/Select';
import { Checkbox } from '../components/Checkbox';
import { authService, type UserRole, type RegisterData } from '../services/authService';
import { useLanguage } from '../context/LanguageContext';
import styles from './Auth.module.css';

export default function Register() {
  const location = useLocation();
  const prefilledPhone = (location.state as { phone?: string })?.phone || sessionStorage.getItem('pending_auth_phone') || '';

  const [formData, setFormData] = useState({
    name: '',
    phone: prefilledPhone.replace(/\D/g, '').slice(-10),
    email: '',
    pin: '',
    confirmPin: '',
    role: 'Buyer' as UserRole
  });
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const { t, language } = useLanguage();

  const navigate = useNavigate();

  const validatePhone = (p: string) => /^[6-9]\d{9}$/.test(p);
  const validateEmail = (e: string) => /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(e.trim());

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = language === 'ta' ? 'தயவுசெய்து உங்கள் பெயரை உள்ளிடவும்' : 'Please enter your full name';
    }

    if (!formData.phone) {
      newErrors.phone = language === 'ta' ? 'தயவுசெய்து உங்கள் கைபேசி எண்ணை உள்ளிடவும்' : 'Please enter your mobile number';
    } else if (!validatePhone(formData.phone)) {
      newErrors.phone = language === 'ta' ? 'தயவுசெய்து சரியான 10-இலக்க கைபேசி எண்ணை உள்ளிடவும்' : 'Please enter a valid 10-digit mobile number';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = language === 'ta' ? 'மின்னஞ்சல் முகவரி அவசியம்' : 'Email address is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = language === 'ta' ? 'சரியான மின்னஞ்சலை உள்ளிடவும் (எ.கா. name@example.com)' : 'Please enter a valid email address (e.g. name@example.com)';
    }

    if (!formData.pin) {
      newErrors.pin = language === 'ta' ? '4-இலக்க பின்னை உள்ளிடவும்' : 'Please enter a 4-digit login PIN';
    } else if (!/^\d{4}$/.test(formData.pin)) {
      newErrors.pin = language === 'ta' ? 'PIN சரியாக 4 இலக்கங்களாக இருக்க வேண்டும்' : 'PIN must be exactly 4 digits';
    }

    if (!formData.confirmPin) {
      newErrors.confirmPin = language === 'ta' ? 'PIN-ஐ மீண்டும் உள்ளிடவும்' : 'Please re-enter your PIN';
    } else if (formData.pin !== formData.confirmPin) {
      newErrors.confirmPin = language === 'ta' ? 'PINகள் பொருந்தவில்லை' : 'PINs do not match';
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
      // 1. Check if phone is already registered
      const check = await authService.checkUser(formData.phone);
      if (check.exists) {
        setErrors({ 
          phone: language === 'ta' 
            ? 'இந்த கைபேசி எண் ஏற்கனவே பதிவு செய்யப்பட்டுள்ளது! தயவுசெய்து உள்நுழையவும்.' 
            : 'This mobile number is already registered! Please login directly.' 
        });
        setIsLoading(false);
        return;
      }

      // 2. Prepare registration data
      const registrationPayload: RegisterData = {
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim().toLowerCase(),
        role: formData.role,
        pin: formData.pin.trim()
      };

      // 3. Send OTP
      const result = await authService.sendOtp(formData.phone);
      
      sessionStorage.setItem('pending_auth_phone', formData.phone);
      sessionStorage.setItem('pending_registration', JSON.stringify(registrationPayload));
      if (result.isTestMode) {
        sessionStorage.setItem('test_otp_hint', result.testOtp || '123456');
      } else {
        sessionStorage.removeItem('test_otp_hint');
      }
      
      navigate('/verify-otp');
    } catch (err: any) {
      setErrors({ submit: err.message || (language === 'ta' ? 'கணக்கை உருவாக்க முடியவில்லை. மீண்டும் முயற்சிக்கவும்.' : 'Unable to create account. Please try again.') });
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
            {t('auth.mobileNumber')} *
          </label>
          <div className={styles.phoneInputGroup} style={{ display: 'flex', gap: '0.5rem', marginBottom: 'var(--spacing-4)' }}>
            <div className={styles.countryCode} style={{ width: '60px' }}>
              <Input value="+91" disabled />
            </div>
            <div className={styles.phoneNumber} style={{ flex: 1 }}>
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
              label={language === 'ta' ? 'மின்னஞ்சல் முகவரி *' : 'Email Address *'}
              type="email"
              placeholder={language === 'ta' ? 'உங்கள் மின்னஞ்சலை உள்ளிடவும் (எ.கா. name@gmail.com)' : 'Enter email address (e.g. name@gmail.com)'}
              value={formData.email}
              onChange={e => { setFormData({...formData, email: e.target.value}); setErrors({...errors, email: ''}); }}
              error={errors.email}
            />
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginBottom: 'var(--spacing-4)' }}>
            <div style={{ flex: 1 }}>
              <Input 
                label={language === 'ta' ? '4-இலக்க PIN *' : '4-Digit PIN *'}
                type="password"
                placeholder="••••"
                value={formData.pin}
                onChange={e => {
                  const val = e.target.value.replace(/\D/g, '').substring(0, 4);
                  setFormData({...formData, pin: val});
                  setErrors({...errors, pin: ''});
                }}
                error={errors.pin}
                maxLength={4}
                style={{ textAlign: 'center', letterSpacing: '0.4em', fontSize: '1.1rem' }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <Input 
                label={language === 'ta' ? 'PIN உறுதிசெய்க *' : 'Confirm PIN *'}
                type="password"
                placeholder="••••"
                value={formData.confirmPin}
                onChange={e => {
                  const val = e.target.value.replace(/\D/g, '').substring(0, 4);
                  setFormData({...formData, confirmPin: val});
                  setErrors({...errors, confirmPin: ''});
                }}
                error={errors.confirmPin}
                maxLength={4}
                style={{ textAlign: 'center', letterSpacing: '0.4em', fontSize: '1.1rem' }}
              />
            </div>
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
        
        <div id="recaptcha-container"></div>

        <div className={styles.footer}>
          {language === 'ta' ? 'ஏற்கனவே கணக்கு உள்ளதா?' : 'Already have an account?'} <Link to="/login" className={styles.link}>{t('auth.login')}</Link>
        </div>
      </div>
    </div>
  );
}
