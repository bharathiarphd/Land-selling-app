import { useNavigate } from 'react-router-dom';
import { Phone, Mail, ShieldCheck, LogOut, Settings, Bell, Heart, Home } from 'lucide-react';
import { Button } from '../components/Button';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import styles from './Auth.module.css'; // Reusing auth container styles

export default function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { t, language } = useLanguage();

  const handleLogout = async () => {
    if (window.confirm(language === 'ta' ? 'நீங்கள் உறுதியாக வெளியேற விரும்புகிறீர்களா?' : 'Are you sure you want to logout?')) {
      await logout();
      navigate('/');
    }
  };

  if (!user) {
    // Should be handled by ProtectedRoute, but just in case
    return null;
  }

  const initials = user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

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
        <div style={{ padding: 'var(--spacing-4)', borderBottom: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', gap: 'var(--spacing-3)' }}>
          <Phone size={20} color="var(--color-text-secondary)" />
          <div>
            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>{language === 'ta' ? 'கைபேசி எண்' : 'Mobile Number'}</div>
            <div style={{ fontWeight: 'var(--font-weight-medium)' }}>+91 {user.phone.replace(/(\d{5})(\d{5})/, '$1 $2')}</div>
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
