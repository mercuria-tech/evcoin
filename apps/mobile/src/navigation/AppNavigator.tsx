import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { RootState } from '../store/store';
import { useAppContext } from '../context/AppContext';

// Screen Imports
import LaunchScreen from '../screens/auth/LaunchScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';
import VerifyOtpScreen from '../screens/auth/VerifyOtpScreen';

import HomeScreen from '../screens/main/HomeScreen';
import StationDetailScreen from '../screens/main/StationDetailScreen';
import ChargingScreen from '../screens/main/ChargingScreen';
import ReservationScreen from '../screens/main/ReservationScreen';
import WaitListScreen from '../screens/main/WaitListScreen';

import DashboardScreen from '../screens/dashboard/DashboardScreen';
import RecentSessionsScreen from '../screens/dashboard/RecentSessionsScreen';
import StatisticsScreen from '../screens/dashboard/StatisticsScreen';
import PreferencesScreen from '../screens/dashboard/PreferencesScreen';

import ProfileScreen from '../screens/profile/ProfileScreen';
import EditProfileScreen from '../screens/profile/EditProfileScreen';
import VehiclesScreen from '../screens/profile/VehiclesScreen';
import PaymentMethodsScreen from '../screens/profile/PaymentMethodsScreen';
import NotificationPreferencesScreen from '../screens/profile/NotificationPreferencesScreen';

import MapScreen from '../screens/map/MapScreen';
import NearbyStationsScreen from '../screens/map/NearbyStationsScreen';
import StationFiltersScreen from '../screens/map/StationFiltersScreen';

import SupportScreen from '../screens/support/SupportScreen';
import SettingsScreen from '../screens/settings/SettingsScreen';

// Custom Components
import LoadingOverlay from '../components/common/LoadingOverlay';
import CustomDrawerContent from '../components/navigation/CustomDrawerContent';

// Types
export type RootStackParamList = {
  Launch: undefined;
  AuthStack: undefined;
  MainApp: undefined;
  StationDetail: { stationId: string };
  ChargingScreen: { sessionId: string };
  ReservationScreen: { stationId: string; connectorId: string };
  WaitListScreen: { stationId: string };
};

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  VerifyOtp: { phone: string };
};

export type MainTabParamList = {
  HomeTab: undefined;
  MapTab: undefined;
  DashboardTab: undefined;
  ProfileTab: undefined;
};

export type DashboardStackParamList = {
  Dashboard: undefined;
  RecentSessions: undefined;
  Statistics: undefined;
  Preferences: undefined;
};

export type ProfileStackParamList = {
  Profile: undefined;
  EditProfile: undefined;
  Vehicles: undefined;
  PaymentMethods: undefined;
  NotificationPreferences: undefined;
};

export type MapStackParamList = {
  Map: undefined;
  NearbyStations: undefined;
  StationFilters: undefined;
};

export type DrawerParamList = {
  MainTabs: undefined;
  Support: undefined;
  Settings: undefined;
};

const RootStack = createNativeStackNavigator<RootStackParamList>();
const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const MainTabs = createBottomTabNavigator<MainTabParamList>();
const DrawerNavigator = createDrawerNavigator<DrawerParamList>();

// Create stack navigators for each section
const DashboardStack = createNativeStackNavigator<DashboardStackParamList>();
const ProfileStack = createNativeStackNavigator<ProfileStackParamList>();
const MapStack = createNativeStackNavigator<MapStackParamList>();

// Navigation Components
const AuthNavigator = () => (
  <AuthStack.Navigator
    screenOptions={{
      headerShown: false,
      animation: 'slide_from_right'
    }}
  >
    <AuthStack.Screen name="Login" component={LoginScreen} />
    <AuthStack.Screen name="Register" component={RegisterScreen} />
    <AuthStack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
    <AuthStack.Screen name="VerifyOtp" component={VerifyOtpScreen} />
  </AuthStack.Navigator>
);

// Main Dashboard Stack Navigator
const DashboardNavigator = () => (
  <DashboardStack.Navigator
    screenOptions={{
      headerShown: false,
      animation: 'slide_from_right'
    }}
  >
    <DashboardStack.Screen name="Dashboard" component={DashboardScreen} />
    <DashboardStack.Screen name="RecentSessions" component={RecentSessionsScreen} />
    <DashboardStack.Screen name="Statistics" component={StatisticsScreen} />
    <DashboardStack.Screen name="Preferences" component={PreferencesScreen} />
  </DashboardStack.Navigator>
);

// Profile Stack Navigator
const ProfileNavigator = () => (
  <ProfileStack.Navigator
    screenOptions={{
      headerShown: false,
      animation: 'slide_from_right'
    }}
  >
    <ProfileStack.Screen name="Profile" component={ProfileScreen} />
    <ProfileStack.Screen name="EditProfile" component={EditProfileScreen} />
    <ProfileStack.Screen name="Vehicles" component={VehiclesScreen} />
    <ProfileStack.Screen name="PaymentMethods" component={PaymentMethodsScreen} />
    <ProfileStack.Screen name="NotificationPreferences" component={NotificationPreferencesScreen} />
  </ProfileStack.Navigator>
);

// Map Stack Navigator
const MapNavigator = () => (
  <MapStack.Navigator
    screenOptions={{
      headerShown: false,
      animation: 'slide_from_bottom'
    }}
  >
    <MapStack.Screen name="Map" component={MapScreen} />
    <MapStack.Screen name="NearbyStations" component={NearbyStationsScreen} />
    <MapStack.Screen name="StationFilters" component={StationFiltersScreen} />
  </MapStack.Navigator>
);

// Main Tab Navigator
const MainTabNavigator = () => (
  <MainTabs.Navigator
    screenOptions={({ route }) => ({
      tabBarIcon: ({ focused, color, size }) => {
        let iconName: keyof typeof Ionicons.glyphMap;

        switch (route.name) {
          case 'HomeTab':
            iconName = focused ? 'home' : 'home-outline';
            break;
          case 'MapTab':
            iconName = focused ? 'map' : 'map-outline';
            break;
          case 'DashboardTab':
            iconName = focused ? 'bar-chart' : 'bar-chart-outline';
            break;
          case 'ProfileTab':
            iconName = focused ? 'person' : 'person-outline';
            break;
          default:
            iconName = 'circle-outline';
        }

        return <Ionicons name={iconName} size={size} color={color} />;
      },
      tabBarActiveTintColor: '#007AFF',
      tabBarInactiveTintColor: 'gray',
      tabBarStyle: {
        backgroundColor: 'white',
        borderTopWidth: 1,
        borderTopColor: '#E5E5E7',
        paddingBottom: 5,
        paddingTop: 5,
        height: 60,
      },
      headerShown: false,
    })}
  >
    <MainTabs.Screen 
      name="HomeTab" 
      component={MapNavigator}
      options={{
        title: 'Stations',
      }}
    />
    <MainTabs.Screen 
      name="MapTab" 
      component={MapNavigator}
      options={{
        title: 'Map',
      }}
    />
    <MainTabs.Screen 
      name="DashboardTab" 
      component={DashboardNavigator}
      options={{
        title: 'Dashboard',
      }}
    />
    <MainTabs.Screen 
      name="ProfileTab" 
      component={ProfileNavigator}
      options={{
        title: 'Profile',
      }}
    />
  </MainTabs.Navigator>
);

// Drawer Navigator
const DrawerNavigatorComponent = () => (
  <DrawerNavigator.Navigator
    drawerContent={(props) => <CustomDrawerContent {...props} />}
    screenOptions={{
      headerShown: false,
      drawerStyle: {
        backgroundColor: 'white',
        width: 280,
      },
      drawerActiveTintColor: '#007AFF',
      drawerInactiveTintColor: 'gray',
      drawerLabelStyle: {
        fontSize: 16,
        fontWeight: '600',
      },
    }}
  >
    <DrawerNavigator.Screen 
      name="MainTabs" 
      component={MainTabNavigator}
      options={{
        drawerIcon: ({ focused, color, size }) => (
          <Ionicons name="home-outline" size={size} color={color} />
        ),
        drawerLabel: 'Home'
      }}
    />
    <DrawerNavigator.Screen 
      name="Support" 
      component={SupportScreen}
      options={{
        drawerIcon: ({ focused, color, size }) => (
          <Ionicons name="help-circle-outline" size={size} color={color} />
        ),
        drawerLabel: 'Support'
      }}
    />
    <DrawerNavigator.Screen 
      name="Settings" 
      component={SettingsScreen}
      options={{
        drawerIcon: ({ focused, color, size }) => (
          <Ionicons name="settings-outline" size={size} color={color} />
        ),
        drawerLabel: 'Settings'
      }}
    />
  </DrawerNavigator.Navigator>
);

// Main App Navigator
const AppNavigator: React.FC = () => {
  const { isAuthenticated, isLoading } = useAppContext();
  const user = useSelector((state: RootState) => state.auth.user);

  // Handle loading state
  if (isLoading) {
    return <LoadingOverlay />;
  }

  // Handle launch/auth screens
  if (!user) {
    return (
      <RootStack.Navigator
        screenOptions={{
          headerShown: false,
          presentation: 'modal'
        }}
      >
        <RootStack.Screen name="Launch" component={LaunchScreen} />
        <RootStack.Screen name="AuthStack" component={AuthNavigator} />
      </RootStack.Navigator>
    );
  }

  // Main authenticated app
  return (
    <RootStack.Navigator
      screenOptions={{
        headerShown: false,
        presentation: 'modal'
      }}
    >
      <RootStack.Screen name="MainApp" component={DrawerNavigatorComponent} />
      
      {/* Modal Screens */}
      <RootStack.Screen 
        name="StationDetail" 
        component={StationDetailScreen}
        options={{
          presentation: 'modal',
          animation: 'slide_from_bottom'
        }}
      />
      <RootStack.Screen 
        name="ChargingScreen" 
        component={ChargingScreen}
        options={{
          presentation: 'modal',
          animation: 'slide_from_bottom',
          gestureEnabled: false
        }}
      />
      <RootStack.Screen 
        name="ReservationScreen" 
        component={ReservationScreen}
        options={{
          presentation: 'modal',
          animation: 'slide_from_bottom'
        }}
      />
      <RootStack.Screen 
        name="WaitListScreen" 
        component={WaitListScreen}
        options={{
          presentation: 'modal',
          animation: 'slide_from_bottom'
        }}
      />
    </RootStack.Navigator>
  );
};

export default AppNavigator;