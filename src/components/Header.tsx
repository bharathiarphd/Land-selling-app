import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  Search, 
  MapPin, 
  TrendingUp, 
  PlusCircle, 
  Shield, 
  Heart, 
  Bell, 
  User, 
  Globe 
} from 'lucide-react';
import { Logo } from './Logo';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import styles from './Header.module.css';

export function Header() {
  const { isAuthenticated } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const location = useLocation();

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'ta' : 'en');
  };

  const navItems = [
    { path: '/', label: t('nav.home') || 'Home', icon: Home },
    { path: '/search', label: t('nav.search') || 'Search', icon: Search },
    { path: '/map-search', label: 'Map', icon: MapPin },
    { path: '/buyer-requirements', label: 'Demand', icon: TrendingUp },
    { path: '/add-property', label: t('nav.addProperty') || 'Add Property', icon: PlusCircle },
    { path: '/admin', label: 'Admin Panel', icon: Shield },
  ];

  return (
    <header className={styles.header}>
      <div className={`container ${styles.inner}`}>
        <div className={styles.left}>
          <Link to="/">
            <Logo />
          </Link>
          {/* Mobile Location Indicator */}
          <div className={styles.location}>
            <MapPin size={14} className={styles.locationIcon} />
            <span>Chennai, TN</span>
          </div>
        </div>

        {/* Desktop Navigation with Dynamic Active Color & Icon */}
        <nav className={styles.desktopNav}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isSelected = item.path === '/'
              ? location.pathname === '/'
              : location.pathname.startsWith(item.path);

            return (
              <Link
                key={item.path}
                to={item.path}
                className={styles.navLink}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 12px',
                  borderRadius: '8px',
                  color: isSelected ? 'var(--color-primary, #0284c7)' : 'var(--color-text-secondary, #64748b)',
                  backgroundColor: isSelected ? 'rgba(2, 132, 199, 0.08)' : 'transparent',
                  fontWeight: isSelected ? 600 : 500,
                  transition: 'all 0.2s ease',
                  textDecoration: 'none'
                }}
              >
                <Icon
                  size={17}
                  color={isSelected ? 'var(--color-primary, #0284c7)' : '#64748b'}
                  strokeWidth={isSelected ? 2.3 : 1.8}
                />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className={styles.right}>
          {/* Language Switcher */}
          <button 
            onClick={toggleLanguage} 
            className={styles.iconBtn}
            style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', padding: '6px 12px', border: '1px solid var(--color-border)' }}
            title="Switch Language"
          >
            <Globe size={16} style={{ marginRight: '6px' }} className={styles.hideDesktop} />
            <span className={styles.hideMobile}>
              {language === 'en' ? 'English | தமிழ்' : 'தமிழ் | English'}
            </span>
            <span className={styles.hideDesktop}>
              {language === 'en' ? 'EN / தமிழ்' : 'தமிழ் / EN'}
            </span>
          </button>

          {/* Favorites Link */}
          <Link
            to="/favorites"
            className={`${styles.iconBtn} ${styles.desktopNav}`}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: '8px',
              color: location.pathname === '/favorites' ? '#e11d48' : '#64748b',
              backgroundColor: location.pathname === '/favorites' ? 'rgba(225, 29, 72, 0.08)' : 'transparent',
              fontWeight: location.pathname === '/favorites' ? 600 : 500,
              textDecoration: 'none'
            }}
          >
            <Heart size={16} color={location.pathname === '/favorites' ? '#e11d48' : '#64748b'} strokeWidth={location.pathname === '/favorites' ? 2.3 : 1.8} />
            <span>Favorites</span>
          </Link>
          
          {/* Notifications */}
          <Link
            to="/notifications"
            className={styles.iconBtn}
            style={{
              color: location.pathname === '/notifications' ? 'var(--color-primary, #0284c7)' : 'inherit'
            }}
            title="Notifications"
          >
            <Bell size={20} color={location.pathname === '/notifications' ? 'var(--color-primary, #0284c7)' : 'currentColor'} />
          </Link>
          
          {/* Profile Symbol: GREEN when logged in, RED when not logged in */}
          <Link
            to={isAuthenticated ? '/profile' : '/login'}
            className={styles.iconBtn}
            style={{
              color: isAuthenticated ? '#16a34a' : '#dc2626',
              backgroundColor: isAuthenticated ? 'rgba(22, 163, 74, 0.1)' : 'rgba(220, 38, 38, 0.1)',
              border: `1.5px solid ${isAuthenticated ? '#86efac' : '#fca5a5'}`,
              padding: '6px',
              borderRadius: '50%',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              transition: 'all 0.2s ease',
              textDecoration: 'none'
            }}
            title={
              isAuthenticated 
                ? (language === 'ta' ? 'சுயவிவரம் (உள்நுழைந்துள்ளது - பச்சை)' : 'Profile (Logged In - Green)') 
                : (language === 'ta' ? 'உள்நுழைவு (உள்நுழையவில்லை - சிவப்பு)' : 'Login (Not Logged In - Red)')
            }
          >
            <User
              size={20}
              color={isAuthenticated ? '#16a34a' : '#dc2626'}
              strokeWidth={2.2}
            />
            {/* Online Status Dot Badge */}
            <span
              style={{
                position: 'absolute',
                bottom: '-1px',
                right: '-1px',
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: isAuthenticated ? '#16a34a' : '#dc2626',
                border: '1.5px solid #ffffff',
                boxShadow: isAuthenticated ? '0 0 6px rgba(22, 163, 74, 0.6)' : '0 0 6px rgba(220, 38, 38, 0.6)'
              }}
            />
          </Link>
        </div>
      </div>
    </header>
  );
}
