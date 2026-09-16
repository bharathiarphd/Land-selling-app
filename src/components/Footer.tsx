import { Link } from 'react-router-dom';
import { Logo } from './Logo';
import styles from './Footer.module.css';

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.grid}`}>
        
        <div className={styles.brand}>
          <Logo />
          <p className={styles.description}>
            A simple platform for discovering and listing land properties. Buy and sell land with confidence.
          </p>
        </div>

        <div className={styles.section}>
          <h4 className={styles.title}>Quick Links</h4>
          <nav className={styles.linkList}>
            <Link to="/" className={styles.link}>Home</Link>
            <Link to="/search" className={styles.link}>Search</Link>
            <Link to="/add-property" className={styles.link}>Add Property</Link>
            <Link to="/favorites" className={styles.link}>Favorites</Link>
            <Link to="/profile" className={styles.link}>Profile</Link>
          </nav>
        </div>

        <div className={styles.section}>
          <h4 className={styles.title}>Property Types</h4>
          <nav className={styles.linkList}>
            <Link to="/search" className={styles.link}>Residential</Link>
            <Link to="/search" className={styles.link}>Agricultural</Link>
            <Link to="/search" className={styles.link}>Commercial</Link>
            <Link to="/search" className={styles.link}>Plots</Link>
            <Link to="/search" className={styles.link}>Farm Land</Link>
          </nav>
        </div>

        <div className={styles.section}>
          <h4 className={styles.title}>Support</h4>
          <nav className={styles.linkList}>
            <Link to="/help" className={styles.link}>Help</Link>
            <Link to="/contact" className={styles.link}>Contact</Link>
            <Link to="/terms" className={styles.link}>Terms</Link>
            <Link to="/privacy" className={styles.link}>Privacy</Link>
          </nav>
        </div>

      </div>

      <div className={`container ${styles.bottom}`}>
        <p className={styles.copyright}>© 2026 Land Selling App. All rights reserved.</p>
      </div>
    </footer>
  );
}
