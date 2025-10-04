import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Toaster } from 'react-hot-toast';

// Layout Components
import Layout from './components/layout/Layout';
import AuthLayout from './components/layout/AuthLayout';

// Authentication
import Login from './pages/auth/Login';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';

// Dashboard
import Dashboard from './pages/dashboard/Dashboard';
import Analytics from './pages/dashboard/Analytics';

// Station Management
import StationList from './pages/stations/StationList';
import StationDetail from './pages/stations/StationDetail';
import StationCreate from './pages/stations/StationCreate';
import StationEdit from './pages/stations/StationEdit';

// Connector Management
import ConnectorList from './pages/connectors/ConnectorList';
import ConnectorDetail from './pages/connectors/ConnectorDetail';

// Charging Sessions
import SessionList from './pages/sessions/SessionList';
import SessionDetail from './pages/sessions/SessionDetail';
import LiveMonitor from './pages/sessions/LiveMonitor';

// User Management
import UserList from './pages/users/UserList';
import UserDetail from './pages/users/UserDetail';

// Reservation Management
import ReservationList from './pages/reservations/ReservationList';
import ReservationDetail from './pages/reservations/ReservationDetail';

// Payment Management
import PaymentList from './pages/payments/PaymentList';
import PaymentDetail from './pages/payments/PaymentDetail';
import TransactionReport from './pages/payments/TransactionReport';

// Notification Management
import NotificationCenter from './pages/notifications/NotificationCenter';
import NotificationCompose from './pages/notifications/NotificationCompose';
import NotificationTemplates from './pages/notifications/NotificationTemplates';

// Support
import TicketList from './pages/support/TicketList';
import TicketDetail from './pages/support/TicketDetail';

// Settings
import Settings from './pages/settings/Settings';
import OperatorSettings from './pages/settings/OperatorSettings';
import SystemSettings from './pages/settings/SystemSettings';

// Context Providers
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { NotificationProvider } from './context/NotificationContext';

// Hooks
import { useAuth } from './hooks/useAuth';

// Theme Configuration
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#007AFF',
      light: '#5AC8FA',
      dark: '#0056CC',
    },
    secondary: {
      main: '#FF9500',
      light: '#FFB84D',
      dark: '#CC7A00',
    },
    error: {
      main: '#FF6B6B',
      light: '#FF8E8E',
      dark: '#E53E3E',
    },
    success: {
      main: '#34C759',
      light: '#6DD581',
      dark: '#2FB344',
    },
    warning: {
      main: '#FFCC00',
      light: '#FFD633',
      dark: '#E6B800',
    },
    background: {
      default: '#F8F9FA',
      paper: '#FFFFFF',
    },
  },
  typography: {
    fontFamily: '"Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    h1: {
      fontWeight: 700,
      fontSize: '2.5rem',
    },
    h2: {
      fontWeight: 600,
      fontSize: '2rem',
    },
    h3: {
      fontWeight: 600,
      fontSize: '1.75rem',
    },
    h4: {
      fontWeight: 600,
      fontSize: '1.5rem',
    },
    h5: {
      fontWeight: 600,
      fontSize: '1.25rem',
    },
    h6: {
      fontWeight: 600,
      fontSize: '1rem',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
          fontWeight: 600,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        },
      },
    },
    MuiDataGrid: {
      styleOverrides: {
        root: {
          border: 'none',
          '& .MuiDataGrid-cell': {
            borderBottom: '1px solid rgba(224, 224, 224, 1)',
          },
        },
      },
    },
  },
});

// Query Client Configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    },
  },
});

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: '#F8F9FA'
      }}>
        <div style={{
          textAlign: 'center',
          color: '#007AFF',
          fontSize: '16px',
          fontWeight: 600
        }}>
          Loading Admin Dashboard...
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Layout>{children}</Layout>;
};

// Public Route Component (only accessible when not authenticated)
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: '#F8F9FA'
      }}>
        <div style={{
          textAlign: 'center',
          color: '#007AFF',
          fontSize: '16px',
          fontWeight: 600
        }}>
          Loading...
        </div>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return <AuthLayout>{children}</AuthLayout>;
};

function App() {
  // Check if running in development
  const isDevelopment = process.env.NODE_ENV === 'development';

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <SocketProvider>
          <NotificationProvider>
            <ThemeProvider theme={theme}>
              <CssBaseline />
              <Router>
                <Routes>
                  {/* Public Routes */}
                  <Route path="/login" element={
                    <PublicRoute>
                      <Login />
                    </PublicRoute>
                  } />
                  <Route path="/forgot-password" element={
                    <PublicRoute>
                      <ForgotPassword />
                    </PublicRoute>
                  } />
                  <Route path="/reset-password" element={
                    <PublicRoute>
                      <ResetPassword />
                    </PublicRoute>
                  } />

                  {/* Protected Routes */}
                  <Route path="/dashboard" element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  } />
                  <Route path="/analytics" element={
                    <ProtectedRoute>
                      <Analytics />
                    </ProtectedRoute>
                  } />

                  {/* Station Management */}
                  <Route path="/stations" element={
                    <ProtectedRoute>
                      <StationList />
                    </ProtectedRoute>
                  } />
                  <Route path="/stations/:id" element={
                    <ProtectedRoute>
                      <StationDetail />
                    </ProtectedRoute>
                  } />
                  <Route path="/stations/create" element={
                    <ProtectedRoute>
                      <StationCreate />
                    </ProtectedRoute>
                  } />
                  <Route path="/stations/:id/edit" element={
                    <ProtectedRoute>
                      <StationEdit />
                    </ProtectedRoute>
                  } />

                  {/* Connector Management */}
                  <Route path="/connectors" element={
                    <ProtectedRoute>
                      <ConnectorList />
                    </ProtectedRoute>
                  } />
                  <Route path="/connectors/:id" element={
                    <ProtectedRoute>
                      <ConnectorDetail />
                    </ProtectedRoute>
                  } />

                  {/* Charging Sessions */}
                  <Route path="/sessions" element={
                    <ProtectedRoute>
                      <SessionList />
                    </ProtectedRoute>
                  } />
                  <Route path="/sessions/:id" element={
                    <ProtectedRoute>
                      <SessionDetail />
                    </ProtectedRoute>
                  } />
                  <Route path="/sessions/live" element={
                    <ProtectedRoute>
                      <LiveMonitor />
                    </ProtectedRoute>
                  } />

                  {/* User Management */}
                  <Route path="/users" element={
                    <ProtectedRoute>
                      <UserList />
                    </ProtectedRoute>
                  } />
                  <Route path="/users/:id" element={
                    <ProtectedRoute>
                      <UserDetail />
                    </ProtectedRoute>
                  } />

                  {/* Reservation Management */}
                  <Route path="/reservations" element={
                    <ProtectedRoute>
                      <ReservationList />
                    </ProtectedRoute>
                  } />
                  <Route path="/reservations/:id" element={
                    <ProtectedRoute>
                      <ReservationDetail />
                    </ProtectedRoute>
                  } />

                  {/* Payment Management */}
                  <Route path="/payments" element={
                    <ProtectedRoute>
                      <PaymentList />
                    </ProtectedRoute>
                  } />
                  <Route path="/payments/:id" element={
                    <ProtectedRoute>
                      <PaymentDetail />
                    </ProtectedRoute>
                  } />
                  <Route path="/payments/reports" element={
                    <ProtectedRoute>
                      <TransactionReport />
                    </ProtectedRoute>
                  } />

                  {/* Notification Management */}
                  <Route path="/notifications" element={
                    <ProtectedRoute>
                      <NotificationCenter />
                    </ProtectedRoute>
                  } />
                  <Route path="/notifications/compose" element={
                    <ProtectedRoute>
                      <NotificationCompose />
                    </ProtectedRoute>
                  } />
                  <Route path="/notifications/templates" element={
                    <ProtectedRoute>
                      <NotificationTemplates />
                    </ProtectedRoute>
                  } />

                  {/* Support */}
                  <Route path="/support" element={
                    <ProtectedRoute>
                      <TicketList />
                    </ProtectedRoute>
                  } />
                  <Route path="/support/:id" element={
                    <ProtectedRoute>
                      <TicketDetail />
                    </ProtectedRoute>
                  } />

                  {/* Settings */}
                  <Route path="/settings" element={
                    <ProtectedRoute>
                      <Settings />
                    </ProtectedRoute>
                  } />
                  <Route path="/settings/operator" element={
                    <ProtectedRoute>
                      <OperatorSettings />
                    </ProtectedRoute>
                  } />
                  <Route path="/settings/system" element={
                    <ProtectedRoute>
                      <SystemSettings />
                    </ProtectedRoute>
                  } />

                  {/* Default redirect */}
                  <Route path="/" element={<Navigate to="/dashboard" replace />} />
                  <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </Routes>
              </Router>
              
              {/* Toast Notifications */}
              <Toaster
                position="top-right"
                toastOptions={{
                  duration: 4000,
                  style: {
                    background: '#363636',
                    color: '#fff',
                  },
                  success: {
                    duration: 3000,
                    iconTheme: {
                      primary: '#34C759',
                      secondary: '#fff',
                    },
                  },
                  error: {
                    duration: 5000,
                    iconTheme: {
                      primary: '#FF6B6B',
                      secondary: '#fff',
                    },
                  },
                }}
              />

              {/* Development Tools */}
              {isDevelopment && <ReactQueryDevtools initialIsOpen={false} />}
            </ThemeProvider>
          </NotificationProvider>
        </SocketProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
