import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import Layout from './components/layout/Layout';
import Dashboard from './pages/dashboard/Dashboard';
import Stations from './pages/stations/Stations';
import Users from './pages/users/Users';
import ChargingSessions from './pages/charging/ChargingSessions';
import Payments from './pages/payments/Payments';
import Analytics from './pages/analytics/Analytics';
import Settings from './pages/settings/Settings';
import Reports from './pages/reports/Reports';
import Notifications from './pages/notifications/Notifications';
import Support from './pages/support/Support';
import './index.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="min-h-screen bg-background">
          <Layout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/stations" element={<Stations />} />
              <Route path="/users" element={<Users />} />
              <Route path="/charging" element={<ChargingSessions />} />
              <Route path="/payments" element={<Payments />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/support" element={<Support />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
          </Layout>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: 'hsl(var(--card))',
                color: 'hsl(var(--card-foreground))',
                border: '1px solid hsl(var(--border))',
              },
            }}
          />
        </div>
      </Router>
    </QueryClientProvider>
  );
}

export default App;