import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { authService } from '../services/authService';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { 
  KeyRound, 
  Bell, 
  Globe, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle, 
  Trash2,
  Smartphone
} from 'lucide-react';
import styles from './Settings.module.css';

export default function Settings() {
  const { user, logout } = useAuth();
  const { language, setLanguage, t } = useLanguage();

  // Change PIN State
  const [oldPin, setOldPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [pinStatus, setPinStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [isUpdatingPin, setIsUpdatingPin] = useState(false);

  // Notification Preferences
  const [notifications, setNotifications] = useState(() => {
    const saved = localStorage.getItem('user_notification_prefs');
    return saved ? JSON.parse(saved) : {
      newEnquiries: true,
      priceDrops: true,
      siteVisitReminders: true,
      marketingAlerts: false,
      smsAlerts: true
    };
  });
  const [prefSaved, setPrefSaved] = useState(false);

  // Privacy Preferences
  const [privacy, setPrivacy] = useState(() => {
    const saved = localStorage.getItem('user_privacy_prefs');
    return saved ? JSON.parse(saved) : {
      maskPhone: false,
      allowDirectWhatsapp: true,
      showActivityStatus: true
    };
  });

  // Handle PIN Change
  const handlePinChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPinStatus(null);

    if (newPin.length !== 4 || !/^\d{4}$/.test(newPin)) {
      setPinStatus({
        type: 'error',
        message: language === 'ta' ? 'புதிய PIN சரியாக 4 இலக்கங்களைக் கொண்டிருக்க வேண்டும்.' : 'New PIN must be exactly 4 digits.'
      });
      return;
    }

    if (newPin !== confirmPin) {
      setPinStatus({
        type: 'error',
        message: language === 'ta' ? 'உறுதிப்படுத்திய PIN பொருந்தவில்லை.' : 'New PIN and Confirm PIN do not match.'
      });
      return;
    }

    if (!user?.phone) {
      setPinStatus({
        type: 'error',
        message: language === 'ta' ? 'பயனர் கைபேசி எண் கிடைக்கவில்லை.' : 'User phone number not found.'
      });
      return;
    }

    setIsUpdatingPin(true);
    try {
      await authService.setPin(user.phone, newPin);
      setPinStatus({
        type: 'success',
        message: language === 'ta' ? 'உங்கள் 4-இலக்க PIN வெற்றிகரமாக மாற்றப்பட்டது!' : 'Your 4-digit PIN has been updated successfully!'
      });
      setOldPin('');
      setNewPin('');
      setConfirmPin('');
    } catch (err: any) {
      setPinStatus({
        type: 'error',
        message: err.message || (language === 'ta' ? 'PIN புதுப்பிக்க முடியவில்லை.' : 'Failed to update PIN. Please try again.')
      });
    } finally {
      setIsUpdatingPin(false);
    }
  };

  // Toggle Notification setting
  const handleToggleNotification = (key: keyof typeof notifications) => {
    const updated = { ...notifications, [key]: !notifications[key] };
    setNotifications(updated);
    localStorage.setItem('user_notification_prefs', JSON.stringify(updated));
    showPrefSavedToast();
  };

  // Toggle Privacy setting
  const handleTogglePrivacy = (key: keyof typeof privacy) => {
    const updated = { ...privacy, [key]: !privacy[key] };
    setPrivacy(updated);
    localStorage.setItem('user_privacy_prefs', JSON.stringify(updated));
    showPrefSavedToast();
  };

  const showPrefSavedToast = () => {
    setPrefSaved(true);
    setTimeout(() => setPrefSaved(false), 2500);
  };

  // Clear cache action
  const handleClearCache = () => {
    if (window.confirm(language === 'ta' ? 'உள்ளூர் சேமிப்பகம் மற்றும் தற்காலிகத் தரவை அழிக்க விரும்புகிறீர்களா?' : 'Clear local app cache and temporary storage?')) {
      const token = localStorage.getItem('land_selling_app_token');
      const userRaw = localStorage.getItem('land_selling_app_user');
      localStorage.clear();
      sessionStorage.clear();
      if (token) localStorage.setItem('land_selling_app_token', token);
      if (userRaw) localStorage.setItem('land_selling_app_user', userRaw);
      alert(language === 'ta' ? 'தற்காலிகத் தரவு வெற்றிகரமாக அழிக்கப்பட்டது.' : 'Application cache cleared successfully.');
    }
  };

  // Delete account confirmation
  const handleDeleteAccount = async () => {
    const confirmText = prompt(language === 'ta' ? 'உங்கள் கணக்கை நிரந்தரமாக நீக்க "DELETE" என்று உள்ளிடவும்:' : 'Type "DELETE" to permanently delete your account:');
    if (confirmText === 'DELETE') {
      await logout();
      alert(language === 'ta' ? 'உங்கள் கணக்கு நீக்கப்பட்டது.' : 'Your account has been deleted.');
      window.location.href = '/';
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>{language === 'ta' ? 'கணக்கு அமைப்புகள்' : 'Account Settings'}</h1>
        <p className={styles.subtitle}>
          {language === 'ta' ? 'உங்கள் பாதுகாப்பு, அறிவிப்புகள் மற்றும் விருப்பங்களை நிர்வகிக்கவும்' : 'Manage your security, notification preferences, and privacy controls'}
        </p>
      </div>

      {prefSaved && (
        <div className={`${styles.statusMessage} ${styles.statusSuccess}`}>
          <CheckCircle size={18} />
          {language === 'ta' ? 'விருப்பத்தேர்வுகள் சேமிக்கப்பட்டன!' : 'Preferences saved successfully!'}
        </div>
      )}

      {/* Language Preference */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <Globe size={22} color="var(--color-primary)" />
          <h2 className={styles.sectionTitle}>{language === 'ta' ? 'மொழி / Language' : 'Preferred Language'}</h2>
        </div>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)', marginBottom: 'var(--spacing-4)' }}>
          {language === 'ta' ? 'பயன்பாட்டின் இடைமுக மொழியைத் தேர்வுசெய்யவும்:' : 'Select your display language for the application:'}
        </p>
        <div className={styles.radioGroup}>
          <div 
            className={`${styles.radioCard} ${language === 'en' ? styles.radioCardActive : ''}`}
            onClick={() => setLanguage('en')}
          >
            <input type="radio" checked={language === 'en'} onChange={() => setLanguage('en')} />
            <div>
              <strong>English</strong>
              <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>Default language</div>
            </div>
          </div>
          <div 
            className={`${styles.radioCard} ${language === 'ta' ? styles.radioCardActive : ''}`}
            onClick={() => setLanguage('ta')}
          >
            <input type="radio" checked={language === 'ta'} onChange={() => setLanguage('ta')} />
            <div>
              <strong>தமிழ் (Tamil)</strong>
              <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>தமிழ் மொழி ஆதரவு</div>
            </div>
          </div>
        </div>
      </div>

      {/* Security & PIN */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <KeyRound size={22} color="var(--color-primary)" />
          <h2 className={styles.sectionTitle}>{language === 'ta' ? 'பாதுகாப்பு & 4-இலக்க PIN' : 'Security & 4-Digit PIN'}</h2>
        </div>

        {pinStatus && (
          <div className={`${styles.statusMessage} ${pinStatus.type === 'success' ? styles.statusSuccess : styles.statusError}`}>
            {pinStatus.type === 'success' ? <CheckCircle size={18} /> : <AlertTriangle size={18} />}
            {pinStatus.message}
          </div>
        )}

        <form onSubmit={handlePinChange}>
          <div className={styles.formGrid}>
            <div>
              <Input
                label={language === 'ta' ? 'தற்போதைய PIN (தெரிந்தால்)' : 'Current PIN (optional if first change)'}
                type="password"
                maxLength={4}
                placeholder="••••"
                value={oldPin}
                onChange={(e) => setOldPin(e.target.value.replace(/\D/g, '').substring(0, 4))}
              />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--spacing-4)' }}>
              <Input
                label={language === 'ta' ? 'புதிய 4-இலக்க PIN' : 'New 4-Digit PIN'}
                type="password"
                maxLength={4}
                placeholder="••••"
                value={newPin}
                required
                onChange={(e) => setNewPin(e.target.value.replace(/\D/g, '').substring(0, 4))}
              />
              <Input
                label={language === 'ta' ? 'புதிய PIN-ஐ உறுதிசெய்க' : 'Confirm New PIN'}
                type="password"
                maxLength={4}
                placeholder="••••"
                value={confirmPin}
                required
                onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, '').substring(0, 4))}
              />
            </div>
          </div>

          <div style={{ marginTop: 'var(--spacing-4)' }}>
            <Button type="submit" variant="primary" disabled={isUpdatingPin || newPin.length !== 4}>
              {isUpdatingPin 
                ? (language === 'ta' ? 'புதுப்பிக்கப்படுகிறது...' : 'Updating PIN...') 
                : (language === 'ta' ? 'PIN மாற்றவும்' : 'Update 4-Digit PIN')}
            </Button>
          </div>
        </form>
      </div>

      {/* Notification Preferences */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <Bell size={22} color="var(--color-primary)" />
          <h2 className={styles.sectionTitle}>{language === 'ta' ? 'அறிவிப்பு விருப்பத்தேர்வுகள்' : 'Notification Preferences'}</h2>
        </div>

        <div className={styles.toggleRow}>
          <div className={styles.toggleInfo}>
            <div className={styles.toggleLabel}>
              {language === 'ta' ? 'சொத்து விசாரணைகள் & செய்திகள்' : 'Property Enquiries & Messages'}
            </div>
            <div className={styles.toggleDescription}>
              {language === 'ta' ? 'வாங்குபவர்கள் உங்கள் நிலம் குறித்து விசாரிக்கும் போது உடனடி எச்சரிக்கை' : 'Receive instant alerts when buyers enquire about your properties'}
            </div>
          </div>
          <label className={styles.switch}>
            <input 
              type="checkbox" 
              checked={notifications.newEnquiries} 
              onChange={() => handleToggleNotification('newEnquiries')} 
            />
            <span className={styles.slider}></span>
          </label>
        </div>

        <div className={styles.toggleRow}>
          <div className={styles.toggleInfo}>
            <div className={styles.toggleLabel}>
              {language === 'ta' ? 'விலை குறைப்பு எச்சரிக்கைகள்' : 'Price Drop Alerts'}
            </div>
            <div className={styles.toggleDescription}>
              {language === 'ta' ? 'நீங்கள் பின்தொடரும் நிலங்களின் விலை குறையும் போது தெரிவிக்கவும்' : 'Get notified when properties in your favorites reduce prices'}
            </div>
          </div>
          <label className={styles.switch}>
            <input 
              type="checkbox" 
              checked={notifications.priceDrops} 
              onChange={() => handleToggleNotification('priceDrops')} 
            />
            <span className={styles.slider}></span>
          </label>
        </div>

        <div className={styles.toggleRow}>
          <div className={styles.toggleInfo}>
            <div className={styles.toggleLabel}>
              {language === 'ta' ? 'நேரடி வருகை நினைவூட்டல்கள்' : 'Site Visit Reminders'}
            </div>
            <div className={styles.toggleDescription}>
              {language === 'ta' ? 'திட்டமிடப்பட்ட நில ஆய்வு வருகைகள் குறித்த முன் எச்சரிக்கை' : 'Reminders 24 hours prior to scheduled property site visits'}
            </div>
          </div>
          <label className={styles.switch}>
            <input 
              type="checkbox" 
              checked={notifications.siteVisitReminders} 
              onChange={() => handleToggleNotification('siteVisitReminders')} 
            />
            <span className={styles.slider}></span>
          </label>
        </div>

        <div className={styles.toggleRow}>
          <div className={styles.toggleInfo}>
            <div className={styles.toggleLabel}>
              {language === 'ta' ? 'SMS குறுஞ்செய்தி எச்சரிக்கைகள்' : 'SMS Alerts to Mobile'}
            </div>
            <div className={styles.toggleDescription}>
              {language === 'ta' ? 'முக்கிய அறிவிப்புகளை உங்கள் கைபேசிக்கு SMS ஆக அனுப்பவும்' : 'Receive critical transaction and enquiry updates via SMS'}
            </div>
          </div>
          <label className={styles.switch}>
            <input 
              type="checkbox" 
              checked={notifications.smsAlerts} 
              onChange={() => handleToggleNotification('smsAlerts')} 
            />
            <span className={styles.slider}></span>
          </label>
        </div>
      </div>

      {/* Privacy & Visibility */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <ShieldCheck size={22} color="var(--color-primary)" />
          <h2 className={styles.sectionTitle}>{language === 'ta' ? 'தனியுரிமை & வெளிப்படைத்தன்மை' : 'Privacy & Direct Contact'}</h2>
        </div>

        <div className={styles.toggleRow}>
          <div className={styles.toggleInfo}>
            <div className={styles.toggleLabel}>
              {language === 'ta' ? 'WhatsApp நேரடி இணைப்பு' : 'Allow Direct WhatsApp Connect'}
            </div>
            <div className={styles.toggleDescription}>
              {language === 'ta' ? 'சரிபார்க்கப்பட்ட வாங்குபவர்கள் உங்களை WhatsApp மூலம் நேரடியாக தொடர்பு கொள்ள அனுமதிக்கவும்' : 'Allow verified buyers to initiate WhatsApp chats for your listings'}
            </div>
          </div>
          <label className={styles.switch}>
            <input 
              type="checkbox" 
              checked={privacy.allowDirectWhatsapp} 
              onChange={() => handleTogglePrivacy('allowDirectWhatsapp')} 
            />
            <span className={styles.slider}></span>
          </label>
        </div>

        <div className={styles.toggleRow}>
          <div className={styles.toggleInfo}>
            <div className={styles.toggleLabel}>
              {language === 'ta' ? 'உள்நுழையாத பயனர்களுக்கு தொலைபேசி எண்ணை மறைக்கவும்' : 'Mask Phone Number to Unregistered Users'}
            </div>
            <div className={styles.toggleDescription}>
              {language === 'ta' ? 'உள்நுழைந்த மற்றும் சரிபார்க்கப்பட்ட பயனர்கள் மட்டுமே உங்கள் எண்ணைப் பார்க்க முடியும்' : 'Only logged-in verified users can view full seller contact digits'}
            </div>
          </div>
          <label className={styles.switch}>
            <input 
              type="checkbox" 
              checked={privacy.maskPhone} 
              onChange={() => handleTogglePrivacy('maskPhone')} 
            />
            <span className={styles.slider}></span>
          </label>
        </div>
      </div>

      {/* Danger Zone */}
      <div className={`${styles.section} ${styles.dangerZone}`}>
        <div className={styles.sectionHeader}>
          <AlertTriangle size={22} color="var(--color-error)" />
          <h2 className={`${styles.sectionTitle} ${styles.dangerHeader}`}>
            {language === 'ta' ? 'ஆபத்து மண்டலம் / கணக்கு கட்டுப்பாடு' : 'Danger Zone'}
          </h2>
        </div>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)', marginBottom: 'var(--spacing-4)' }}>
          {language === 'ta' 
            ? 'இந்த நடவடிக்கைகள் உங்கள் சேமிக்கப்பட்ட தரவு மற்றும் பயன்பாட்டு நிலையை பாதிக்கும்.' 
            : 'These actions affect your device cache or permanently close your account.'}
        </p>

        <div style={{ display: 'flex', gap: 'var(--spacing-4)', flexWrap: 'wrap' }}>
          <Button variant="outline" onClick={handleClearCache}>
            <Smartphone size={16} style={{ marginRight: '6px' }} />
            {language === 'ta' ? 'தற்காலிக சேமிப்பை அழிக்கவும்' : 'Clear App Cache'}
          </Button>

          <Button 
            variant="outline" 
            onClick={handleDeleteAccount}
            style={{ color: 'var(--color-error)', borderColor: 'var(--color-error)' }}
          >
            <Trash2 size={16} style={{ marginRight: '6px' }} />
            {language === 'ta' ? 'கணக்கை நிரந்தரமாக நீக்கு' : 'Delete Account'}
          </Button>
        </div>
      </div>
    </div>
  );
}
