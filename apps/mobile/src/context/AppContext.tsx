import React, { createContext, useContext, useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store/store';
import { loadStoredTokens } from '../store/slices/authSlice';

interface AppState {
  isAuthenticated: boolean;
  isLoading: boolean;
  isOnline: boolean;
  hasLocationPermission: boolean;
  hasNotificationPermission: boolean;
  networkError: string | null;
}

interface AppContextType extends AppState {
  initializeApp: () => Promise<void>;
  refreshAuth: () => Promise<void>;
  clearError: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

interface AppProviderProps {
  children: React.ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const dispatch = useDispatch();
  
  const { user, isAuthenticated, isLoading, error } = useSelector(
    (state: RootState) => state.auth
  );

  const [appState, setAppState] = useState<AppState>({
    isAuthenticated: false,
    isLoading: true,
    isOnline: true,
    hasLocationPermission: false,
    hasNotificationPermission: false,
    networkError: null,
  });

  useEffect(() => {
    initializeApp();
  }, []);

  useEffect(() => {
    // Update app state when auth state changes
    setAppState(prev => ({
      ...prev,
      isAuthenticated: !!user && isAuthenticated,
      isLoading: isLoading,
      networkError: error,
    }));
  }, [user, isAuthenticated, isLoading, error]);

  const initializeApp = async () => {
    try {
      setAppState(prev => ({ ...prev, isLoading: true }));

      // Load stored authentication tokens
      await dispatch(loadStoredTokens()).unwrap();

      // Check network connectivity
      await checkNetworkStatus();

      // Request permissions
      await requestPermissions();

      // Initialize services
      await initializeServices();

      console.log('App initialization completed');

    } catch (error) {
      console.error('App initialization failed:', error);
      setAppState(prev => ({
        ...prev,
        networkError: 'Failed to initialize app',
      }));
    } finally {
      setAppState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const refreshAuth = async () => {
    try {
      setAppState(prev => ({ ...prev, isLoading: true }));
      await dispatch(loadStoredTokens()).unwrap();
    } catch (error) {
      setAppState(prev => ({
        ...prev,
        networkError: 'Authentication refresh failed',
      }));
    } finally {
      setAppState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const checkNetworkStatus = async () => {
    try {
      // Simple fetch to check network connectivity
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout
      
      const response = await fetch('https://www.google.com', {
        method: 'HEAD',
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      setAppState(prev => ({ ...prev, isOnline: true, networkError: null }));
      
    } catch (error) {
      setAppState(prev => ({
        ...prev,
        isOnline: false,
        networkError: 'No internet connection',
      }));
    }
  };

  const requestPermissions = async () => {
    try {
      // Location permissions would be requested by LocationService
      // For now, we'll set them as potentially granted
      setAppState(prev => ({ 
        ...prev, 
        hasLocationPermission: true,
        hasNotificationPermission: true 
      }));
    } catch (error) {
      console.error('Permission request failed:', error);
    }
  };

  const initializeServices = async () => {
    try {
      // Initialize services here
      // - LocationService
      // - NotificationService  
      // - WebSocketService
      // - CacheService
      
      console.log('Services initialized');
    } catch (error) {
      console.error('Service initialization failed:', error);
    }
  };

  const clearError = () => {
    setAppState(prev => ({ ...prev, networkError: null }));
  };

  const contextValue: AppContextType = {
    ...appState,
    initializeApp,
    refreshAuth,
    clearError,
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
