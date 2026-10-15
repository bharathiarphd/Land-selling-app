import { Link, useLocation } from 'react-router-dom';
import { Home, Search, PlusCircle, Heart, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import styles from './BottomNavigation.module.css';

export function BottomNavigation() {
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  const navItems = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/search', label: 'Search', icon: Search },
    { path: '/add-property', label: 'Add', icon: PlusCircle },
    { path: '/favorites', label: 'Favorites', icon: Heart },
    { 
      path: isAuthenticated ? '/profile' : '/login', 
      label: isAuthenticated ? 'Profile' : 'Login', 
      icon: User,
      isProfile: true
    },
  ];

  return (
    <nav className={styles.bottomNav}>
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = location.pathname === item.path;

        let iconColor = isActive ? 'var(--color-primary, #0284c7)' : 'var(--color-text-secondary, #64748b)';
        let labelColor = isActive ? 'var(--color-primary, #0284c7)' : 'var(--color-text-secondary, #64748b)';

        // Profile icon: Green if logged in, Red if not logged in
        if (item.isProfile) {
          iconColor = isAuthenticated ? '#16a34a' : '#dc2626';
          labelColor = isAuthenticated ? '#16a34a' : '#dc2626';
        }

        return (
          <Link
            key={item.path}
            to={item.path}
            className={`${styles.navItem} ${isActive ? styles.active : ''}`}
            style={{
              color: labelColor,
              textDecoration: 'none'
            }}
          >
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon size={24} color={iconColor} strokeWidth={isActive ? 2.5 : 2} />
              {item.isProfile && (
                <span
                  style={{
                    position: 'absolute',
                    top: '-1px',
                    right: '-1px',
                    width: '7px',
                    height: '7px',
                    borderRadius: '50%',
                    backgroundColor: isAuthenticated ? '#16a34a' : '#dc2626',
                    border: '1px solid #ffffff'
                  }}
                />
              )}
            </div>
            <span className={styles.label} style={{ color: labelColor, fontWeight: isActive ? 600 : 500 }}>
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
