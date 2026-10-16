import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Phone, 
  Mail, 
  ShieldCheck, 
  LogOut, 
  Settings, 
  Bell, 
  Heart, 
  Home, 
  Edit2, 
  Check, 
  X, 
  Shield,
  MapPin,
  Navigation,
  Compass,
  Loader2,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Select } from '../components/Select';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { authService, type User } from '../services/authService';
import { locationService, validateIndianPincode } from '../services/locationService';
import { isAdminUser } from '../utils/adminAuth';
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

export default function Profile() {
  const { user, login, logout } = useAuth();
  const navigate = useNavigate();
  const { t, language } = useLanguage();

  // Phone editing states
  const [isEditingPhone, setIsEditingPhone] = useState(false);
  const [phoneInput, setPhoneInput] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Location and Address states
  const [isUpdatingLocation, setIsUpdatingLocation] = useState(false);
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [isSavingAddress, setIsSavingAddress] = useState(false);
  const [locationNotice, setLocationNotice] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);

  const [addressFormData, setAddressFormData] = useState({
    address: '',
    locality: '',
    city: '',
    district: '',
    state: 'Tamil Nadu',
    pincode: '',
    country: 'India',
    latitude: null as number | null,
    longitude: null as number | null
  });

  // Automatically purge the placeholder testing phone number if present
  useEffect(() => {
    if (user?.phone && user.phone.includes('9876543210')) {
      const cleanedUser = { ...user, phone: '' };
      login(cleanedUser);
      localStorage.setItem('land_selling_app_user', JSON.stringify(cleanedUser));
    }
  }, [user, login]);

  // Sync saved profile from Firebase Cloud Firestore on mount if available
  useEffect(() => {
    let isMounted = true;
    const loadFirebaseProfile = async () => {
      if (user?.id) {
        try {
          const fsProfile = await authService.fetchUserProfileFromFirestore(user.id);
          if (fsProfile && isMounted) {
            const hasNewAddress = 
              (fsProfile.address && !user.address) ||
              (fsProfile.locality && !user.locality) ||
              (fsProfile.city && !user.city) ||
              (fsProfile.district && !user.district) ||
              (fsProfile.pincode && !user.pincode) ||
              (fsProfile.latitude !== undefined && user.latitude === undefined);

            if (hasNewAddress) {
              const enrichedUser: User = {
                ...user,
                address: user.address || fsProfile.address,
                locality: user.locality || fsProfile.locality,
                city: user.city || fsProfile.city,
                district: user.district || fsProfile.district,
                town: user.town || fsProfile.town,
                state: user.state || fsProfile.state,
                pincode: user.pincode || fsProfile.pincode,
                country: user.country || fsProfile.country,
                latitude: user.latitude !== undefined ? user.latitude : fsProfile.latitude,
                longitude: user.longitude !== undefined ? user.longitude : fsProfile.longitude
              };
              login(enrichedUser);
              localStorage.setItem('land_selling_app_user', JSON.stringify(enrichedUser));
            }
          }
        } catch (_) {}
      }
    };

    loadFirebaseProfile();
    return () => { isMounted = false; };
  }, [user?.id]);

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

  // Open manual address edit form
  const handleStartEditAddress = () => {
    setAddressFormData({
      address: user.address || '',
      locality: user.locality || '',
      city: user.city || user.town || '',
      district: user.district || '',
      state: user.state || 'Tamil Nadu',
      pincode: user.pincode || '',
      country: user.country || 'India',
      latitude: user.latitude ?? null,
      longitude: user.longitude ?? null
    });
    setLocationNotice(null);
    setIsEditingAddress(true);
  };

  // “Update My Location” button click: requests GPS and reverse geocodes
  const handleUpdateMyLocation = async () => {
    setIsUpdatingLocation(true);
    setLocationNotice(null);

    try {
      const result = await locationService.detectAndGeocode();

      if (result.success && result.data) {
        const data = result.data;

        // Match district
        let matchedDistrict = data.district || '';
        const foundOption = DISTRICT_OPTIONS.find(opt => {
          if (!opt.value) return false;
          const optVal = opt.value.toLowerCase();
          const dist = (data.district || '').toLowerCase();
          const cityName = (data.city || '').toLowerCase();
          return optVal === dist || opt.label.toLowerCase().includes(dist) || optVal === cityName;
        });

        if (foundOption) {
          matchedDistrict = foundOption.value;
        } else if (!matchedDistrict) {
          matchedDistrict = 'Other';
        }

        setAddressFormData({
          address: data.address || user.address || '',
          locality: data.locality || user.locality || '',
          city: data.city || data.locality || user.city || user.town || '',
          district: matchedDistrict || user.district || '',
          state: data.state || user.state || 'Tamil Nadu',
          pincode: data.pincode || user.pincode || '',
          country: data.country || user.country || 'India',
          latitude: data.latitude,
          longitude: data.longitude
        });

        setIsEditingAddress(true);
        setLocationNotice({
          type: 'success',
          message: language === 'ta'
            ? `புதிய GPS இருப்பிடம் பெறப்பட்டது (${matchedDistrict || data.city}, PIN: ${data.pincode || 'கண்டறியப்பட்டது'})! விவரங்களை சரிபார்த்து சேமிக்கவும்.`
            : `GPS location detected (${matchedDistrict || data.city}, PIN: ${data.pincode || 'Auto-filled'})! Please verify and save below.`
        });
      } else {
        setLocationNotice({
          type: 'error',
          message: result.error || (language === 'ta'
            ? 'இருப்பிடத்தை பெற முடியவில்லை. கைமுறையாக முகவரியை உள்ளிடலாம்.'
            : 'Unable to detect location. You can enter or edit your address manually below.')
        });
        handleStartEditAddress();
      }
    } catch (err: any) {
      setLocationNotice({
        type: 'error',
        message: err.message || (language === 'ta'
          ? 'இருப்பிட அனுமதி வழங்கப்படவில்லை. கைமுறையாக திருத்தவும்.'
          : 'Location access was denied or failed. You can edit your address manually.')
      });
      handleStartEditAddress();
    } finally {
      setIsUpdatingLocation(false);
    }
  };

  // Confirm & Save updated address into Cloud Firestore + Backend
  const handleSaveAddress = async () => {
    if (addressFormData.pincode && !validateIndianPincode(addressFormData.pincode)) {
      setLocationNotice({
        type: 'error',
        message: language === 'ta'
          ? 'சரியான 6-இலக்க இந்திய அஞ்சல் குறியீட்டை உள்ளிடவும் (எ.கா. 641001)'
          : 'Please enter a valid 6-digit Indian postal PIN code (e.g. 641001)'
      });
      return;
    }

    setIsSavingAddress(true);
    try {
      const updated = await authService.updateUserLocation(user.id, addressFormData);
      login(updated);
      setIsEditingAddress(false);
      setLocationNotice({
        type: 'success',
        message: language === 'ta'
          ? 'உங்கள் இருப்பிடம் மற்றும் முகவரி வெற்றிகரமாக Firebase இல் சேமிக்கப்பட்டது!'
          : 'Your location and address details have been successfully saved to Firebase!'
      });
    } catch (err: any) {
      setLocationNotice({
        type: 'error',
        message: err.message || 'Failed to save address details'
      });
    } finally {
      setIsSavingAddress(false);
    }
  };

  const handleLogout = async () => {
    if (window.confirm(language === 'ta' ? 'நீங்கள் உறுதியாக வெளியேற விரும்புகிறீர்களா?' : 'Are you sure you want to logout?')) {
      await logout();
      navigate('/');
    }
  };

  const initials = user.name ? user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'U';

  const fullAddressDisplay = [
    user.address,
    user.locality,
    user.city || user.town,
    user.district,
    user.state || 'Tamil Nadu',
    user.pincode ? `PIN: ${user.pincode}` : '',
    user.country || 'India'
  ].filter(Boolean).join(', ');

  return (
    <div className={`container ${styles.authContainer}`} style={{ paddingTop: 'var(--spacing-8)', alignItems: 'stretch' }}>
      <h1 className={styles.title} style={{ textAlign: 'left', marginBottom: 'var(--spacing-6)' }}>{t('header.profile')}</h1>
      
      {/* User Header Profile Card */}
      <div className={styles.formCard} style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-4)', marginBottom: 'var(--spacing-6)' }}>
        <div style={{
          width: '80px', height: '80px', borderRadius: 'var(--radius-full)',
          backgroundColor: 'var(--color-primary-light, rgba(2, 132, 199, 0.15))', color: 'var(--color-primary, #0284c7)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 'var(--font-size-3xl, 1.875rem)', fontWeight: 'var(--font-weight-bold, 700)'
        }}>
          {initials}
        </div>
        
        <div style={{ flex: 1 }}>
          <h2 style={{ fontSize: 'var(--font-size-xl, 1.25rem)', fontWeight: 'var(--font-weight-bold, 700)', display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)' }}>
            {user.name}
            {isAdminUser(user) ? (
              <span style={{ display: 'inline-flex', backgroundColor: 'rgba(2, 132, 199, 0.15)', color: '#0284c7', padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 600 }}>
                👑 {language === 'ta' ? 'முதன்மை நிர்வாகி' : 'Super Admin'}
              </span>
            ) : user.isVerified ? (
              <span style={{ display: 'inline-flex', backgroundColor: 'var(--color-success-bg, #dcfce7)', color: 'var(--color-success-text, #15803d)', padding: '2px 8px', borderRadius: '12px', fontSize: '10px' }}>
                <ShieldCheck size={12} style={{ marginRight: '4px' }}/> {language === 'ta' ? 'சரிபார்க்கப்பட்டது' : 'Verified'}
              </span>
            ) : null}
          </h2>
          <div style={{ color: 'var(--color-text-secondary, #64748b)', fontSize: 'var(--font-size-sm, 0.875rem)', marginTop: 'var(--spacing-1)' }}>
            {isAdminUser(user) 
              ? (language === 'ta' ? 'அங்கீகரிக்கப்பட்ட நிர்வாகக் கணக்கு (ID: 8248843385)' : 'Authorized Admin Account (ID: 8248843385)')
              : `${language === 'ta' ? (user.role === 'Buyer' ? 'வாங்குபவர்' : user.role === 'Seller' ? 'விற்பனையாளர்' : 'முகவர்') : user.role} ${language === 'ta' ? 'கணக்கு' : 'Account'}`}
          </div>
          {user.userId && (
            <div style={{ fontSize: '11px', color: '#0284c7', fontWeight: 600, marginTop: '2px' }}>
              UID: {user.userId}
            </div>
          )}
        </div>
      </div>

      {/* Contact Information Card */}
      <div className={styles.formCard} style={{ marginBottom: 'var(--spacing-6)', padding: '0' }}>
        {/* Mobile Number Row */}
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
        
        {/* Email Address Row */}
        {user.email && (
          <div style={{ padding: 'var(--spacing-4)', display: 'flex', alignItems: 'center', gap: 'var(--spacing-3)' }}>
            <Mail size={20} color="var(--color-text-secondary)" />
            <div>
              <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>{language === 'ta' ? 'மின்னஞ்சல்' : 'Email Address'}</div>
              <div style={{ fontWeight: 'var(--font-weight-medium)' }}>{user.email}</div>
            </div>
          </div>
        )}
      </div>

      {/* ============================================================ */}
      {/* SAVED LOCATION & ADDRESS DETAILS CARD                        */}
      {/* ============================================================ */}
      <div className={styles.formCard} style={{ marginBottom: 'var(--spacing-6)', padding: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '8px',
              backgroundColor: 'rgba(2, 132, 199, 0.1)', color: '#0284c7',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <MapPin size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 600, margin: 0 }}>
                {language === 'ta' ? 'எனது முகவரி & இருப்பிடம்' : 'My Address & Location'}
              </h3>
              <div style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary, #64748b)' }}>
                {language === 'ta' ? 'Firebase இல் சேமிக்கப்பட்ட விவரங்கள்' : 'Saved in Firebase Database'}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {/* “Update My Location” button */}
            <Button
              size="sm"
              variant="outline"
              onClick={handleUpdateMyLocation}
              disabled={isUpdatingLocation}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                borderColor: '#0284c7',
                color: '#0284c7',
                fontWeight: 600
              }}
            >
              {isUpdatingLocation ? (
                <>
                  <Loader2 size={14} className="spin" style={{ animation: 'spin 1s linear infinite' }} />
                  <span>{language === 'ta' ? 'GPS கண்டறியப்படுகிறது...' : 'Detecting GPS...'}</span>
                </>
              ) : (
                <>
                  <Compass size={14} />
                  <span>{language === 'ta' ? 'இருப்பிடத்தை புதுப்பி (Update My Location)' : 'Update My Location'}</span>
                </>
              )}
            </Button>

            {!isEditingAddress && (
              <Button
                size="sm"
                variant="outline"
                onClick={handleStartEditAddress}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
              >
                <Edit2 size={13} />
                <span>{language === 'ta' ? 'திருத்து' : 'Edit'}</span>
              </Button>
            )}
          </div>
        </div>

        {/* Notice alert */}
        {locationNotice && (
          <div style={{
            padding: '0.6rem 0.75rem',
            borderRadius: '8px',
            fontSize: '0.82rem',
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: locationNotice.type === 'success' ? '#f0fdf4' : '#fff7ed',
            color: locationNotice.type === 'success' ? '#166534' : '#c2410c',
            border: `1px solid ${locationNotice.type === 'success' ? '#bbf7d0' : '#ffedd5'}`
          }}>
            {locationNotice.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
            <span style={{ flex: 1 }}>{locationNotice.message}</span>
          </div>
        )}

        {isEditingAddress ? (
          /* Inline Address Editing / Verification Form */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', paddingTop: '0.5rem' }}>
            <Input
              label={language === 'ta' ? 'வீட்டு எண் / தெரு முகவரி' : 'House / Street Address'}
              placeholder="e.g. Door No. 12, Gandhi Road"
              value={addressFormData.address}
              onChange={e => setAddressFormData({ ...addressFormData, address: e.target.value })}
            />

            <Input
              label={language === 'ta' ? 'உள்ளூர் பகுதி / கிராமம்' : 'Local Area / Village'}
              placeholder="e.g. Gandhipuram / Aliyar"
              value={addressFormData.locality}
              onChange={e => setAddressFormData({ ...addressFormData, locality: e.target.value })}
            />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <Input
                label={language === 'ta' ? 'நகரம் / பேரூராட்சி' : 'City / Town'}
                placeholder="e.g. Pollachi / Coimbatore"
                value={addressFormData.city}
                onChange={e => setAddressFormData({ ...addressFormData, city: e.target.value })}
              />

              <Select
                label={language === 'ta' ? 'மாவட்டம் (District)' : 'District'}
                value={addressFormData.district}
                onChange={e => setAddressFormData({ ...addressFormData, district: e.target.value })}
                options={DISTRICT_OPTIONS}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <Input
                label={language === 'ta' ? 'மாநிலம் (State)' : 'State'}
                value={addressFormData.state}
                onChange={e => setAddressFormData({ ...addressFormData, state: e.target.value })}
              />

              <Input
                label={language === 'ta' ? 'அஞ்சல் குறியீடு (PIN Code) *' : 'Postal PIN Code *'}
                type="tel"
                maxLength={6}
                value={addressFormData.pincode}
                onChange={e => {
                  const val = e.target.value.replace(/\D/g, '').substring(0, 6);
                  setAddressFormData({ ...addressFormData, pincode: val });
                }}
              />
            </div>

            {addressFormData.latitude !== null && addressFormData.longitude !== null && (
              <div style={{ fontSize: '11px', color: '#0284c7', backgroundColor: 'rgba(2, 132, 199, 0.08)', padding: '6px 10px', borderRadius: '6px', display: 'flex', justifyContent: 'space-between' }}>
                <span>📍 Lat: {addressFormData.latitude.toFixed(5)}</span>
                <span>Long: {addressFormData.longitude.toFixed(5)}</span>
              </div>
            )}

            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
              <Button size="sm" onClick={handleSaveAddress} disabled={isSavingAddress}>
                {isSavingAddress ? (
                  <>
                    <Loader2 size={14} className="spin" style={{ marginRight: '6px', animation: 'spin 1s linear infinite' }} />
                    <span>{language === 'ta' ? 'சேமிக்கிறது...' : 'Saving to Firebase...'}</span>
                  </>
                ) : (
                  <>
                    <Check size={14} style={{ marginRight: '6px' }} />
                    <span>{language === 'ta' ? 'இருப்பிடத்தை உறுதிசெய்து சேமி' : 'Confirm & Save Location'}</span>
                  </>
                )}
              </Button>
              <Button size="sm" variant="outline" onClick={() => setIsEditingAddress(false)} disabled={isSavingAddress}>
                <X size={14} style={{ marginRight: '4px' }} />
                <span>{language === 'ta' ? 'ரத்து' : 'Cancel'}</span>
              </Button>
            </div>
          </div>
        ) : (
          /* Address Details Display */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {fullAddressDisplay ? (
              <div style={{
                backgroundColor: 'var(--color-bg-secondary, #f8fafc)',
                padding: '0.85rem 1rem',
                borderRadius: '8px',
                fontSize: '0.9rem',
                lineHeight: '1.5',
                color: 'var(--color-text-primary, #1e293b)',
                border: '1px solid var(--color-border, #e2e8f0)'
              }}>
                <div style={{ fontWeight: 600, marginBottom: '2px' }}>
                  {user.address || user.locality || user.city || user.district || 'Saved Location'}
                </div>
                <div style={{ color: 'var(--color-text-secondary, #64748b)', fontSize: '0.82rem' }}>
                  {[
                    user.locality,
                    user.city || user.town,
                    user.district,
                    user.state || 'Tamil Nadu',
                    user.pincode ? `PIN: ${user.pincode}` : '',
                    user.country || 'India'
                  ].filter(Boolean).join(', ')}
                </div>
              </div>
            ) : (
              <div style={{
                padding: '1rem',
                textAlign: 'center',
                color: 'var(--color-text-secondary, #64748b)',
                fontSize: '0.85rem',
                backgroundColor: 'var(--color-bg-secondary, #f8fafc)',
                borderRadius: '8px',
                border: '1px dashed var(--color-border, #e2e8f0)'
              }}>
                {language === 'ta' 
                  ? 'முகவரி விவரங்கள் இன்னும் சேர்க்கப்படவில்லை. "இருப்பிடத்தை புதுப்பி" பட்டனை அழுத்தவும்.'
                  : 'No address details saved yet. Click "Update My Location" to detect via GPS.'}
              </div>
            )}

            {user.latitude !== undefined && user.latitude !== null && user.longitude !== undefined && user.longitude !== null && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#0284c7', marginTop: '2px' }}>
                <Navigation size={12} />
                <span>GPS Coordinates: {user.latitude.toFixed(4)}° N, {user.longitude.toFixed(4)}° E</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Navigation Quick Links */}
      <div className={styles.formCard} style={{ marginBottom: 'var(--spacing-6)', padding: '0' }}>
        {isAdminUser(user) && (
          <div onClick={() => navigate('/admin/dashboard')} style={{ padding: 'var(--spacing-4)', borderBottom: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', gap: 'var(--spacing-3)', cursor: 'pointer', backgroundColor: 'rgba(2, 132, 199, 0.05)' }}>
            <Shield size={20} color="#0284c7" />
            <span style={{ fontWeight: 600, color: '#0284c7', flex: 1 }}>{language === 'ta' ? 'நிர்வாக குழு பலகை (Admin Panel)' : 'Admin Control Panel'}</span>
            <span style={{ fontSize: '11px', backgroundColor: '#0284c7', color: '#fff', padding: '2px 6px', borderRadius: '4px' }}>8248843385</span>
          </div>
        )}
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
