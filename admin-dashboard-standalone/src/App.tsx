import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Stations from './pages/Stations';
import UsersPage from './pages/Users';
import ChargingSessionsPage from './pages/ChargingSessions';
import PaymentsPage from './pages/Payments';
import TokenManagement from './pages/TokenManagement';
import AnalyticsPage from './pages/Analytics';
import ReportsPage from './pages/Reports';
import NotificationsPage from './pages/Notifications';
import SupportPage from './pages/Support';
import SettingsPage from './pages/Settings';
import './i18n';

function App() {
  return (
    <Router>
      <div className="App">
        <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/stations" element={<Stations />} />
          <Route path="/users" element={<UsersPage />} />
          <Route path="/charging" element={<ChargingSessionsPage />} />
          <Route path="/payments" element={<PaymentsPage />} />
          <Route path="/tokens" element={<TokenManagement />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/support" element={<SupportPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
        </Layout>
        <Toaster position="top-right" />
      </div>
    </Router>
  );
}

export default App;