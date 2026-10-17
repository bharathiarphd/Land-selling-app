import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { MapPin, Phone, Mail, KeyRound, ArrowRight, ArrowLeft, CheckCircle2, ShieldCheck, AlertCircle, RefreshCw, Lock, Heart } from 'lucide-react';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { Checkbox } from '../components/Checkbox';
import { authService } from '../services/authService';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { getSavedCredentials, saveCredentials, clearSavedCredentials, ADMIN_PHONE_NUMBER, isAdminUser } from '../utils/adminAuth';
import { formatCapitalizedName } from '../utils/wishlistUtils';
import styles from './Auth.module.css';

type LoginOption = 'pin' | 'email' | 'phone';

interface OptionItem {
  id: LoginOption;
  titleEn: string;
  titleTa: string;
  descEn: string;
  descTa: string;
  badgeEn?: string;
  badgeTa?: string;
  icon: typeof KeyRound;
}

const LOGIN_OPTIONS: OptionItem[] = [
  {
    id: 'pin',
    titleEn: 'Mobile & 4-Digit PIN',
    titleTa: 'கைபேசி & 4-இலக்க PIN',
    descEn: 'Quick login using your 10-digit mobile and security PIN',
    descTa: 'கைபேசி எண் மற்றும் PIN மூலம் விரைவு உள்நுழைவு',
    badgeEn: 'Fast & Secure',
    badgeTa: 'விரைவு',
    icon: KeyRound,
  },
  {
    id: 'email',
    titleEn: 'Email & Password',
    titleTa: 'மின்னஞ்சல் & கடவுச்சொல்',
    descEn: 'Login using your registered email address and password',
    descTa: 'பதிவுசெய்த மின்னஞ்சல் மற்றும் கடவுச்சொல் மூலம் உள்நுழைவு',
    icon: Mail,
  },
  {
    id: 'phone',
    titleEn: 'Instant SMS OTP',
    titleTa: 'கைபேசி SMS OTP',
    descEn: 'Receive a 6-digit verification code on your mobile',
    descTa: 'கைபேசிக்கு வரும் 6-இலக்க OTP மூலம் உள்நுழைவு',
    icon: Phone,
  },
];

export default function Login() {
  // Single login selection: Starts null so options are displayed one by one first
  const [selectedOption, setSelectedOption] = useState<LoginOption | null>(null);

  // Form credentials state
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [pin, setPin] = useState('');
  const [rememberMe, setRememberMe] = useState(true);

  // UI States
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{ identifier?: string; password?: string }>({});
  const [notRegistered, setNotRegistered] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // OTP flow sub-state for 'phone' option
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');

  // Forgot Password via Email OTP states
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotIdentifier, setForgotIdentifier] = useState('');
  const [forgotOtp, setForgotOtp] = useState('');
  const [forgotNewPin, setForgotNewPin] = useState('');
  const [forgotStep, setForgotStep] = useState<1 | 2>(1);
  const [forgotMaskedEmail, setForgotMaskedEmail] = useState('');
  const [forgotError, setForgotError] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);

  const { t, language } = useLanguage();
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Loginer name state formatted with first letter capital and others lowercase
  const [loginerName, setLoginerName] = useState<string>('');

  const resolveLoginerName = (ph?: string, em?: string): string => {
    const cleanPh = (ph || '').replace(/\D/g, '').slice(-10);
    if (cleanPh === ADMIN_PHONE_NUMBER) return 'Raja';

    try {
      const rawUsers = localStorage.getItem('registered_users');
      if (rawUsers) {
        const map = JSON.parse(rawUsers);
        const found = Object.values(map).find((u: any) => 
          (cleanPh && u.phone && u.phone.includes(cleanPh)) ||
          (em && u.email && u.email.toLowerCase() === em.toLowerCase())
        ) as any;
        if (found?.name) return formatCapitalizedName(found.name);
      }
    } catch (_) {}

    try {
      const rawUser = localStorage.getItem('land_selling_app_user');
      if (rawUser) {
        const u = JSON.parse(rawUser);
        if (u?.name) return formatCapitalizedName(u.name);
      }
    } catch (_) {}

    const lastName = localStorage.getItem('land_app_last_login_name');
    if (lastName) return formatCapitalizedName(lastName);

    if (user?.name && user.name !== 'User') return formatCapitalizedName(user.name);

    return '';
  };

  // Load saved ID & password on mount
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const isAdminRequested = searchParams.get('admin') === 'true' || location.state?.from?.pathname?.includes('/admin');

    const saved = getSavedCredentials();
    if (saved) {
      setRememberMe(saved.remember !== false);
      if (saved.option) setSelectedOption(saved.option);
      if (saved.phone) setPhone(saved.phone);
      if (saved.pin) setPin(saved.pin);
      if (saved.email) setEmail(saved.email);
      if (saved.password) setPassword(saved.password);
      const name = resolveLoginerName(saved.phone, saved.email);
      if (name) setLoginerName(name);
    } else if (isAdminRequested) {
      setSelectedOption('pin');
      setPhone(ADMIN_PHONE_NUMBER);
      const savedAdminPin = localStorage.getItem(`pin_${ADMIN_PHONE_NUMBER}`) || '5983';
      setPin(savedAdminPin);
      setLoginerName('Raja');
    } else {
      const lastPhone = localStorage.getItem('land_app_last_login_phone') || sessionStorage.getItem('pending_auth_phone');
      if (lastPhone) {
        setPhone(lastPhone);
        const savedPin = localStorage.getItem(`pin_${lastPhone}`);
        if (savedPin) {
          setPin(savedPin);
          setSelectedOption('pin');
        }
        const name = resolveLoginerName(lastPhone, '');
        if (name) setLoginerName(name);
      } else {
        const name = resolveLoginerName('', '');
        if (name) setLoginerName(name);
      }
    }
  }, [location]);

  useEffect(() => {
    if (phone || email) {
      const name = resolveLoginerName(phone, email);
      if (name) setLoginerName(name);
    }
  }, [phone, email]);

  const isTamil = language === 'ta';

  const validatePhone = (p: string) => /^[6-9]\d{9}$/.test(p);
  const validateEmail = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.trim());

  // Handle selecting an option
  const handleSelectOption = (optionId: LoginOption) => {
    setSelectedOption(optionId);
    setError('');
    setFieldErrors({});
    setNotRegistered(false);
  };

  const handleResetOption = () => {
    setSelectedOption(null);
    setError('');
    setFieldErrors({});
    setNotRegistered(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});
    setNotRegistered(false);

    if (!selectedOption) {
      setError(
        isTamil
          ? 'தயவுசெய்து முதலில் ஒரு உள்நுழைவு வழியை தேர்ந்தெடுக்கவும்.'
          : 'Please select a login option above to continue.'
      );
      return;
    }

    // 1. Validate based on selected option
    const newFieldErrors: { identifier?: string; password?: string } = {};

    if (selectedOption === 'pin') {
      if (!phone) {
        newFieldErrors.identifier = isTamil
          ? 'கைபேசி எண்ணை உள்ளிடவும்'
          : 'Please enter your mobile number';
      } else if (!validatePhone(phone)) {
        newFieldErrors.identifier = isTamil
          ? 'சரியான 10-இலக்க கைபேசி எண்ணை உள்ளிடவும்'
          : 'Please enter a valid 10-digit mobile number';
      }

      if (!pin) {
        newFieldErrors.password = isTamil
          ? '4-இலக்க PIN கடவுச்சொல்லை உள்ளிடவும்'
          : 'Please enter your 4-digit PIN password';
      } else if (pin.length !== 4) {
        newFieldErrors.password = isTamil
          ? 'PIN சரியாக 4 இலக்கங்களாக இருக்க வேண்டும்'
          : 'PIN must be exactly 4 digits';
      }

      if (Object.keys(newFieldErrors).length > 0) {
        setFieldErrors(newFieldErrors);
        return;
      }

      setIsLoading(true);
      try {
        const user = await authService.loginWithPin(phone, pin);
        login(user);

        if (user?.name) {
          localStorage.setItem('land_app_last_login_name', formatCapitalizedName(user.name));
        }

        // Save credentials if rememberMe is enabled
        if (rememberMe) {
          saveCredentials({
            option: 'pin',
            phone: phone.trim(),
            pin: pin.trim(),
            remember: true
          });
        } else {
          clearSavedCredentials();
        }

        const state = location.state as { from?: { pathname: string } };
        const dest = state?.from?.pathname || (isAdminUser(user) ? '/admin/dashboard' : '/');
        navigate(dest, { replace: true });
      } catch (err: any) {
        if (
          err.message &&
          (err.message.includes('No account found') ||
            err.message.includes('register') ||
            err.message.includes('not found'))
        ) {
          setNotRegistered(true);
        }
        setError(
          err.message ||
            (isTamil
              ? 'PIN உள்நுழைவு தோல்வியடைந்தது. விவரங்களை சரிபார்க்கவும்.'
              : 'PIN login failed. Please check your credentials or register.')
        );
      } finally {
        setIsLoading(false);
      }
    } else if (selectedOption === 'email') {
      if (!email.trim()) {
        newFieldErrors.identifier = isTamil
          ? 'மின்னஞ்சல் முகவரியை உள்ளிடவும்'
          : 'Please enter your email address';
      } else if (!validateEmail(email)) {
        newFieldErrors.identifier = isTamil
          ? 'சரியான மின்னஞ்சலை உள்ளிடவும்'
          : 'Please enter a valid email address';
      }

      if (!password) {
        newFieldErrors.password = isTamil
          ? 'கடவுச்சொல்லை உள்ளிடவும்'
          : 'Please enter your password';
      } else if (password.length < 4) {
        newFieldErrors.password = isTamil
          ? 'கடவுச்சொல் குறைந்தது 4 எழுத்துக்கள் இருக்க வேண்டும்'
          : 'Password must be at least 4 characters';
      }

      if (Object.keys(newFieldErrors).length > 0) {
        setFieldErrors(newFieldErrors);
        return;
      }

      setIsLoading(true);
      try {
        const user = await authService.loginWithEmail(email, password);
        login(user);

        if (user?.name) {
          localStorage.setItem('land_app_last_login_name', formatCapitalizedName(user.name));
        }

        // Save credentials if rememberMe is enabled
        if (rememberMe) {
          saveCredentials({
            option: 'email',
            email: email.trim(),
            password: password,
            remember: true
          });
        } else {
          clearSavedCredentials();
        }

        const state = location.state as { from?: { pathname: string } };
        const dest = state?.from?.pathname || (isAdminUser(user) ? '/admin/dashboard' : '/');
        navigate(dest, { replace: true });
      } catch (err: any) {
        setError(
          err.message ||
            (isTamil ? 'உள்நுழைவு தோல்வியடைந்தது' : 'Login failed. Please check your email and password.')
        );
      } finally {
        setIsLoading(false);
      }
    } else if (selectedOption === 'phone') {
      if (!phone) {
        newFieldErrors.identifier = isTamil
          ? 'கைபேசி எண்ணை உள்ளிடவும்'
          : 'Please enter your mobile number';
      } else if (!validatePhone(phone)) {
        newFieldErrors.identifier = isTamil
          ? 'சரியான 10-இலக்க கைபேசி எண்ணை உள்ளிடவும்'
          : 'Please enter a valid 10-digit mobile number';
      }

      if (otpSent && !otpCode) {
        newFieldErrors.password = isTamil
          ? '6-இலக்க OTP குறியீட்டை உள்ளிடவும்'
          : 'Please enter the 6-digit OTP code';
      }

      if (Object.keys(newFieldErrors).length > 0) {
        setFieldErrors(newFieldErrors);
        return;
      }

      setIsLoading(true);

      if (!otpSent) {
        // Step 1: Send OTP
        try {
          const check = await authService.checkUser(phone);
          if (!check.exists) {
            setIsLoading(false);
            setNotRegistered(true);
            setError(
              isTamil
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
          setOtpSent(true);
        } catch (err: any) {
          setError(err.message || 'Failed to send OTP. Please try again.');
        } finally {
          setIsLoading(false);
        }
      } else {
        // Step 2: Verify OTP
        try {
          const result = await authService.verifyOtp(phone, otpCode);
          login(result.user);

          if (result.user?.name) {
            localStorage.setItem('land_app_last_login_name', formatCapitalizedName(result.user.name));
          }

          if (rememberMe) {
            saveCredentials({
              option: 'phone',
              phone: phone.trim(),
              remember: true
            });
          }

          const state = location.state as { from?: { pathname: string } };
          const dest = state?.from?.pathname || (isAdminUser(result.user) ? '/admin/dashboard' : '/');
          navigate(dest, { replace: true });
        } catch (err: any) {
          setError(err.message || 'Invalid OTP. Please check the code.');
        } finally {
          setIsLoading(false);
        }
      }
    }
  };

  const handleRequestForgotOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setForgotError('');
    setForgotSuccess('');
    if (!forgotIdentifier.trim()) {
      setForgotError(isTamil ? 'தயவுசெய்து உங்கள் பதிவு செய்த மின்னஞ்சல் அல்லது கைபேசி எண்ணை உள்ளிடவும்' : 'Please enter your registered email address or mobile number');
      return;
    }
    setForgotLoading(true);
    try {
      const res = await authService.requestForgotPasswordOtp(forgotIdentifier.trim());
      setForgotMaskedEmail(res.maskedEmail || 'registered email');
      setForgotStep(2);
      setForgotSuccess(res.message || (isTamil ? 'OTP உங்கள் பதிவுசெய்த மின்னஞ்சல் முகவரிக்கு அனுப்பப்பட்டுள்ளது' : 'OTP sent to your registered email address'));
    } catch (err: any) {
      setForgotError(err.message || (isTamil ? 'OTP அனுப்ப முடியவில்லை. விவரங்களை சரிபார்க்கவும்.' : 'Failed to send OTP. Please check your credentials.'));
    } finally {
      setForgotLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError('');
    if (!forgotOtp || forgotOtp.trim().length !== 6) {
      setForgotError(isTamil ? 'தயவுசெய்து சரியான 6-இலக்க OTP குறியீட்டை உள்ளிடவும்' : 'Please enter the 6-digit OTP code received on email');
      return;
    }
    if (!forgotNewPin || !/^\d{4}$/.test(forgotNewPin.trim())) {
      setForgotError(isTamil ? 'புதிய PIN கடவுச்சொல் சரியாக 4 இலக்கங்களாக இருக்க வேண்டும்' : 'New PIN must be exactly 4 digits');
      return;
    }
    setForgotLoading(true);
    try {
      const res = await authService.resetPasswordWithOtp(forgotIdentifier.trim(), forgotOtp.trim(), forgotNewPin.trim());
      login(res.user);
      saveCredentials({
        option: 'pin',
        phone: res.user.phone || '',
        pin: forgotNewPin.trim(),
        email: res.user.email || '',
        remember: true
      });
      const state = location.state as { from?: { pathname: string } };
      const dest = state?.from?.pathname || (isAdminUser(res.user) ? '/admin/dashboard' : '/');
      navigate(dest, { replace: true });
    } catch (err: any) {
      setForgotError(err.message || (isTamil ? 'கடவுச்சொல் மாற்றுதல் தோல்வியடைந்தது' : 'Failed to reset password. Please check OTP code.'));
    } finally {
      setForgotLoading(false);
    }
  };

  const handleTestSimulator = async () => {
    if (!phone || !validatePhone(phone)) {
      setError(isTamil ? 'தயவுசெய்து சரியான 10-இலக்க கைபேசி எண்ணை உள்ளிடவும்' : 'Please enter a valid 10-digit mobile number');
      return;
    }
    const res = await authService.sendSimulatorOtp(phone);
    sessionStorage.setItem('test_otp_hint', res.testOtp);
    const state = location.state as { from?: Location };
    navigate('/verify-otp', { state: { from: state?.from } });
  };

  const activeOptionItem = LOGIN_OPTIONS.find((opt) => opt.id === selectedOption);

  return (
    <div className={`container ${styles.authContainer}`}>
      <div className={styles.logo}>
        <MapPin size={28} />
      </div>

      <div className={styles.header}>
        <h1 className={styles.title}>{t('auth.login')}</h1>

        {/* Loginer name formatted with first letter capital and others lowercase */}
        {loginerName && (
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: 'rgba(2, 132, 199, 0.08)',
            border: '1.5px solid #0284c7',
            borderRadius: '9999px',
            padding: '5px 16px',
            margin: '8px auto 6px auto',
            color: '#0369a1',
            fontWeight: 600,
            fontSize: '0.925rem',
            boxShadow: '0 2px 6px rgba(2, 132, 199, 0.08)'
          }}>
            <span style={{
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              backgroundColor: '#0284c7',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.8rem',
              fontWeight: 700,
              border: '1.5px solid #ffffff'
            }}>
              {loginerName.charAt(0).toUpperCase()}
            </span>
            <span>
              {isTamil ? 'வணக்கம், ' : 'Welcome back, '}
              <strong style={{ color: '#0284c7', fontWeight: 800 }}>{formatCapitalizedName(loginerName)}</strong>
            </span>
          </div>
        )}

        <p className={styles.subtitle}>
          {selectedOption
            ? isTamil
              ? 'உங்கள் விவரங்களை உள்ளிட்டு உள்நுழையவும்'
              : 'Enter your credentials to access your account'
            : isTamil
            ? 'உள்நுழைய ஒரு வழியை தேர்ந்தெடுக்கவும்'
            : 'Select one login option to get started'}
        </p>

        {/* Customer Wished Properties on Main Page Access Banner */}
        <div style={{
          marginTop: '12px',
          padding: '8px 12px',
          backgroundColor: '#fff1f2',
          border: '1.5px solid #fda4af',
          borderRadius: '10px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '8px',
          textAlign: 'left'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '30px',
              height: '30px',
              borderRadius: '6px',
              border: '1.5px solid #f43f5e',
              backgroundColor: '#ffe4e6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#e11d48',
              flexShrink: 0
            }}>
              <Heart size={15} fill="#e11d48" />
            </div>
            <div>
              <div style={{ fontSize: '0.825rem', fontWeight: 700, color: '#9f1239', lineHeight: 1.2 }}>
                {isTamil ? 'விருப்பமான நிலங்கள் முகப்பு பக்கத்தில்' : 'Your Wished Properties'}
              </div>
              <div style={{ fontSize: '0.725rem', color: '#be123c', lineHeight: 1.2 }}>
                {isTamil ? 'நீங்கள் விரும்பிய நிலங்கள் முகப்பு பக்கத்தில் உள்ளன' : 'View customer liked properties on Main Page'}
              </div>
            </div>
          </div>
          <Link
            to="/"
            style={{
              padding: '5px 12px',
              borderRadius: '6px',
              backgroundColor: '#e11d48',
              color: '#ffffff',
              fontSize: '0.75rem',
              fontWeight: 700,
              textDecoration: 'none',
              border: '1.5px solid #be123c',
              whiteSpace: 'nowrap'
            }}
          >
            {isTamil ? 'முகப்பு பக்கம்' : 'Go to Home'}
          </Link>
        </div>
      </div>

      <div className={styles.formCard}>
        {showForgotPassword ? (
          <div className={styles.forgotPasswordCard} style={{ padding: '0.5rem 0' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1.25rem' }}>
              <button
                type="button"
                onClick={() => {
                  setShowForgotPassword(false);
                  setForgotError('');
                  setForgotSuccess('');
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  color: 'var(--color-primary, #0284c7)',
                  padding: '4px 8px',
                  borderRadius: '6px',
                  fontSize: '0.9rem',
                  fontWeight: 500
                }}
                id="back-to-login-btn"
              >
                <ArrowLeft size={18} />
                <span>{isTamil ? 'உள்நுழைவுக்கு திரும்புக' : 'Back to Login'}</span>
              </button>
            </div>

            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <div style={{
                width: '52px',
                height: '52px',
                borderRadius: '50%',
                background: 'rgba(2, 132, 199, 0.1)',
                color: 'var(--color-primary, #0284c7)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '0.75rem'
              }}>
                <KeyRound size={26} />
              </div>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 700, margin: '0 0 6px 0', color: 'var(--color-text)' }}>
                {isTamil ? 'கடவுச்சொல் / PIN மீட்டமை' : 'Reset Password / PIN'}
              </h2>
              <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', margin: 0 }}>
                {isTamil
                  ? 'பதிவு செய்த மின்னஞ்சல் முகவரிக்கு 6-இலக்க OTP அனுப்பப்படும்'
                  : 'We will send a 6-digit verification OTP to your registered email ID'}
              </p>
            </div>

            {forgotError && (
              <div className={styles.errorAlert} role="alert" style={{ marginBottom: '1.25rem' }}>
                <AlertCircle size={18} style={{ flexShrink: 0, marginTop: 1 }} />
                <span>{forgotError}</span>
              </div>
            )}

            {forgotSuccess && (
              <div style={{
                padding: '0.75rem 1rem',
                backgroundColor: 'rgba(34, 197, 94, 0.1)',
                border: '1px solid rgba(34, 197, 94, 0.3)',
                borderRadius: '8px',
                color: '#16a34a',
                fontSize: '0.875rem',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '1.25rem'
              }}>
                <CheckCircle2 size={18} style={{ flexShrink: 0 }} />
                <span>{forgotSuccess}</span>
              </div>
            )}

            {forgotStep === 1 ? (
              <form onSubmit={handleRequestForgotOtp} noValidate>
                <div style={{ marginBottom: '1.25rem' }}>
                  <Input
                    label={isTamil ? 'பதிவுசெய்த மின்னஞ்சல் அல்லது கைபேசி எண் *' : 'Registered Email or Mobile Number *'}
                    type="text"
                    placeholder={isTamil ? 'name@gmail.com அல்லது 9876543210' : 'name@example.com or 9876543210'}
                    value={forgotIdentifier}
                    onChange={(e) => {
                      setForgotIdentifier(e.target.value);
                      setForgotError('');
                    }}
                    autoFocus
                  />
                  <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginTop: '6px', display: 'block' }}>
                    {isTamil
                      ? 'உங்கள் கணக்கில் இணைக்கப்பட்ட மின்னஞ்சல் முகவரிக்கு OTP குறியீடு அனுப்பப்படும்.'
                      : 'A secure 6-digit OTP will be sent to the email associated with this account.'}
                  </span>
                </div>

                <Button
                  type="submit"
                  className={styles.submitBtn}
                  disabled={forgotLoading}
                  style={{ width: '100%' }}
                  id="send-mail-otp-btn"
                >
                  {forgotLoading ? (
                    <>
                      <div className={styles.spinner} />
                      <span>{isTamil ? 'OTP அனுப்பப்படுகிறது...' : 'Sending OTP to Mail...'}</span>
                    </>
                  ) : (
                    <>
                      <Mail size={18} />
                      <span>{isTamil ? 'மின்னஞ்சலுக்கு OTP அனுப்புக' : 'Send OTP to Email'}</span>
                    </>
                  )}
                </Button>
              </form>
            ) : (
              <form onSubmit={handleResetPassword} noValidate>
                <div style={{
                  padding: '0.75rem 1rem',
                  backgroundColor: 'var(--color-bg-secondary, #f8fafc)',
                  border: '1px solid var(--color-border, #e2e8f0)',
                  borderRadius: '8px',
                  marginBottom: '1.25rem',
                  fontSize: '0.875rem'
                }}>
                  <span style={{ color: 'var(--color-text-secondary)' }}>
                    {isTamil ? 'OTP அனுப்பப்பட்ட மின்னஞ்சல்: ' : 'OTP sent to: '}
                  </span>
                  <strong style={{ color: 'var(--color-primary, #0284c7)' }}>{forgotMaskedEmail}</strong>
                </div>

                <div style={{ marginBottom: '1.25rem' }}>
                  <Input
                    label={isTamil ? 'மின்னஞ்சலுக்கு வந்த 6-இலக்க OTP *' : '6-Digit Email OTP *'}
                    type="tel"
                    maxLength={6}
                    placeholder="••••••"
                    value={forgotOtp}
                    onChange={(e) => {
                      setForgotOtp(e.target.value.replace(/\D/g, '').substring(0, 6));
                      setForgotError('');
                    }}
                    style={{ letterSpacing: '0.35em', fontSize: '1.2rem', textAlign: 'center', fontWeight: '600' }}
                    autoFocus
                  />
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <Input
                    label={isTamil ? 'புதிய 4-இலக்க PIN கடவுச்சொல் *' : 'New 4-Digit Password / PIN *'}
                    type="password"
                    maxLength={4}
                    placeholder="••••"
                    value={forgotNewPin}
                    onChange={(e) => {
                      setForgotNewPin(e.target.value.replace(/\D/g, '').substring(0, 4));
                      setForgotError('');
                    }}
                    style={{ letterSpacing: '0.4em', fontSize: '1.2rem', textAlign: 'center', fontWeight: '600' }}
                    helperText={isTamil ? 'இனி இந்த 4-இலக்க PIN ஐப் பயன்படுத்தி நேரடியாக உள்நுழையலாம்' : 'You can log in directly using this new 4-digit PIN'}
                  />
                </div>

                <Button
                  type="submit"
                  className={styles.submitBtn}
                  disabled={forgotLoading}
                  style={{ width: '100%', marginBottom: '1rem' }}
                  id="reset-pin-submit-btn"
                >
                  {forgotLoading ? (
                    <>
                      <div className={styles.spinner} />
                      <span>{isTamil ? 'மாற்றப்படுகிறது...' : 'Resetting Password...'}</span>
                    </>
                  ) : (
                    <>
                      <KeyRound size={18} />
                      <span>{isTamil ? 'கடவுச்சொல்லை மாற்றி உள்நுழைக' : 'Reset PIN & Login'}</span>
                    </>
                  )}
                </Button>

                <div style={{ textAlign: 'center' }}>
                  <button
                    type="button"
                    onClick={() => handleRequestForgotOtp()}
                    disabled={forgotLoading}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--color-primary, #0284c7)',
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                      fontWeight: 500
                    }}
                  >
                    {isTamil ? 'OTP மீண்டும் மின்னஞ்சலுக்கு அனுப்புக' : 'Resend OTP to Email'}
                  </button>
                </div>
              </form>
            )}
          </div>
        ) : (
          <>
        {/* Step 1: One-by-One Login Selection */}
        <div className={styles.optionsSection}>
          <div className={styles.sectionLabel}>
            <span>{isTamil ? 'உள்நுழைவு வழிமுறை' : 'Select Login Option'}</span>
            {selectedOption && (
              <button
                type="button"
                onClick={handleResetOption}
                className={styles.changeOptionBtn}
              >
                {isTamil ? 'மாற்று (Change)' : 'Show All Options'}
              </button>
            )}
          </div>

          <div className={styles.optionsList}>
            {LOGIN_OPTIONS.map((opt) => {
              const isSelected = selectedOption === opt.id;
              const IconComp = opt.icon;

              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => handleSelectOption(opt.id)}
                  className={`${styles.optionCard} ${isSelected ? styles.optionCardActive : ''}`}
                  aria-pressed={isSelected}
                  id={`login-option-${opt.id}`}
                >
                  <div className={styles.optionLeft}>
                    <div className={styles.optionIconWrap}>
                      <IconComp size={18} />
                    </div>
                    <div className={styles.optionMeta}>
                      <div className={styles.optionTitleRow}>
                        <span className={styles.optionTitle}>
                          {isTamil ? opt.titleTa : opt.titleEn}
                        </span>
                        {opt.badgeEn && (
                          <span className={styles.optionBadge}>
                            {isTamil ? opt.badgeTa : opt.badgeEn}
                          </span>
                        )}
                      </div>
                      <span className={styles.optionDesc}>
                        {isTamil ? opt.descTa : opt.descEn}
                      </span>
                    </div>
                  </div>

                  <div className={styles.optionRadioCircle}>
                    {isSelected && <div className={styles.optionRadioDot} />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Global Error Alert */}
        {error && (
          <div className={styles.errorAlert} role="alert">
            <AlertCircle size={18} style={{ flexShrink: 0, marginTop: 1 }} />
            <span>{error}</span>
          </div>
        )}

        {/* Not Registered Helper */}
        {notRegistered && (
          <div className={styles.notRegisteredCard}>
            <p className={styles.notRegisteredTitle}>
              {isTamil ? '⚠️ இந்த கணக்கு இன்னும் பதிவு செய்யப்படவில்லை' : '⚠️ No account found for this number'}
            </p>
            <p className={styles.notRegisteredSubtitle}>
              {isTamil
                ? 'முதல் முறை பயனரா? 4-இலக்க கடவுச்சொல்லுடன் எளிதாகப் பதிவு செய்யவும்.'
                : 'First time user? Register in seconds with your 4-digit PIN.'}
            </p>
            <Button
              type="button"
              onClick={() => navigate('/register', { state: { phone } })}
              style={{ width: '100%' }}
              size="sm"
            >
              {isTamil ? 'இலவசமாக பதிவு செய்க (Register)' : 'Register Free Now'}
            </Button>
          </div>
        )}

        {/* Step 2: Hidden until an option is selected */}
        {!selectedOption ? (
          <div className={styles.promptNotice}>
            <ShieldCheck size={20} style={{ margin: '0 auto 6px auto', color: 'var(--color-primary)' }} />
            <p style={{ margin: 0 }}>
              {isTamil
                ? '👆 மேலே உள்ள ஏதேனும் ஒரு வழியைத் தொட்டு உள்நுழையலாம்.'
                : 'Tap any login option above to reveal your password field and proceed.'}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} method="post" autoComplete="on" className={styles.credentialsContainer} noValidate>
            {/* Selected Option Mini-Banner */}
            <div className={styles.selectedBanner}>
              <div className={styles.selectedBannerLeft}>
                {activeOptionItem && <activeOptionItem.icon size={16} />}
                <span>{activeOptionItem ? (isTamil ? activeOptionItem.titleTa : activeOptionItem.titleEn) : ''}</span>
              </div>
              <button
                type="button"
                onClick={handleResetOption}
                className={styles.changeOptionBtn}
              >
                {isTamil ? 'மாற்று' : 'Switch'}
              </button>
            </div>

            {/* Option 1: Mobile & PIN */}
            {selectedOption === 'pin' && (
              <>
                <label style={{ display: 'block', marginBottom: 'var(--spacing-1)', fontWeight: 'var(--font-weight-medium)', fontSize: 'var(--font-size-sm)' }}>
                  {t('auth.mobileNumber')} *
                </label>
                <div className={styles.phoneInputGroup}>
                  <div className={styles.countryCode}>
                    <Input value="+91" disabled />
                  </div>
                  <div className={styles.phoneNumber}>
                    <Input
                      type="tel"
                      name="username"
                      autoComplete="username tel"
                      id="login-phone-pin"
                      placeholder={t('auth.mobilePlaceholder')}
                      value={phone}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '').substring(0, 10);
                        setPhone(val);
                        if (error) setError('');
                        if (fieldErrors.identifier) setFieldErrors({ ...fieldErrors, identifier: '' });
                      }}
                      error={fieldErrors.identifier}
                      maxLength={10}
                      autoFocus
                    />
                  </div>
                </div>

                {/* Password / 4-Digit PIN Field with Eye Icon Toggle */}
                <div className={styles.passwordWrapper}>
                  <Input
                    label={isTamil ? '4-இலக்க பாதுகாப்பு PIN / கடவுச்சொல் *' : '4-Digit Security PIN / Password *'}
                    type="password"
                    name="password"
                    autoComplete="current-password"
                    id="login-pin-field"
                    placeholder="••••"
                    value={pin}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '').substring(0, 4);
                      setPin(val);
                      if (error) setError('');
                      if (fieldErrors.password) setFieldErrors({ ...fieldErrors, password: '' });
                    }}
                    error={fieldErrors.password}
                    maxLength={4}
                    helperText={isTamil ? 'பதிவு செய்த 4-இலக்க PIN ஐ உள்ளிடவும்' : 'Enter your registered 4-digit PIN password'}
                    style={{
                      letterSpacing: '0.4em',
                      fontSize: '1.25rem',
                      fontWeight: '600',
                      textAlign: 'center',
                    }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '4px', marginBottom: '8px' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setShowForgotPassword(true);
                      setForgotIdentifier(phone || email);
                      setForgotStep(1);
                      setForgotError('');
                      setForgotSuccess('');
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--color-primary, #0284c7)',
                      fontSize: '0.85rem',
                      fontWeight: 500,
                      cursor: 'pointer',
                      padding: 0
                    }}
                    id="forgot-pin-btn"
                  >
                    {isTamil ? 'கடவுச்சொல் / PIN மறந்துவிட்டதா?' : 'Forgot Password / PIN?'}
                  </button>
                </div>
              </>
            )}

            {/* Option 2: Email & Password */}
            {selectedOption === 'email' && (
              <>
                <Input
                  label={isTamil ? 'மின்னஞ்சல் முகவரி *' : 'Email Address *'}
                  type="email"
                  name="username"
                  autoComplete="username email"
                  id="login-email-field"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError('');
                    if (fieldErrors.identifier) setFieldErrors({ ...fieldErrors, identifier: '' });
                  }}
                  error={fieldErrors.identifier}
                  autoFocus
                />

                {/* Password Field with Eye Icon Toggle */}
                <div className={styles.passwordWrapper}>
                  <Input
                    label={isTamil ? 'கடவுச்சொல் (Password) *' : 'Account Password *'}
                    type="password"
                    name="password"
                    autoComplete="current-password"
                    id="login-password-field"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (error) setError('');
                      if (fieldErrors.password) setFieldErrors({ ...fieldErrors, password: '' });
                    }}
                    error={fieldErrors.password}
                    helperText={isTamil ? 'உங்கள் கணக்கு கடவுச்சொல்லை உள்ளிடவும்' : 'Enter your account password'}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '4px', marginBottom: '8px' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setShowForgotPassword(true);
                      setForgotIdentifier(email || phone);
                      setForgotStep(1);
                      setForgotError('');
                      setForgotSuccess('');
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--color-primary, #0284c7)',
                      fontSize: '0.85rem',
                      fontWeight: 500,
                      cursor: 'pointer',
                      padding: 0
                    }}
                    id="forgot-email-password-btn"
                  >
                    {isTamil ? 'கடவுச்சொல் மறந்துவிட்டதா?' : 'Forgot Password?'}
                  </button>
                </div>
              </>
            )}

            {/* Option 3: Instant SMS OTP */}
            {selectedOption === 'phone' && (
              <>
                <label style={{ display: 'block', marginBottom: 'var(--spacing-1)', fontWeight: 'var(--font-weight-medium)', fontSize: 'var(--font-size-sm)' }}>
                  {t('auth.mobileNumber')} *
                </label>
                <div className={styles.phoneInputGroup}>
                  <div className={styles.countryCode}>
                    <Input value="+91" disabled />
                  </div>
                  <div className={styles.phoneNumber}>
                    <Input
                      type="tel"
                      id="login-phone-otp"
                      placeholder={t('auth.mobilePlaceholder')}
                      value={phone}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '').substring(0, 10);
                        setPhone(val);
                        if (error) setError('');
                        if (fieldErrors.identifier) setFieldErrors({ ...fieldErrors, identifier: '' });
                      }}
                      error={fieldErrors.identifier}
                      maxLength={10}
                      disabled={otpSent}
                      autoFocus
                    />
                  </div>
                </div>

                {otpSent && (
                  <div className={styles.passwordWrapper}>
                    <Input
                      label={isTamil ? '6-இலக்க OTP குறியீடு *' : '6-Digit SMS Verification Code *'}
                      type="password"
                      id="login-otp-code"
                      placeholder="••••••"
                      value={otpCode}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '').substring(0, 6);
                        setOtpCode(val);
                        if (error) setError('');
                        if (fieldErrors.password) setFieldErrors({ ...fieldErrors, password: '' });
                      }}
                      error={fieldErrors.password}
                      maxLength={6}
                      helperText={isTamil ? 'கைபேசிக்கு வந்த 6-இலக்க OTP ஐ உள்ளிடவும்' : 'Enter 6-digit OTP code received on SMS'}
                      style={{
                        letterSpacing: '0.4em',
                        fontSize: '1.25rem',
                        fontWeight: '600',
                        textAlign: 'center',
                      }}
                    />
                  </div>
                )}
              </>
            )}

            {/* Remember Credentials Checkbox: Save Login ID and Password */}
            <div style={{ marginTop: '0.5rem', marginBottom: '1.25rem', padding: '0.25rem 0' }}>
              <Checkbox
                label={
                  <span style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                    <Lock size={14} style={{ color: 'var(--color-primary, #0284c7)' }} />
                    <span style={{ fontWeight: 500 }}>
                      {isTamil
                        ? 'உள்நுழைவு ஐடி மற்றும் கடவுச்சொல்லை சேமிக்கவும் (Save Login ID & Password)'
                        : 'Save my Login ID and Password on this device'}
                    </span>
                  </span>
                }
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                id="remember-credentials-checkbox"
              />
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className={styles.submitBtn}
              disabled={isLoading}
              id="login-submit-btn"
            >
              {isLoading ? (
                <>
                  <div className={styles.spinner} />
                  <span>{isTamil ? 'சரிபார்க்கிறது...' : 'Processing...'}</span>
                </>
              ) : selectedOption === 'phone' && !otpSent ? (
                <>
                  <span>{isTamil ? 'OTP அனுப்புக' : 'Send Verification OTP'}</span>
                  <ArrowRight size={18} />
                </>
              ) : (
                <>
                  <span>{isTamil ? 'உள்நுழையவும் (Login)' : 'Login to Account'}</span>
                  <ArrowRight size={18} />
                </>
              )}
            </Button>

            {/* Offline Test Simulator fallback */}
            {selectedOption === 'phone' && (
              <div style={{ marginTop: '0.75rem', textAlign: 'center' }}>
                <button
                  type="button"
                  onClick={handleTestSimulator}
                  className={styles.testSimulatorBtn}
                  id="test-simulator-btn"
                >
                  <RefreshCw size={12} />
                  <span>⚡ Test simulator code (123456)</span>
                </button>
              </div>
            )}
          </form>
        )}
          </>
        )}

        <div id="recaptcha-container"></div>

        <div className={styles.footer}>
          {isTamil ? 'புதிய பயனரா?' : 'New to Land Selling App?'}{' '}
          <Link to="/register" className={styles.link} id="link-to-register">
            {t('auth.register')}
          </Link>
        </div>
      </div>
    </div>
  );
}
