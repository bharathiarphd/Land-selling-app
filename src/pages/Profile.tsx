import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Phone, Mail, ShieldCheck, LogOut, Settings, Bell, Heart, Home, Edit2, Check, X } from 'lucide-react';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { authService } from '../services/authService';
import styles from './Auth.module.css';

export default function Profile() {
  const { user, login, logout } = useAuth();
  const navigate = useNavigate();
  const { t, language } = useLanguage();

  const [isEditingPhone, setIsEditingPhone] = useState(false);
  const [phoneInput, setPhoneInput] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Automatically purge the placeholder testing phone number if present
  useEffect(() => {
    if (user?.phone && user.phone.includes('9876543210')) {
      const cleanedUser = { ...user, phone: '' };
      login(cleanedUser);
      localStorage.setItem('land_selling_app_user', JSON.stringify(cleanedUser));
    }
  }, [user, login]);

  if (!user) {
    return null;
  }

  const cleanDigits = user.phone ? user.phone.replace(/\D/g, '').slice(-10) : '';
  const hasRealPhone = cleanDigits.length === 10 && cleanDigits !== '9876543210';
  const displayPhone = hasRealPhone ? `+91 ${cleanDigits.replace(/(\d{5})(\d{5})/, '$1 $2')}` : '';

  const handleStartEditPhone = () => {
    setPhoneInput(hasRealPhone ? cleanDigits : '');
    setPhoneError('');
    setIsEditingPhone(true);
  };

  const handleSavePhone = async () => {
    const digits = phoneInput.replace(/\D/g, '').slice(-10);
    if (!/^[6-9]\d{9}$/.test(digits)) {
      setPhoneError(language === 'ta' ? 'சரியான 10-இலக்க கைபேசி எண்ணை உள்ளிடவும்' : 'Please enter a valid 10-digit mobile number');
      return;
    }
    if (digits === '9876543210') {
      setPhoneError(language === 'ta' ? 'தயவுசெய்து உங்கள் சொந்த கைபேசி எண்ணை உள்ளிடவும்' : 'Please enter your actual mobile number');
      return;
    }

    setIsSaving(true);
    try {
      const updated = await authService.updateProfile({ phone: `+91${digits}` });
      login(updated);
      setIsEditingPhone(false);
    } catch (err: any) {
      setPhoneError(err.message || 'Failed to update phone number');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    if (window.confirm(language === 'ta' ? 'நீங்கள் உறுதியாக வெளியேற விரும்புகிறீர்களா?' : 'Are you sure you want to logout?')) {
      await logout();
      navigate('/');
    }
  };

  const initials = user.name ? user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'U';

  return (
    <div className={`container ${styles.authContainer}`} style={{ paddingTop: 'var(--spacing-8)', alignItems: 'stretch' }}>
      <h1 className={styles.title} style={{ textAlign: 'left', marginBottom: 'var(--spacing-6)' }}>{t('header.profile')}</h1>
      
      <div className={styles.formCard} style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-4)', marginBottom: 'var(--spacing-6)' }}>
        <div style={{
          width: '80px', height: '80px', borderRadius: 'var(--radius-full)',
          backgroundColor: 'var(--color-primary-light)', color: 'var(--color-primary)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 'var(--font-size-3xl)', fontWeight: 'var(--font-weight-bold)'
        }}>
          {initials}
        </div>
        
        <div style={{ flex: 1 }}>
          <h2 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 'var(--font-weight-bold)', display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)' }}>
            {user.name}
            {user.isVerified && <span style={{ display: 'inline-flex', backgroundColor: 'var(--color-success-bg)', color: 'var(--color-success-text)', padding: '2px 8px', borderRadius: '12px', fontSize: '10px' }}><ShieldCheck size={12} style={{ marginRight: '4px' }}/> {language === 'ta' ? 'சரிபார்க்கப்பட்டது' : 'Verified'}</span>}
          </h2>
          <div style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)', marginTop: 'var(--spacing-1)' }}>
            {language === 'ta' ? (user.role === 'Buyer' ? 'வாங்குபவர்' : user.role === 'Seller' ? 'விற்பனையாளர்' : 'முகவர்') : user.role} {language === 'ta' ? 'கணக்கு' : 'Account'}
          </div>
        </div>
      </div>

      <div className={styles.formCard} style={{ marginBottom: 'var(--spacing-6)', padding: '0' }}>
        <div style={{ padding: 'var(--spacing-4)', borderBottom: '1px solid var(--color-border)', display: 'flex', alignItems: 'flex-start', gap: 'var(--spacing-3)' }}>
          <Phone size={20} color="var(--color-text-secondary)" style={{ marginTop: '3px' }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>
              {language === 'ta' ? 'கைபேசி எண்' : 'Mobile Number'}
            </div>

            {isEditingPhone ? (
              <div style={{ marginTop: '0.5rem' }}>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <div style={{ width: '60px' }}>
                    <Input value="+91" disabled />
                  </div>
                  <div style={{ flex: 1 }}>
                    <Input
                      type="tel"
                      placeholder="98XXXXXXXX"
                      value={phoneInput}
                      onChange={e => {
                        const val = e.target.value.replace(/\D/g, '').substring(0, 10);
                        setPhoneInput(val);
                        setPhoneError('');
                      }}
                      maxLength={10}
                      autoFocus
                    />
                  </div>
                </div>
                {phoneError && <p style={{ color: 'var(--color-error)', fontSize: '0.8rem', marginTop: '4px' }}>{phoneError}</p>}
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                  <Button size="sm" onClick={handleSavePhone} disabled={isSaving}>
                    <Check size={14} style={{ marginRight: '4px' }} />
                    {isSaving ? (language === 'ta' ? 'சேமிக்கிறது...' : 'Saving...') : (language === 'ta' ? 'சேமி' : 'Save')}
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setIsEditingPhone(false)} disabled={isSaving}>
                    <X size={14} style={{ marginRight: '4px' }} />
                    {language === 'ta' ? 'ரத்து' : 'Cancel'}
                  </Button>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '2px' }}>
                <span style={{ fontWeight: 'var(--font-weight-medium)', color: displayPhone ? 'inherit' : 'var(--color-text-secondary)' }}>
                  {displayPhone || (language === 'ta' ? 'கைபேசி எண் சேர்க்கப்படவில்லை' : 'No mobile number linked')}
                </span>
                <button
                  type="button"
                  onClick={handleStartEditPhone}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--color-primary, #0284c7)',
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontWeight: 500,
                    padding: '4px 8px',
                    borderRadius: '4px'
                  }}
                >
                  <Edit2 size={14} />
                  <span>{displayPhone ? (language === 'ta' ? 'மாற்று' : 'Edit') : (language === 'ta' ? '+ எண் சேர்' : '+ Add Number')}</span>
                </button>
              </div>
            )}
          </div>
        </div>
        
        {user.email && (
          <div style={{ padding: 'var(--spacing-4)', borderBottom: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', gap: 'var(--spacing-3)' }}>
            <Mail size={20} color="var(--color-text-secondary)" />
            <div>
              <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>{language === 'ta' ? 'மின்னஞ்சல்' : 'Email Address'}</div>
              <div style={{ fontWeight: 'var(--font-weight-medium)' }}>{user.email}</div>
            </div>
          </div>
        )}
      </div>

      <div className={styles.formCard} style={{ marginBottom: 'var(--spacing-6)', padding: '0' }}>
        <div onClick={() => navigate('/my-properties')} style={{ padding: 'var(--spacing-4)', borderBottom: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', gap: 'var(--spacing-3)', cursor: 'pointer' }}>
          <Home size={20} color="var(--color-primary)" />
          <span style={{ fontWeight: 'var(--font-weight-medium)', flex: 1 }}>{language === 'ta' ? 'எனது சொத்துகள்' : 'My Properties'}</span>
        </div>
        <div onClick={() => navigate('/favorites')} style={{ padding: 'var(--spacing-4)', borderBottom: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', gap: 'var(--spacing-3)', cursor: 'pointer' }}>
          <Heart size={20} color="var(--color-primary)" />
          <span style={{ fontWeight: 'var(--font-weight-medium)', flex: 1 }}>{t('header.saved')}</span>
        </div>
        <div onClick={() => navigate('/notifications')} style={{ padding: 'var(--spacing-4)', borderBottom: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', gap: 'var(--spacing-3)', cursor: 'pointer' }}>
          <Bell size={20} color="var(--color-primary)" />
          <span style={{ fontWeight: 'var(--font-weight-medium)', flex: 1 }}>{language === 'ta' ? 'அறிவிப்புகள்' : 'Notifications'}</span>
        </div>
        <div onClick={() => navigate('/settings')} style={{ padding: 'var(--spacing-4)', display: 'flex', alignItems: 'center', gap: 'var(--spacing-3)', cursor: 'pointer' }}>
          <Settings size={20} color="var(--color-primary)" />
          <span style={{ fontWeight: 'var(--font-weight-medium)', flex: 1 }}>{language === 'ta' ? 'அமைப்புகள்' : 'Settings'}</span>
        </div>
      </div>

      <Button variant="outline" onClick={handleLogout} style={{ color: 'var(--color-error)', borderColor: 'var(--color-error)' }}>
        <LogOut size={18} style={{ marginRight: '8px' }} />
        {language === 'ta' ? 'வெளியேறு' : 'Logout'}
      </Button>
    </div>
  );
}
