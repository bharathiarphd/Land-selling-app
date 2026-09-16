import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Home from './pages/Home';
import Search from './pages/Search';
import PropertyDetail from './pages/PropertyDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import VerifyOTP from './pages/VerifyOTP';
import AddProperty from './pages/AddProperty';
import MyProperties from './pages/MyProperties';
import Favorites from './pages/Favorites';
import Profile from './pages/Profile';
import Notifications from './pages/Notifications';
import Messages from './pages/Messages';
import Settings from './pages/Settings';
import Help from './pages/Help';
import Enquiries from './pages/Enquiries';
import Compare from './pages/Compare';
import SavedSearches from './pages/SavedSearches';
import AreaConverter from './pages/tools/AreaConverter';
import PriceCalculator from './pages/tools/PriceCalculator';
import Pricing from './pages/Pricing';
import AgentProfile from './pages/AgentProfile';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import NotFound from './pages/NotFound';

// Ultimate Upgrade Additions
import LandCalculator from './pages/LandCalculator';
import DimensionCalculator from './pages/DimensionCalculator';
import PostRequirement from './pages/PostRequirement';
import BuyerRequirements from './pages/BuyerRequirements';
import SiteVisits from './pages/SiteVisits';
import MapSearch from './pages/MapSearch';
import Safety from './pages/Safety';
import PriceGuide from './pages/PriceGuide';

import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AdminRoute } from './components/AdminRoute';
import { ErrorBoundary } from './components/ErrorBoundary';

// Admin Pages
import { AdminLayout } from './layouts/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminProperties from './pages/admin/AdminProperties';
import AdminDocuments from './pages/admin/AdminDocuments';
import AdminReports from './pages/admin/AdminReports';
import AdminActivityLogs from './pages/admin/AdminActivityLogs';
import AdminSettings from './pages/admin/AdminSettings';
import AdminAbstractReport from './pages/admin/AdminAbstractReport';
import AdminComplaints from './pages/admin/AdminComplaints';

function App() {
  return (
    <ErrorBoundary>
      <LanguageProvider>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
          <Route path="/" element={<MainLayout />}>
            {/* Public Routes */}
            <Route index element={<Home />} />
            <Route path="search" element={<Search />} />
            <Route path="property/:id" element={<PropertyDetail />} />
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
            <Route path="verify-otp" element={<VerifyOTP />} />
            <Route path="help" element={<Help />} />
            <Route path="terms" element={<Terms />} />
            <Route path="privacy" element={<Privacy />} />
            <Route path="compare" element={<Compare />} />
            <Route path="tools/area-converter" element={<AreaConverter />} />
            <Route path="tools/price-calculator" element={<PriceCalculator />} />
            <Route path="tools/land-calculator" element={<LandCalculator />} />
            <Route path="tools/dimension-calculator" element={<DimensionCalculator />} />
            <Route path="map-search" element={<MapSearch />} />
            <Route path="safety" element={<Safety />} />
            <Route path="price-guide" element={<PriceGuide />} />
            <Route path="post-requirement" element={<PostRequirement />} />
            <Route path="buyer-requirements" element={<BuyerRequirements />} />
            <Route path="pricing" element={<Pricing />} />
            <Route path="agent/:id" element={<AgentProfile />} />

            {/* Protected Routes */}
            <Route path="add-property" element={<ProtectedRoute><AddProperty /></ProtectedRoute>} />
            <Route path="my-properties" element={<ProtectedRoute><MyProperties /></ProtectedRoute>} />
            <Route path="favorites" element={<ProtectedRoute><Favorites /></ProtectedRoute>} />
            <Route path="profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
            <Route path="messages" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
            <Route path="enquiries" element={<ProtectedRoute><Enquiries /></ProtectedRoute>} />
            <Route path="my-enquiries" element={<ProtectedRoute><Enquiries /></ProtectedRoute>} />
            <Route path="saved-searches" element={<ProtectedRoute><SavedSearches /></ProtectedRoute>} />
            <Route path="site-visits" element={<ProtectedRoute><SiteVisits /></ProtectedRoute>} />
            <Route path="settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />

            {/* 404 Route */}
            <Route path="*" element={<NotFound />} />
          </Route>

          {/* Admin Routes */}
          <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="properties" element={<AdminProperties />} />
            <Route path="documents" element={<AdminDocuments />} />
            <Route path="reports" element={<AdminReports />} />
            <Route path="reports/abstract" element={<AdminAbstractReport />} />
            <Route path="activity-logs" element={<AdminActivityLogs />} />
            <Route path="complaints" element={<AdminComplaints />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
    </LanguageProvider>
    </ErrorBoundary>
  );
}

export default App;
