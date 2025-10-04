import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Dimensions,
  Share,
  Linking,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useSelector, useDispatch } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { RootState } from '../../store/store';
import MapView, { Marker } from 'react-native-maps';
import ConnectorCard from '../../components/stations/ConnectorCard';
import AmenitiesList from '../../components/stations/AmenitiesList';
import OperatingHours from '../../components/stations/OperatingHours';
import ReviewsSection from '../../components/stations/ReviewsSection';
import ActionButton from '../../components/common/ActionButton';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorState from '../../components/common/ErrorState';

const { width, height } = Dimensions.get('window');

interface RouteParams {
  stationId: string;
}

export const StationDetailScreen: React.FC = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const dispatch = useDispatch();
  
  const { stationId } = route.params as RouteParams;
  
  const [activeTab, setActiveTab] = useState<'overview' | 'reviews' | 'directions'>('overview');
  const [station, setStation] = useState(null);
  const [connectors, setConnectors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { user } = useSelector((state: RootState) => state.auth);
  const { location: currentLocation } = useSelector((state: RootState) => state.location);
  const { reservations } = useSelector((state: RootState) => state.reservations);

  useEffect(() => {
    loadStationDetails();
  }, [stationId]);

  const loadStationDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load station details
      const stationData = await dispatch(getStationById(stationId)).unwrap();
      setStation(stationData);

      // Load connectors
      const connectorsData = await dispatch(getConnectorsByStation(stationId)).unwrap();
      setConnectors(connectorsData);

    } catch (err) {
      setError(err.message || 'Failed to load station details');
    } finally {
      setLoading(false);
    }
  };

  const handleStartCharging = useCallback((connectorId: string) => {
    const connector = connectors.find(c => c.id === connectorId);
    if (!connector || connector.status !== 'available') {
      Alert.alert(
        'Connector Unavailable',
        'This connector is currently not available for charging.'
      );
      return;
    }

    // Check if user has a default payment method
    if (!user?.defaultPaymentMethod) {
      Alert.alert(
        'Payment Method Required',
        'Please add a payment method before starting a charging session.',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Add Payment Method', 
            onPress: () => navigation.navigate('ProfileTab', { 
              screen: 'PaymentMethods' 
            })
          }
        ]
      );
      return;
    }

    // Start charging session
    navigation.navigate('ChargingScreen', { 
      stationId, 
      connectorId 
    });
  }, [connectors, user, navigation, stationId]);

  const handleStartReservation = useCallback((connectorId: string) => {
    const connector = connectors.find(c => c.id === connectorId);
    if (!connector || connector.status === 'out_of_service') {
      Alert.alert(
        'Connector Unavailable',
        'This connector is currently out of service and cannot be reserved.'
      );
      return;
    }

    navigation.navigate('ReservationScreen', { 
      stationId, 
      connectorId 
    });
  }, [connectors, navigation, stationId]);

  const handleJoinWaitlist = useCallback(() => {
    navigation.navigate('WaitListScreen', { stationId });
  }, [navigation, stationId]);

  const handleShareStation = useCallback(async () => {
    try {
      await Share.share({
        message: `Check out this EV charging station: ${station.name}\n${station.address.street}, ${station.address.city}\n\nAvailable connectors: ${connectors.filter(c => c.status === 'available').length}/${connectors.length}`,
        url: `evcharging://station/${stationId}`,
      });
    } catch (error) {
      console.error('Failed to share station:', error);
    }
  }, [station, connectors, stationId]);

  const handleGetDirections = useCallback(async () => {
    if (!station?.location) return;

    const url = `maps://app?daddr=${station.location.latitude},${station.location.longitude}`;
    const fallbackUrl = `https://maps.google.com/maps?daddr=${station.location.latitude},${station.location.longitude}`;

    try {
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
      } else {
        await Linking.openURL(fallbackUrl);
      }
    } catch (error) {
      Alert.alert('Error', 'Unable to open maps application');
    }
  }, [station]);

  const handleCallStation = useCallback(async () => {
    if (!station?.contactPhone) return;

    const phoneNumber = `tel:${station.contactPhone}`;
    const canOpen = await Linking.canOpenURL(phoneNumber);
    
    if (canOpen) {
      await Linking.openURL(phoneNumber);
    } else {
      Alert.alert('Error', 'Unable to make phone call');
    }
  }, [station]);

  const handleReportIssue = useCallback(() => {
    navigation.navigate('Support', { 
      screen: 'ReportIssue',
      params: { stationId }
    });
  }, [navigation, stationId]);

  const getDistanceFromUser = () => {
  if (!station?.location || !currentLocation) return null;

  const R = 6371; // Earth's radius in kilometers
  const dLat = (station.location.latitude - currentLocation.latitude) * Math.PI / 180;
  const dLon = (station.location.longitude - currentLocation.longitude) * Math.PI / 180;
  
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(currentLocation.latitude * Math.PI / 180) * Math.cos(station.location.latitude * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c;
  
  return distance.toFixed(1);
};

const getAvailableConnectors = () => {
  return connectors.filter(connector => connector.status === 'available');
};

const getOccupiedConnectors = () => {
  return connectors.filter(connector => connector.status === 'occupied');
};

const renderOverview = () => (
  <View style={styles.tabContent}>
    {/* Station Status */}
    <View style={styles.statusContainer}>
      <View style={styles.statusBadge}>
        <Ionicons 
          name={station.status === 'active' ? 'checkmark-circle' : 'infinite-circle'} 
          size={20} 
          color={station.status === 'active' ? '#34C759' : '#FF9500'} 
        />
        <Text style={styles.statusText}>{station.status}</Text>
      </View>
      
      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <TouchableOpacity onPress={handleShareStation} style={styles.actionButton}>
          <Ionicons name="share-outline" size={20} color="#007AFF" />
        </TouchableOpacity>
        
        <TouchableOpacity onPress={handleGetDirections} style={styles.actionButton}>
          <Ionicons name="navigate-outline" size={20} color="#007AFF" />
        </TouchableOpacity>
        
        {station.contactPhone && (
          <TouchableOpacity onPress={handleCallStation} style={styles.actionButton}>
            <Ionicons name="call-outline" size={20} color="#007AFF" />
          </TouchableOpacity>
        )}
      </View>
    </View>

    {/* Connectors */}
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>
        Connectors ({getAvailableConnectors().length}/{connectors.length} available)
      </Text>
      {connectors.map((connector) => (
        <ConnectorCard
          key={connector.id}
          connector={connector}
          onStartCharging={() => handleStartCharging(connector.id)}
          onStartReservation={() => handleStartReservation(connector.id)}
          showActions={true}
        />
      ))}
    </View>

    {/* Amenities */}
    {station.amenities && station.amenities.length > 0 && (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Amenities</Text>
        <AmenitiesList amenities={station.amenities} />
      </View>
    )}

    {/* Operating Hours */}
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Operating Hours</Text>
      <OperatingHours hours={station.operatingHours} />
    </View>

    {/* Additional Info */}
    {station.description && (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About This Station</Text>
        <Text style={styles.description}>{station.description}</Text>
      </View>
    )}
  </View>
);

const renderReviews = () => (
  <View style={styles.tabContent}>
    <ReviewsSection 
      stationId={stationId}
      rating={station.rating}
      reviewCount={station.reviewsCount}
    />
  </View>
);

const renderDirections = () => (
  <View style={styles.tabContent}>
    <MapView
      style={styles.map}
      region={{
        latitude: station.location.latitude,
        longitude: station.location.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }}
      showsUserLocation={true}
      showsMyLocationButton={true}
    >
      <Marker
        coordinate={{
          latitude: station.location.latitude,
          longitude: station.location.longitude,
        }}
        title={station.name}
        description={`${station.address.street}, ${station.address.city}`}
      />
    </MapView>
    
    <View style={styles.directionsInfo}>
      <Text style={styles.directionsTitle}>Get Directions</Text>
      <Text style={styles.directionsText}>
        {station.address.street}
        {'\n'}
        {station.address.city}, {station.address.state} {station.address.zip}
      </Text>
      
      <ActionButton
        title="Open in Maps"
        onPress={handleGetDirections}
        icon="navigate-outline"
        style={styles.directionsButton}
      />
    </View>
  </View>
);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <LoadingSpinner size="large" />
        <Text style={styles.loadingText}>Loading station details...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <ErrorState
        title="Failed to Load Station"
        message={error}
        onRetry={loadStationDetails}
      />
    );
  }

  if (!station) {
    return (
      <ErrorState
        title="Station Not Found"
        message="This charging station could not be found."
        onRetry={() => navigation.goBack()}
      />
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.name}>{station.name}</Text>
          <Text style={styles.address}>
            {station.address.street}, {station.address.city}
          </Text>
          {currentLocation && (
            <Text style={styles.distance}>
              {getDistanceFromUser()} km away
            </Text>
          )}
        </View>
        
        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="close-outline" size={24} color="#666" />
        </TouchableOpacity>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'overview' && styles.activeTab]}
          onPress={() => setActiveTab('overview')}
        >
          <Text style={[styles.tabText, activeTab === 'overview' && styles.activeTabText]}>
            Overview
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'reviews' && styles.activeTab]}
          onPress={() => setActiveTab('reviews')}
        >
          <Text style={[styles.tabText, activeTab === 'reviews' && styles.activeTabText]}>
            Reviews ({station.reviewsCount})
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'directions' && styles.activeTab]}
          onPress={() => setActiveTab('directions')}
        >
          <Text style={[styles.tabText, activeTab === 'directions' && styles.activeTabText]}>
            Directions
          </Text>
        </TouchableOpacity>
      </View>

      {/* Tab Content */}
      <ScrollView style={styles.scrollView}>
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'reviews' && renderReviews()}
        {activeTab === 'directions' && renderDirections()}
      </ScrollView>

      {/* Footer Actions */}
      <View style={styles.footer}>
        {getAvailableConnectors().length > 0 ? (
          <>
            <ActionButton
              title="Start Charging"
              onPress={() => handleStartCharging(getAvailableConnectors()[0].id)}
              icon="flash-outline"
              style={[styles.actionButton, styles.primaryButton]}
            />
            
            {connectors.find(c => c.status === 'available') && (
              <ActionButton
                title="Reserve"
                onPress={() => handleStartReservation(getAvailableConnectors()[0].id)}
                icon="calendar-outline"
                style={styles.actionButton}
              />
            )}
          </>
        ) : (
          <>
            <ActionButton
              title="Join Waitlist"
              onPress={handleJoinWaitlist}
              icon="list-outline"
              style={[styles.actionButton, styles.primaryButton]}
            />
            
            <ActionButton
              title="Report Issue"
              onPress={handleReportIssue}
              icon="flag-outline"
              style={styles.actionButton}
            />
          </>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: '#f8f9fa',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerContent: {
    flex: 1,
    paddingRight: 20,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  address: {
    fontSize: 16,
    color: '#666',
    marginBottom: 4,
  },
  distance: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
  },
  closeButton: {
    padding: 8,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#007AFF',
  },
  tabText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#007AFF',
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  tabContent: {
    paddingBottom: 20,
  },
  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginLeft: 8,
    textTransform: 'capitalize',
  },
  quickActions: {
    flexDirection: 'row',
  },
  actionButton: {
    marginLeft: 12,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
  },
  section: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
  map: {
    height: height * 0.4,
    width: '100%',
  },
  directionsInfo: {
    padding: 20,
    backgroundColor: '#fff',
  },
  directionsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  directionsText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
    lineHeight: 24,
  },
  directionsButton: {
    marginTop: 8,
  },
  footer: {
    flexDirection: 'row',
    padding: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  footerActionButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  primaryButton: {
    backgroundColor: '#007AFF',
    flex: 2,
    marginRight: 8,
  },
});

export default StationDetailScreen;
