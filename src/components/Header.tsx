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
import { isAdminUser, getDisplayUserId } from '../utils/adminAuth';
import styles from './Header.module.css';

export function Header() {
  const { user, isAuthenticated } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const location = useLocation();

  const isAdmin = isAdminUser(user);
  const displayId = getDisplayUserId(user);

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'ta' : 'en');
  };

  const navItems = [
    { path: '/', label: t('nav.home') || 'Home', icon: Home },
    { path: '/search', label: t('nav.search') || 'Search', icon: Search },
    { path: '/map-search', label: 'Map', icon: MapPin },
    { path: '/buyer-requirements', label: 'Demand', icon: TrendingUp },
    { path: '/add-property', label: t('nav.addProperty') || 'Add Property', icon: PlusCircle },
    // Admin Panel is strictly shown ONLY when the logged-in user ID is 8248843385
    ...(isAdmin ? [{ path: '/admin', label: 'Admin Panel', icon: Shield }] : []),
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
          
          {/* Profile & Logged In ID Display: Shows logged-in ID for all users */}
          {isAuthenticated && user ? (
            <Link
              to="/profile"
              className={`${styles.userBadge} ${isAdmin ? styles.userBadgeAdmin : ''}`}
              title={
                language === 'ta'
                  ? `உள்நுழைவு ஐடி: ${displayId} (${isAdmin ? 'நிர்வாகி' : 'சுயவிவரம்'})`
                  : `Logged In ID: ${displayId} (${isAdmin ? 'Admin' : 'Profile'})`
              }
              id="header-user-profile-badge"
            >
              <div className={`${styles.userAvatar} ${isAdmin ? styles.userAvatarAdmin : ''}`}>
                <User size={16} strokeWidth={2.4} />
                <span className={styles.userStatusDot} />
              </div>
              <div className={styles.userInfo}>
                <span className={`${styles.userRoleLabel} ${isAdmin ? styles.userRoleLabelAdmin : ''}`}>
                  {isAdmin ? '👑 Admin' : (language === 'ta' ? 'ஐடி (ID)' : 'User ID')}
                </span>
                <span className={styles.userIdText}>
                  {displayId}
                </span>
              </div>
            </Link>
          ) : (
            <Link
              to="/login"
              className={styles.loginBadge}
              title={language === 'ta' ? 'உள்நுழைவு' : 'Login'}
              id="header-login-btn"
            >
              <User size={16} strokeWidth={2.2} />
              <span>{language === 'ta' ? 'உள்நுழைவு' : 'Login'}</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
