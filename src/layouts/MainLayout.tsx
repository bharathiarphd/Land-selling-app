import { Outlet } from 'react-router-dom';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { BottomNavigation } from '../components/BottomNavigation';
import { PWAInstallPrompt } from '../components/PWAInstallPrompt';

export default function MainLayout() {
  return (
    <div className="layout-content">
      <Header />
      <main>
        <Outlet />
      </main>
      <Footer />
      <BottomNavigation />
      <PWAInstallPrompt />
    </div>
  );
}
