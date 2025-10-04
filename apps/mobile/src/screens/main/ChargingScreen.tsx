import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Dimensions,
  StatusBar,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useSelector, useDispatch } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { RootState } from '../store/store';
import AnimatedCircularProgress from '../../components/charging/AnimatedCircularProgress';
import ChargingMetrics from '../../components/charging/ChargingMetrics';
import ChargingControls from '../../components/charging/ChargingControls';
import SessionTimeline from '../../components/charging/SessionTimeline';
import PaymentSummary from '../../components/payment/PaymentSummary';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorState from '../../components/common/ErrorState';
import SuccessModal from '../../components/common/SuccessModal';

const { width, height } = Dimensions.get('window');

interface RouteParams {
  sessionId?: string;
  stationId?: string;
  connectorId?: string;
}

export const ChargingScreen: React.FC = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const dispatch = useDispatch();

  const { sessionId, stationId, connectorId } = route.params as RouteParams;

  const [session, setSession] = useState(null);
  const [station, setStation] = useState(null);
  const [connector, setConnector] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stopping, setStopping] = useState(false);
  const [showPaymentSummary, setShowPaymentSummary] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const { activeSession } = useSelector((state: RootState) => state.charging);
  const { currentSession } = useSelector((state: RootState) => state.charging);

  useEffect(() => {
    initializeSession();
  }, [sessionId, stationId, connectorId]);

  useEffect(() => {
    // Real-time session updates
    if (session && session.status === 'charging') {
      const interval = setInterval(() => {
        updateSessionData();
      }, 10000); // Update every 10 seconds

      return () => clearInterval(interval);
    }
  }, [session]);

  const initializeSession = async () => {
    try {
      setLoading(true);

      if (sessionId) {
        // Existing session
        const sessionData = await dispatch(getChargingSession(sessionId)).unwrap();
        setSession(sessionData);
        
        // Load station and connector data
        const stationData = await dispatch(getStationById(sessionData.stationId)).unwrap();
        const connectorData = await dispatch(getConnectorById(sessionData.connectorId)).unwrap();
        
        setStation(stationData);
        setConnector(connectorData);
        
      } else if (stationId && connectorId) {
        // New session - load station data first
        const stationData = await dispatch(getStationById(stationId)).unwrap();
        const connectorData = await dispatch(getConnectorById(connectorId)).unwrap();
        
        setStation(stationData);
        setConnector(connectorData);
        
        // Start new charging session
        const newSession = await dispatch(startChargingSession({
          stationId,
          connectorId,
          vehicleId: user?.defaultVehicle,
          paymentMethodId: user?.defaultPaymentMethod
        })).unwrap();
        
        setSession(newSession);
      }

    } catch (error) {
      Alert.alert(
        'Charging Error',
        error.message || 'Failed to initialize charging session'
      );
    } finally {
      setLoading(false);
    }
  };

  const updateSessionData = async () => {
    try {
      if (!session?.id) return;

      const updatedSession = await dispatch(getChargingSession(session.id)).unwrap();
      setSession(updatedSession);

      // Check if session completed
      if (updatedSession.status === 'completed' && session.status === 'charging') {
        setShowSuccessModal(true);
      }

    } catch (error) {
      console.error('Failed to update session:', error);
    }
  };

  const handleStopCharging = useCallback(async () => {
    Alert.alert(
      'Stop Charging',
      `Are you sure you want to stop charging? You've charged ${
        session?.energyDeliveredKwh || 0
      } kWh at an estimated cost of $${session?.costAmount || 0}.`,
      [
        { text: 'Continue Charging', style: 'cancel' },
        {
          text: 'Stop Charging',
          style: 'destructive',
          onPress: async () => {
            try {
              setStopping(true);
              
              const result = await dispatch(stopChargingSession({
                sessionId: session.id,
                reason: 'user_stop'
              })).unwrap();

              if (result.success) {
                setShowPaymentSummary(true);
              }
              
            } catch (error) {
              Alert.alert(
                'Stop Failed',
                'Unable to stop charging session. Please try again or contact support.'
              );
            } finally {
              setStopping(false);
            }
          }
        }
      ]
    );
  }, [session, dispatch]);

  const handleEmergencyStop = useCallback(async () => {
    Alert.alert(
      'Emergency Stop',
      'This will immediately stop charging and may affect the vehicle battery. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Emergency Stop',
          style: 'destructive',
          onPress: async () => {
            try {
              setStopping(true);
              
              await dispatch(emergencyStopSession({
                sessionId: session.id,
                reason: 'emergency_stop'
              })).unwrap();

              Alert.alert(
                'Emergency Stop Activated',
                'Charging has been stopped immediately. Please check your vehicle and contact support if needed.'
              );
              
            } catch (error) {
              Alert.alert(
                'Emergency Stop Failed',
                'Unable to perform emergency stop. Please contact support immediately.'
              );
            } finally {
              setStopping(false);
            }
          }
        }
      ]
    );
  }, [session, dispatch]);

  const handlePauseResume = useCallback(async pauseSession => {
    try {
      if (pauseSession) {
        await dispatch(pauseChargingSession(session.id)).unwrap();
      } else {
        await dispatch(resumeChargingSession(session.id)).unwrap();
      }
    } catch (error) {
      Alert.alert(
        'Action Failed',
        pauseSession ? 
          'Unable to pause charging. Please try again.' :
          'Unable to resume charging. Please try again.'
      );
    }
  }, [session, dispatch]);

  const handlePaymentComplete = useCallback(() => {
    setShowPaymentSummary(false);
    setShowSuccessModal(true);
  }, []);

  const handleFinishSession = useCallback(() => {
    setShowSuccessModal(false);
    navigation.goBack();
  }, [navigation]);

  const getVehicleBatteryLevel = () => {
    if (!session) return 0;
    
    // Calculate battery level based on energy delivered and vehicle capacity
    const vehicleCapacity = 75; // kWh - would come from vehicle data
    const energyDelivered = session.energyDeliveredKwh || 0;
    const estimatedCurrentLevel = (energyDelivered / vehicleCapacity) * 100;
    
    // Real battery level would come from vehicle telemetry API
    return Math.min(estimatedCurrentLevel, 100);
  };

  const getSessionDuration = () => {
    if (!session?.startedAt) return 0;
    
    const startTime = new Date(session.startedAt);
    const currentTime = new Date();
    return Math.floor((currentTime - startTime) / 1000 / 60); // minutes
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar backgroundColor="#007AFF" barStyle="light-content" />
        <LoadingSpinner size="large" />
        <Text style={styles.loadingText}>
          {sessionId ? 'Loading session...' : 'Starting charging session...'}
        </Text>
      </View>
    );
  }

  if (!session || !station || !connector) {
    return (
      <View style={styles.errorContainer}>
        <StatusBar backgroundColor="#FF6B6B" barStyle="light-content" />
        <ErrorState
          title="Session Not Found"
          message="Unable to load charging session details."
          onRetry={() => navigation.goBack()}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#007AFF" barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.stationName}>{station.name}</Text>
          <Text style={styles.connectorInfo}>
            Connector {connector.connectorNumber} • {connector.type} • {connector.powerKw} kW
          </Text>
        </View>
        
        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => {
            if (session.status === 'charging') {
              Alert.alert(
                'Exit Charging Session',
                'You have an active charging session. Are you sure you want to exit?',
                [
                  { text: 'Stay', style: 'cancel' },
                  { 
                    text: 'Exit',
                    onPress: () => navigation.goBack()
                  }
                ]
              );
            } else {
              navigation.goBack();
            }
          }}
        >
          <Ionicons name="close-outline" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Main Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Charging Progress */}
        <View style={styles.progressContainer}>
          <AnimatedCircularProgress
            progress={getVehicleBatteryLevel()}
            size={200}
            strokeWidth={8}
            color="#34C759"
            secondaryColor="#E8E8E8"
            showPercentage={true}
          />
          
          <View style={styles.progressInfo}>
            <Text style={styles.statusText}>
              {session.status === 'charging' ? 'Charging' :
               session.status === 'paused' ? 'Paused' :
               session.status === 'completed' ? 'Charging Complete' :
               session.status}
            </Text>
            <Text style={styles.durationText}>
              {getSessionDuration()} minutes
            </Text>
          </View>
        </View>

        {/* Charging Metrics */}
        <ChargingMetrics
          energyDelivered={session.energyDeliveredKwh || 0}
          power={session.avgPowerKw || connector.powerKw}
          cost={session.costAmount || 0}
          currency={session.costCurrency || 'USD'}
          duration={getSessionDuration()}
          efficiency={session.powerKw > 0 ? 
            ((session.avgPowerKw || 0) / connector.powerKw) * 100 : 0}
        />

        {/* Session Timeline */}
        <SessionTimeline
          session={session}
          events={[
            {
              time: session.startedAt,
              title: 'Charging Started',
              description: `Connected to ${station.name}`,
              icon: 'flash-outline',
              status: 'completed'
            },
            ...(session.status === 'paused' ? [{
              time: session.pausedAt,
              title: 'Charging Paused',
              description: 'Session paused by user',
              icon: 'pause-outline',
              status: 'completed'
            }] : []),
            {
              time: session.endedAt || new Date(),
              title: session.status === 'charging' ? 'Charging Active' : 'Charging Complete',
              description: session.status === 'charging' ? 
                'Currently charging your vehicle' : 
                'Charging session completed',
              icon: session.status === 'charging' ? 'flash-outline' : 'checkmark-circle-outline',
              status: session.status === 'completed' ? 'completed' : 'active'
            }
          ]}
        />

        {/* Station Info */}
        <View style={styles.stationInfo}>
          <Text style={styles.sectionTitle}>Station Information</Text>
          <View style={styles.infoRow}>
            <Ionicons name="location-outline" size={20} color="#666" />
            <Text style={styles.infoText}>
              {station.address.street}, {station.address.city}
            </Text>
          </View>
          
          {station.contactPhone && (
            <View style={styles.infoRow}>
              <Ionicons name="call-outline" size={20} color="#666" />
              <Text style={styles.infoText}>{station.contactPhone}</Text>
            </View>
          )}
          
          <View style={styles.infoRow}>
            <Ionicons name="flash-outline" size={20} color="#666" />
            <Text style={styles.infoText}>
              {connector.type} • Max {connector.powerKw} kW
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Charging Controls */}
      {session.status === 'charging' && (
        <ChargingControls
          onStopCharging={handleStopCharging}
          onPauseResume={handlePauseResume}
          onEmergencyStop={handleEmergencyStop}
          isPaused={session.status === 'paused'}
          stopping={stopping}
        />
      )}

      {/* Payment Summary Modal */}
      {showPaymentSummary && (
        <PaymentSummary
          session={session}
          station={station}
          onPaymentComplete={handlePaymentComplete}
          onClose={handlePaymentComplete}
        />
      )}

      {/* Success Modal */}
      <SuccessModal
        visible={showSuccessModal}
        title="Charging Complete!"
        message={`You've successfully charged your vehicle with ${
          session.energyDeliveredKwh || 0
        } kWh of energy.`
        }
        confirmText="Done"
        onConfirm={handleFinishSession}
      />

      {/* Emergency Button */}
      {session.status === 'charging' && (
        <TouchableOpacity style={styles.emergencyButton} onPress={handleEmergencyStop}>
          <Ionicons name="stop-circle-outline" size={24} color="#FF6B6B" />
          <Text style={styles.emergencyText}>Emergency Stop</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#007AFF',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#fff',
    fontWeight: '500',
  },
  errorContainer: {
    flex: 1,
    backgroundColor: '#FF6B6B',
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: '#007AFF',
  },
  headerContent: {
    flex: 1,
    paddingRight: 20,
  },
  stationName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  connectorInfo: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  closeButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -20,
  },
  progressContainer: {
    alignItems: 'center',
    paddingVertical: 40,
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  progressInfo: {
    alignItems: 'center',
    marginTop: 20,
  },
  statusText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  durationText: {
    fontSize: 16,
    color: '#666',
  },
  stationInfo: {
    backgroundColor: '#fff',
    margin: 20,
    borderRadius: 12,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 16,
    color: "#666"
    marginLeft: 12,
    flex: 1,
  },
  emergencyButton: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  emergencyText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FF6B6B',
    marginLeft: 8,
  },
});

export default ChargingScreen;
