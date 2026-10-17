import { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation, NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, Users, Home, FileText, BarChart2, 
  Activity, Settings, LogOut, Menu, X, ShieldAlert,
  Search, Bell, HelpCircle, ChevronDown, List, PhoneCall
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { contactRequestUtils } from '../utils/contactRequestUtils';
import styles from './AdminLayout.module.css';

export function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [pendingContactCount, setPendingContactCount] = useState(0);

  useEffect(() => {
    setIsMobileMenuOpen(false);
    const checkPending = async () => {
      const all = await contactRequestUtils.getAllRequests();
      setPendingContactCount(all.filter(r => r.status === 'Pending').length);
    };
    checkPending();
  }, [location.pathname]);

  const handleLogout = () => {
    sessionStorage.removeItem('admin_authenticated');
    navigate('/');
  };

  return (
    <div className={styles.adminContainer}>
      {/* Sidebar */}
      <aside className={`${styles.sidebar} ${isMobileMenuOpen ? styles.sidebarOpen : ''}`}>
        <div className={styles.sidebarHeader}>
          <div className={styles.logo}>
            <span className={styles.logoIcon}></span>
            <span className={styles.logoText}>Admin Panel</span>
          </div>
          <button className={styles.mobileMenuBtn} onClick={() => setIsMobileMenuOpen(false)}>
            <X size={20} />
          </button>
        </div>

        <nav className={styles.navMenu}>
          <NavLink to="/" className={styles.navItem} style={{ marginBottom: '8px' }}>
            <Home size={18} /> Back to User App
          </NavLink>
          
          <div className={styles.navSectionTitle}>Dashboard</div>
          <NavLink to="/admin/dashboard" className={({isActive}) => isActive ? `${styles.navItem} ${styles.active}` : styles.navItem}>
            <LayoutDashboard size={18} /> Master Dashboard
          </NavLink>

          <div className={styles.navSectionTitle}>Purchase Requests</div>
          <NavLink to="/admin/contact-requests" className={({isActive}) => isActive ? `${styles.navItem} ${styles.active}` : styles.navItem}>
            <PhoneCall size={18} /> Contact Requests
            {pendingContactCount > 0 && (
              <span className={styles.badge} style={{ backgroundColor: '#ea580c', color: '#ffffff' }}>
                {pendingContactCount}
              </span>
            )}
          </NavLink>

          <div className={styles.navSectionTitle}>Users</div>
          <NavLink to="/admin/users" className={({isActive}) => isActive ? `${styles.navItem} ${styles.active}` : styles.navItem}>
            <Users size={18} /> All Users
          </NavLink>

          <div className={styles.navSectionTitle}>Properties</div>
          <NavLink to="/admin/properties" className={({isActive}) => isActive ? `${styles.navItem} ${styles.active}` : styles.navItem}>
            <Home size={18} /> All Properties
          </NavLink>

          <div className={styles.navSectionTitle}>Documents</div>
          <NavLink to="/admin/documents" className={({isActive}) => isActive ? `${styles.navItem} ${styles.active}` : styles.navItem}>
            <FileText size={18} /> Documents
            <span className={styles.badge}>8</span>
          </NavLink>

          <div className={styles.navSectionTitle}>Reports & MIS</div>
          <NavLink to="/admin/reports/abstract" className={({isActive}) => isActive ? `${styles.navItem} ${styles.active}` : styles.navItem}>
            <BarChart2 size={18} /> Abstract Report
          </NavLink>
          <NavLink to="/admin/reports" className={({isActive}) => isActive ? `${styles.navItem} ${styles.active}` : styles.navItem}>
            <List size={18} /> Standard Reports
          </NavLink>

          <div className={styles.navSectionTitle}>Monitoring</div>
          <NavLink to="/admin/complaints" className={({isActive}) => isActive ? `${styles.navItem} ${styles.active}` : styles.navItem}>
            <ShieldAlert size={18} /> Complaints
            <span className={styles.badge}>2</span>
          </NavLink>
          <NavLink to="/admin/activity-logs" className={({isActive}) => isActive ? `${styles.navItem} ${styles.active}` : styles.navItem}>
            <Activity size={18} /> Activity Logs
          </NavLink>

          <div className={styles.navSectionTitle}>System</div>
          <NavLink to="/admin/settings" className={({isActive}) => isActive ? `${styles.navItem} ${styles.active}` : styles.navItem}>
            <Settings size={18} /> Settings
          </NavLink>
        </nav>

        <div className={styles.sidebarFooter}>
          <button className={styles.logoutBtn} onClick={handleLogout}>
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Wrapper */}
      <div className={styles.mainContentWrapper}>
        {/* Top Header */}
        <header className={styles.topHeader}>
          <div className={styles.headerLeft}>
            <button className={styles.mobileMenuBtn} onClick={() => setIsMobileMenuOpen(true)}>
              <Menu size={24} />
            </button>
            <div className={styles.breadcrumb}>
              Admin / <span>Dashboard</span>
            </div>
            <div className={styles.searchBar}>
              <Search size={18} color="#94a3b8" />
              <input type="text" placeholder="Search users, properties, documents..." />
            </div>
          </div>
          <div className={styles.headerRight}>
            <button className={styles.iconBtn}>
              <HelpCircle size={20} />
            </button>
            <button className={styles.iconBtn}>
              <Bell size={20} />
              <span className={styles.notificationBadge}></span>
            </button>
            <div className={styles.adminProfile}>
              <div className={styles.avatar}>{user?.name?.charAt(0) || 'A'}</div>
              <div className={styles.adminInfo}>
                <span className={styles.adminName}>{user?.name || 'Administrator'}</span>
                <span className={styles.adminRole}>Super Admin</span>
              </div>
              <ChevronDown size={16} color="#64748b" />
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className={styles.mainContent}>
          <Outlet />
        </main>
      </div>

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
