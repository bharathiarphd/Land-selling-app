import { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation, NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, Users, Home, FileText, BarChart2, 
  Activity, Settings, LogOut, Menu, X, ShieldAlert 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import styles from './AdminLayout.module.css';

export function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Auto-close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className={styles.adminContainer}>
      {/* Mobile Header */}
      <div className={styles.mobileHeader}>
        <div className={styles.logo}>
          <span className={styles.logoIcon}></span>
          <span className={styles.logoText}>Admin Panel</span>
        </div>
        <button 
          className={styles.menuBtn}
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar */}
      <aside className={`${styles.sidebar} ${isMobileMenuOpen ? styles.sidebarOpen : ''}`}>
        <div className={styles.sidebarHeader}>
          <div className={styles.logo}>
            <span className={styles.logoIcon}></span>
            <span className={styles.logoText}>Admin Panel</span>
          </div>
        </div>

        <div className={styles.adminProfile}>
          <div className={styles.avatar}>{user?.name?.charAt(0) || 'A'}</div>
          <div>
            <div className={styles.adminName}>{user?.name || 'Administrator'}</div>
            <div className={styles.adminRole}>Super Admin</div>
          </div>
        </div>

        <nav className={styles.navMenu}>
          <NavLink to="/admin/dashboard" className={({isActive}) => isActive ? `${styles.navItem} ${styles.active}` : styles.navItem}>
            <LayoutDashboard size={20} /> Dashboard
          </NavLink>
          <NavLink to="/admin/users" className={({isActive}) => isActive ? `${styles.navItem} ${styles.active}` : styles.navItem}>
            <Users size={20} /> Users
          </NavLink>
          <NavLink to="/admin/properties" className={({isActive}) => isActive ? `${styles.navItem} ${styles.active}` : styles.navItem}>
            <Home size={20} /> Properties
          </NavLink>
          <NavLink to="/admin/documents" className={({isActive}) => isActive ? `${styles.navItem} ${styles.active}` : styles.navItem}>
            <FileText size={20} /> Documents
          </NavLink>
          <div className={styles.navSectionTitle} style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--color-text-muted)', marginTop: '12px', paddingLeft: '16px', letterSpacing: '0.05em' }}>REPORTS & MIS</div>
          <NavLink to="/admin/reports/abstract" className={({isActive}) => isActive ? `${styles.navItem} ${styles.active}` : styles.navItem}>
            <BarChart2 size={20} /> Abstract Report
          </NavLink>
          <NavLink to="/admin/reports" className={({isActive}) => isActive ? `${styles.navItem} ${styles.active}` : styles.navItem}>
            <BarChart2 size={20} /> Standard Reports
          </NavLink>
          <div className={styles.navSectionTitle} style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--color-text-muted)', marginTop: '12px', paddingLeft: '16px', letterSpacing: '0.05em' }}>SYSTEM</div>
          <NavLink to="/admin/complaints" className={({isActive}) => isActive ? `${styles.navItem} ${styles.active}` : styles.navItem}>
            <ShieldAlert size={20} /> Complaints
          </NavLink>
          <NavLink to="/admin/activity-logs" className={({isActive}) => isActive ? `${styles.navItem} ${styles.active}` : styles.navItem}>
            <Activity size={20} /> Activity Logs
          </NavLink>
          <NavLink to="/admin/settings" className={({isActive}) => isActive ? `${styles.navItem} ${styles.active}` : styles.navItem}>
            <Settings size={20} /> Settings
          </NavLink>
        </nav>

        <div className={styles.sidebarFooter}>
          <button className={styles.logoutBtn} onClick={handleLogout}>
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className={styles.mainContent}>
        <Outlet />
      </main>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className={styles.overlay} 
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </div>
  );
}
