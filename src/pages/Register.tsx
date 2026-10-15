import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { MapPin, Eye, EyeOff } from 'lucide-react';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { Select } from '../components/Select';
import { Checkbox } from '../components/Checkbox';
import { authService, type UserRole, type RegisterData } from '../services/authService';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { saveCredentials } from '../utils/adminAuth';
import styles from './Auth.module.css';

const DISTRICT_OPTIONS = [
  { value: '', label: '-- Select District / மாவட்டம் தேர்ந்தெடுக்கவும் --' },
  { value: 'Ariyalur', label: 'Ariyalur (அரியலூர்)' },
  { value: 'Chengalpattu', label: 'Chengalpattu (செங்கல்பட்டு)' },
  { value: 'Chennai', label: 'Chennai (சென்னை)' },
  { value: 'Coimbatore', label: 'Coimbatore (கோயம்புத்தூர்)' },
  { value: 'Cuddalore', label: 'Cuddalore (கடலூர்)' },
  { value: 'Dharmapuri', label: 'Dharmapuri (தருமபுரி)' },
  { value: 'Dindigul', label: 'Dindigul (திண்டுக்கல்)' },
  { value: 'Erode', label: 'Erode (ஈரோடு)' },
  { value: 'Kallakurichi', label: 'Kallakurichi (கள்ளக்குறிச்சி)' },
  { value: 'Kancheepuram', label: 'Kancheepuram (காஞ்சிபுரம்)' },
  { value: 'Kanniyakumari', label: 'Kanniyakumari (கன்னியாகுமரி)' },
  { value: 'Karur', label: 'Karur (கரூர்)' },
  { value: 'Krishnagiri', label: 'Krishnagiri (கிருஷ்ணகிரி)' },
  { value: 'Madurai', label: 'Madurai (மதுரை)' },
  { value: 'Mayiladuthurai', label: 'Mayiladuthurai (மயிலாடுதுறை)' },
  { value: 'Nagapattinam', label: 'Nagapattinam (நாகப்பட்டினம்)' },
  { value: 'Namakkal', label: 'Namakkal (நாமக்கல்)' },
  { value: 'Nilgiris', label: 'Nilgiris (நீலகிரி)' },
  { value: 'Perambalur', label: 'Perambalur (பெரம்பலூர்)' },
  { value: 'Pudukkottai', label: 'Pudukkottai (புதுக்கோட்டை)' },
  { value: 'Ramanathapuram', label: 'Ramanathapuram (இராமநாதபுரம்)' },
  { value: 'Ranipet', label: 'Ranipet (ராணிப்பேட்டை)' },
  { value: 'Salem', label: 'Salem (சேலம்)' },
  { value: 'Sivagangai', label: 'Sivagangai (சிவகங்கை)' },
  { value: 'Tenkasi', label: 'Tenkasi (தென்காசி)' },
  { value: 'Thanjavur', label: 'Thanjavur (தஞ்சாவூர்)' },
  { value: 'Theni', label: 'Theni (தேனி)' },
  { value: 'Thoothukudi', label: 'Thoothukudi (தூத்துக்குடி)' },
  { value: 'Tiruchirappalli', label: 'Tiruchirappalli (திருச்சிராப்பள்ளி)' },
  { value: 'Tirunelveli', label: 'Tirunelveli (திருநெல்வேலி)' },
  { value: 'Tirupathur', label: 'Tirupathur (திருப்பத்தூர்)' },
  { value: 'Tiruppur', label: 'Tiruppur (திருப்பூர்)' },
  { value: 'Tiruvallur', label: 'Tiruvallur (திருவள்ளூர்)' },
  { value: 'Tiruvannamalai', label: 'Tiruvannamalai (திருவண்ணாமலை)' },
  { value: 'Tiruvarur', label: 'Tiruvarur (திருவாரூர்)' },
  { value: 'Vellore', label: 'Vellore (வேலூர்)' },
  { value: 'Viluppuram', label: 'Viluppuram (விழுப்புரம்)' },
  { value: 'Virudhunagar', label: 'Virudhunagar (விருதுநகர்)' },
  { value: 'Other', label: 'Other State / பிற மாநிலம்' }
];

export default function Register() {
  const location = useLocation();
  const prefilledPhone = (location.state as { phone?: string })?.phone || sessionStorage.getItem('pending_auth_phone') || '';
  const { login } = useAuth();
  const { t, language } = useLanguage();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    phone: prefilledPhone.replace(/\D/g, '').slice(-10),
    email: '',
    pin: '',
    role: 'Buyer' as UserRole,
    district: '',
    town: '',
    pincode: ''
  });

  // Password masked by default for security with eye icon toggle
  const [showPin, setShowPin] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const validatePhone = (p: string) => /^[6-9]\d{9}$/.test(p);
  const validateEmail = (e: string) => /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(e.trim());
  const validatePincode = (pin: string) => /^\d{6}$/.test(pin.trim());

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

    if (!formData.district.trim()) {
      newErrors.district = language === 'ta' ? 'தயவுசெய்து உங்கள் மாவட்டத்தைத் தேர்ந்தெடுக்கவும்' : 'Please select your district';
    }

    if (!formData.town.trim()) {
      newErrors.town = language === 'ta' ? 'தயவுசெய்து உங்கள் உள்ளூர் நகரம் / கிராமத்தை உள்ளிடவும்' : 'Please enter your local town/village';
    }

    if (!formData.pincode.trim()) {
      newErrors.pincode = language === 'ta' ? 'அஞ்சல் குறியீட்டு எண் (PIN Code) அவசியம்' : 'Postal PIN code is required';
    } else if (!validatePincode(formData.pincode)) {
      newErrors.pincode = language === 'ta' ? 'சரியான 6-இலக்க அஞ்சல் குறியீட்டை உள்ளிடவும்' : 'Please enter a valid 6-digit postal PIN code';
    }

    if (!formData.pin) {
      newErrors.pin = language === 'ta' ? '4-இலக்க கடவுச்சொல்லை (PIN) உள்ளிடவும்' : 'Please create a 4-digit password/PIN';
    } else if (!/^\d{4}$/.test(formData.pin)) {
      newErrors.pin = language === 'ta' ? 'கடவுச்சொல் சரியாக 4 இலக்கங்களாக இருக்க வேண்டும்' : 'Password must be exactly 4 digits';
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

      // 2. Prepare registration data with own 4-digit PIN and location details
      const registrationPayload: RegisterData = {
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim().toLowerCase(),
        role: formData.role,
        pin: formData.pin.trim(),
        district: formData.district.trim(),
        town: formData.town.trim(),
        pincode: formData.pincode.trim()
      };

      // 3. Direct registration (message/SMS send stopped temporarily)
      const { user } = await authService.registerDirect(registrationPayload);

      // 4. Save login ID and PIN password for easy auto-login
      saveCredentials({
        option: 'pin',
        phone: formData.phone.trim(),
        pin: formData.pin.trim(),
        email: formData.email.trim(),
        remember: true
      });

      // 5. Log in immediately and navigate
      login(user);
      const state = location.state as { from?: { pathname: string } };
      navigate(state?.from?.pathname || '/', { replace: true });
    } catch (err: any) {
      setErrors({
        submit: err.message || (language === 'ta' ? 'கணக்கை உருவாக்க முடியவில்லை. மீண்டும் முயற்சிக்கவும்.' : 'Unable to create account. Please try again.')
      });
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
              onChange={e => { setFormData({ ...formData, name: e.target.value }); setErrors({ ...errors, name: '' }); }}
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
                  setFormData({ ...formData, phone: val });
                  setErrors({ ...errors, phone: '' });
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
              onChange={e => { setFormData({ ...formData, email: e.target.value }); setErrors({ ...errors, email: '' }); }}
              error={errors.email}
            />
          </div>

          {/* District Selection */}
          <div style={{ marginBottom: 'var(--spacing-4)' }}>
            <Select
              label={language === 'ta' ? 'மாவட்டம் (District) *' : 'District *'}
              value={formData.district}
              onChange={e => {
                setFormData({ ...formData, district: e.target.value });
                setErrors({ ...errors, district: '' });
              }}
              options={DISTRICT_OPTIONS}
              error={errors.district}
            />
          </div>

          {/* Local Town and Postal PIN Code */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: 'var(--spacing-4)' }}>
            <div>
              <Input
                label={language === 'ta' ? 'உள்ளூர் நகரம் / கிராமம் *' : 'Local Town / Village *'}
                placeholder={language === 'ta' ? 'எ.கா. பொள்ளாச்சி / Sulur' : 'e.g. Pollachi, Sulur'}
                value={formData.town}
                onChange={e => {
                  setFormData({ ...formData, town: e.target.value });
                  setErrors({ ...errors, town: '' });
                }}
                error={errors.town}
              />
            </div>
            <div>
              <Input
                label={language === 'ta' ? 'அஞ்சல் குறியீடு (PIN) *' : 'Postal PIN Code *'}
                type="tel"
                placeholder="641001"
                maxLength={6}
                value={formData.pincode}
                onChange={e => {
                  const val = e.target.value.replace(/\D/g, '').substring(0, 6);
                  setFormData({ ...formData, pincode: val });
                  setErrors({ ...errors, pincode: '' });
                }}
                error={errors.pincode}
              />
            </div>
          </div>

          {/* 4-digit Password / PIN - Visible first password, no second confirm password */}
          <div style={{ marginBottom: 'var(--spacing-4)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-1)' }}>
              <label style={{ fontWeight: 'var(--font-weight-medium)', fontSize: '0.9rem' }}>
                {language === 'ta' ? '4-இலக்க கடவுச்சொல் / PIN *' : '4-Digit Password / PIN *'}
              </label>
              <button
                type="button"
                onClick={() => setShowPin(!showPin)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--color-primary, #0284c7)',
                  fontSize: '0.8rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '2px 6px',
                  borderRadius: '4px'
                }}
              >
                {showPin ? <EyeOff size={16} /> : <Eye size={16} />}
                <span>{showPin ? (language === 'ta' ? 'மறை' : 'Hide') : (language === 'ta' ? 'காட்டு' : 'Show')}</span>
              </button>
            </div>
            <Input
              type={showPin ? 'text' : 'password'}
              placeholder="1234"
              value={formData.pin}
              onChange={e => {
                const val = e.target.value.replace(/\D/g, '').substring(0, 4);
                setFormData({ ...formData, pin: val });
                setErrors({ ...errors, pin: '' });
              }}
              error={errors.pin}
              maxLength={4}
              helperText={language === 'ta' ? 'உள்நுழைவிற்கு இந்த 4-இலக்க கடவுச்சொல்லை பயன்படுத்தலாம்' : 'Use this 4-digit password to log in directly'}
              style={{
                letterSpacing: showPin ? '0.3em' : '0.4em',
                fontSize: '1.2rem',
                fontWeight: '600'
              }}
            />
          </div>

          <div style={{ marginBottom: 'var(--spacing-4)' }}>
            <Select
              label={t('auth.userType')}
              value={formData.role}
              onChange={e => setFormData({ ...formData, role: e.target.value as UserRole })}
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
              onChange={e => { setAcceptedTerms(e.target.checked); setErrors({ ...errors, terms: '' }); }}
            />
            {errors.terms && <p style={{ color: 'var(--color-error)', fontSize: 'var(--font-size-sm)', marginTop: 'var(--spacing-1)' }}>{errors.terms}</p>}
          </div>

          {errors.submit && (
            <div style={{ marginBottom: 'var(--spacing-4)', textAlign: 'center' }}>
              <p style={{ color: 'var(--color-error)' }}>{errors.submit}</p>
            </div>
          )}

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
