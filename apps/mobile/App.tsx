import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import Toast from 'react-native-toast-message';

// Store
import { store, persistor } from './src/store/store';

// Navigation
import AppNavigator from './src/navigation/AppNavigator';

// Context
import { AppProvider } from './src/context/AppContext';

// Services
import { SocketService } from './src/services/SocketService';
import { NotificationService } from './src/services/NotificationService';
import { LocationService } from './src/services/LocationService';

// Components
import LoadingScreen from './src/components/common/LoadingScreen';

// Styles
import './src/styles/global.css';

// Initialize app
const App: React.FC = () => {
  useEffect(() => {
    // Initialize services
    initializeServices();
    
    // Setup notifications
    setupNotifications();
    
    // Request permissions
    requestPermissions();
  }, []);

  const initializeServices = async () => {
    try {
      // Initialize WebSocket connection
      SocketService.initialize();
      
      // Initialize location service
      LocationService.initialize();
      
      // Initialize notification service
      NotificationService.initialize();
      
      console.log('Services initialized successfully');
    } catch (error) {
      console.error('Failed to initialize services:', error);
    }
  };

  const setupNotifications = async () => {
    try {
      // Request notification permissions
      const permission = await NotificationService.requestPermissions();
      
      if (permission) {
        console.log('Notification permissions granted');
        
        // Setup notification handlers
        NotificationService.setupNotificationHandlers();
        
        // Register for push notifications
        await NotificationService.registerForPushNotifications();
      } else {
        console.log('Notification permissions denied');
      }
    } catch (error) {
      console.error('Failed to setup notifications:', error);
    }
  };

  const requestPermissions = async () => {
    try {
      // Request location permissions
      await LocationService.requestPermissions();
      
      // Request camera permissions (for QR scanning)
      // Camera permissions would be requested when needed
      
      console.log('Permissions requested');
    } catch (error) {
      console.error('Failed to request permissions:', error);
    }
  };

  return (
    <Provider store={store}>
      <PersistGate loading={<LoadingScreen />} persistor={persistor}>
        <SafeAreaProvider>
          <AppProvider>
            <NavigationContainer>
              <StatusBar style="auto" />
              <AppNavigator />
              <Toast />
            </NavigationContainer>
          </AppProvider>
        </SafeAreaProvider>
      </PersistGate>
    </Provider>
  );
};

export default App;
