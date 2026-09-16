import { Link } from 'react-router-dom';
import { MapPin, Bell, User, LogIn, Globe } from 'lucide-react';
import { Logo } from './Logo';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import styles from './Header.module.css';

export function Header() {
  const { isAuthenticated } = useAuth();
  const { language, setLanguage, t } = useLanguage();

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'ta' : 'en');
  };

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

        {/* Desktop Navigation */}
        <nav className={styles.desktopNav}>
          <Link to="/" className={styles.navLink}>{t('nav.home')}</Link>
          <Link to="/search" className={styles.navLink}>{t('nav.search')}</Link>
          <Link to="/map-search" className={styles.navLink}>Map</Link>
          <Link to="/buyer-requirements" className={styles.navLink}>Demand</Link>
          <Link to="/add-property" className={styles.navLink}>{t('nav.addProperty')}</Link>
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

          {/* Desktop Links (Icons) */}
          <Link to="/favorites" className={`${styles.iconBtn} ${styles.desktopNav}`}>
            Favorites
          </Link>
          
          <Link to="/notifications" className={styles.iconBtn}>
            <Bell size={20} />
          </Link>
          
          {isAuthenticated ? (
            <Link to="/profile" className={styles.iconBtn} title="Profile">
              <User size={20} />
            </Link>
          ) : (
            <Link to="/login" className={styles.iconBtn} title="Login">
              <LogIn size={20} />
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
