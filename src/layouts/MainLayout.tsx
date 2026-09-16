import { Outlet } from 'react-router-dom';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { BottomNavigation } from '../components/BottomNavigation';

export default function MainLayout() {
  return (
    <div className="layout-content">
      <Header />
      <main>
        <Outlet />
      </main>
      <Footer />
      <BottomNavigation />
    </div>
  );
}
