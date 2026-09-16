
import { Link, useLocation } from 'react-router-dom';
import { Home, Search, PlusCircle, Heart, User, LogIn } from 'lucide-react';
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
      icon: isAuthenticated ? User : LogIn 
    },
  ];

  return (
    <nav className={styles.bottomNav}>
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = location.pathname === item.path;
        return (
          <Link
            key={item.path}
            to={item.path}
            className={`${styles.navItem} ${isActive ? styles.active : ''}`}
          >
            <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
            <span className={styles.label}>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
