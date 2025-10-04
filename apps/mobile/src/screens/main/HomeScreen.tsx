import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Dimensions,
  Modal,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { RootState } from '../../store/store';
import StationCard from '../../components/stations/StationCard';
import SearchBar from '../../components/search/SearchBar';
import FilterBar from '../../components/filters/FilterBar';
import QuickActions from '../../components/home/QuickActions';
import NotificationBell from '../../components/home/NotificationBell';
import ChargingSessionCard from '../../components/charging/ChargingSessionCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';

const { width } = Dimensions.get('window');

export const HomeScreen: React.FC = () => {
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    connectorTypes: [],
    powerMin: null,
    amenities: [],
    availableOnly: false,
  });
  const [showFilters, setShowFilters] = useState(false);

  const dispatch = useDispatch();
  const navigation = useNavigation();

  // Selectors
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const { nearbyStations, isLoading: stationsLoading } = useSelector(
    (state: RootState) => state.stations
  );
  const { activeSession } = useSelector((state: RootState) => state.charging);
  const { location } = useState((state: RootState) => state.location);
  const { notifications } = useSelector((state: RootState) => state.notifications);

  // Get nearby stations on mount and location change
  useEffect(() => {
    if (isAuthenticated && location.current) {
      loadNearbyStations();
    }
  }, [isAuthenticated, location.current]);

  const loadNearbyStations = useCallback(async () => {
    try {
      if (!location.current) return;

      await dispatch(searchNearbyStations({
        latitude: location.current.latitude,
        longitude: location.current.longitude,
        radius: 10, // 10km radius
        ...filters,
      })).unwrap();

    } catch (error) {
      console.error('Failed to load nearby stations:', error);
    }
  }, [location.current, filters]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await loadNearbyStations();
    } finally {
      setRefreshing(false);
    }
  }, [loadNearbyStations]);

  const handleStationPress = useCallback((stationId: string) => {
    navigation.navigate('StationDetail', { stationId } as never);
  }, [navigation]);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    // Implement search functionality
    if (query.trim()) {
      // Navigate to search results or filter stations
    } else {
      // Show nearby stations
      loadNearbyStations();
    }
  }, [loadNearbyStations]);

  const handleFilterChange = useCallback((newFilters: any) => {
    setFilters(newFilters);
    // Apply filters to stations
    loadNearbyStations();
  }, [loadNearbyStations]);

  const handleStartCharging = useCallback((stationId: string, connectorId: string) => {
    navigation.navigate('ChargingScreen', { stationId, connectorId } as never);
  }, [navigation]);

  const handleStartReservation = useCallback((stationId: string, connectorId: string) => {
    navigation.navigate('ReservationScreen', { stationId, connectorId } as never);
  }, [navigation]);

  const handleJoinWaitlist = useCallback((stationId: string) => {
    navigation.navigate('WaitListScreen', { stationId } as never);
  }, [navigation]);

  const filteredStations = nearbyStations.filter(station => {
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      return (
        station.name.toLowerCase().includes(query) ||
        station.address.street.toLowerCase().includes(query) ||
        station.address.city.toLowerCase().includes(query)
      );
    }
    return true;
  });

  const renderStationCard = ({ item }) => (
    <StationCard
      station={item}
      onPress={() => handleStationPress(item.id)}
      onStartCharging={handleStartCharging}
      onStartReservation={handleStartReservation}
      onJoinWaitlist={handleJoinWaitlist}
      userLocation={location.current}
    />
  );

  const renderEmptyState = () => (
    <EmptyState
      title="No Stations Found"
      message={searchQuery ? 
        `No stations match "${searchQuery}"` : 
        "We couldn't find any charging stations nearby"
      }
      icon="location-outline"
      action={searchQuery ? 
        { title: "Clear Search", onPress: () => setSearchQuery('') } :
        { title: "Refresh", onPress: handleRefresh }
      }
    />
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.greeting}>
              Hello, {user?.firstName || 'there'}! 👋
            </Text>
            <Text style={styles.subtitle}>
              Find your perfect charging station
            </Text>
          </View>
          <NotificationBell 
            notificationCount={notifications.unreadCount}
            onPress={() => navigation.navigate('Notifications' as never)}
          />
        </View>

        {/* Quick Actions */}
        {!activeSession && (
          <QuickActions
            onScanQR={() => navigation.navigate('QRScanner' as never)}
            onFindStations={() => navigation.navigate('MapTab' as never)}
            onViewReservations={() => navigation.navigate('Reservations' as never)}
          />
        )}
      </View>

      {/* Active Charging Session */}
      {activeSession && (
        <View style={styles.activeSessionContainer}>
          <ChargingSessionCard
            session={activeSession}
            onPress={() => navigation.navigate('ChargingScreen', 
              { sessionId: activeSession.id } as never
            )}
          />
        </View>
      )}

      {/* Search and Filter Bar */}
      <View style={styles.searchContainer}>
        <SearchBar
          value={searchQuery}
          onChangeText={handleSearch}
          placeholder="Search stations..."
          onFilterPress={() => setShowFilters(true)}
        />
      </View>

      {/* Stations List */}
      <FlatList
        data={filteredStations}
        renderItem={renderStationCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#007AFF"
          />
        }
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={!stationsLoading ? renderEmptyState : null}
        ListHeaderComponent={
          filteredStations.length > 0 ? (
            <Text style={styles.sectionTitle}>
              {searchQuery ? 'Search Results' : 'Nearby Stations'}
            </Text>
          ) : null
        }
      />

      {/* Loading Spinner */}
      {stationsLoading && (
        <View style={styles.loadingContainer}>
          <LoadingSpinner size="large" />
        </View>
      )}

      {/* Filters Modal */}
      <Modal
        visible={showFilters}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <FilterBar
          filters={filters}
          onChange={handleFilterChange}
          onClose={() => setShowFilters(false)}
          onReset={() => {
            setFilters({
              connectorTypes: [],
              powerMin: null,
              amenities: [],
              availableOnly: false,
            });
            setShowFilters(false);
            loadNearbyStations();
          }}
        />
      </Modal>
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  activeSessionContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 16,
    marginTop: 8,
  },
  loadingContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -20,
    marginTop: -20,
  },
});

export default HomeScreen;
