import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import RTLProvider from './components/RTLProvider';
import Dashboard from './pages/dashboard/Dashboard';
import Stations from './pages/stations/Stations';
import Users from './pages/users/Users';
import ChargingSessions from './pages/charging/ChargingSessions';
import Payments from './pages/payments/Payments';
import Analytics from './pages/analytics/Analytics';
import Reports from './pages/reports/Reports';
import Notifications from './pages/notifications/Notifications';
import Support from './pages/support/Support';
import Settings from './pages/settings/Settings';
import './index.css';

function App() {
  const [locale, setLocale] = useState('en');

  // Load saved language preference
  useEffect(() => {
    const savedLocale = localStorage.getItem('ev-admin-locale');
    if (savedLocale && ['en', 'ar', 'fa'].includes(savedLocale)) {
      setLocale(savedLocale);
    }
  }, []);

  // Save language preference
  const handleLanguageChange = (newLocale: string) => {
    setLocale(newLocale);
    localStorage.setItem('ev-admin-locale', newLocale);
  };

  return (
    <RTLProvider locale={locale}>
      <Router>
        <Layout locale={locale} onLanguageChange={handleLanguageChange}>
          <Routes>
            <Route path="/" element={<Dashboard locale={locale} />} />
            <Route path="/stations" element={<Stations locale={locale} />} />
            <Route path="/users" element={<Users locale={locale} />} />
            <Route path="/charging" element={<ChargingSessions locale={locale} />} />
            <Route path="/payments" element={<Payments locale={locale} />} />
            <Route path="/analytics" element={<Analytics locale={locale} />} />
            <Route path="/reports" element={<Reports locale={locale} />} />
            <Route path="/notifications" element={<Notifications locale={locale} />} />
            <Route path="/support" element={<Support locale={locale} />} />
            <Route path="/settings" element={<Settings locale={locale} />} />
          </Routes>
        </Layout>
      </Router>
    </RTLProvider>
  );
}

export default App;