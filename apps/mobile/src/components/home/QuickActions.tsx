import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface QuickAction {
  id: string;
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  disabled?: boolean;
}

interface QuickActionsProps {
  onScanQR: () => void;
  onFindStations: () => void;
  onViewReservations: () => void;
  onViewHistory?: () => void;
  onEmergency?: () => void;
}

export const QuickActions: React.FC<QuickActionsProps> = ({
  onScanQR,
  onFindStations,
  onViewReservations,
  onViewHistory,
  onEmergency,
}) => {
  const actions: QuickAction[] = [
    {
      id: 'scan_qr',
      title: 'Scan QR Code',
      icon: 'qr-code-outline',
      onPress: onScanQR,
    },
    {
      id: 'find_stations',
      title: 'Find Stations',
      icon: 'location-outline',
      onPress: onFindStations,
    },
    {
      id: 'reservations',
      title: 'My Reservations',
      icon: 'calendar-outline',
      onPress: onViewReservations,
    },
    {
      id: 'history',
      title: 'Charging History',
      icon: 'time-outline',
      onPress: onViewHistory || (() => {}),
    },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Quick Actions</Text>
      
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {actions.map((action) => (
          <TouchableOpacity
            key={action.id}
            style={[
              styles.actionButton,
              action.disabled && styles.disabledButton
            ]}
            onPress={action.onPress}
            disabled={action.disabled}
            activeOpacity={0.7}
          >
            <View style={[
              styles.iconContainer,
              action.disabled && styles.disabledIconContainer
            ]}>
              <Ionicons 
                name={action.icon} 
                size={24} 
                color={action.disabled ? '#999' : '#007AFF'} 
              />
            </View>
            <Text style={[
              styles.actionText,
              action.disabled && styles.disabledText
            ]}>
              {action.title}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {onEmergency && (
        <TouchableOpacity
          style={styles.emergencyButton}
          onPress={onEmergency}
          activeOpacity={0.7}
        >
          <Ionicons name="shield-outline" size={20} color="#fff" />
          <Text style={styles.emergencyText}>Emergency Help</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  actionButton: {
    alignItems: 'center',
    marginRight: 20,
    minWidth: 80,
  },
  disabledButton: {
    opacity: 0.5,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#f0f2f5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  disabledIconContainer: {
    backgroundColor: '#f5f5f5',
  },
  actionText: {
    fontSize: 12,
    color: '#1a1a1a',
    textAlign: 'center',
    fontWeight: '500',
  },
  disabledText: {
    color: '#999',
  },
  emergencyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF6B6B',
    marginTop: 16,
    marginHorizontal: 20,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    shadowColor: '#FF6B6B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  emergencyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginLeft: 8,
  },
});

export default QuickActions;
