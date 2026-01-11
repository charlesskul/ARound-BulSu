import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  StatusBar,
  Dimensions,
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useApp } from '../context/AppContext';
import { evacuationAreas, mapConfig } from '../data/campusData';
import { colors, spacing, borderRadius, shadows } from '../constants/theme';

const { width, height } = Dimensions.get('window');

const EmergencyScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { activateEmergencyMode, isEmergencyMode } = useApp();
  
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [nearestEvacuation, setNearestEvacuation] = useState(evacuationAreas[0]);

  const handleEmergencyPress = () => {
    setShowConfirmModal(true);
  };

  const handleActivateEvacuation = () => {
    setShowConfirmModal(false);
    activateEmergencyMode();
    navigation.navigate('AREmergency', { evacuationArea: nearestEvacuation });
  };

  const handleCancel = () => {
    setShowConfirmModal(false);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <TouchableOpacity style={styles.menuButton}>
          <Ionicons name="menu" size={28} color={colors.white} />
        </TouchableOpacity>
        <View style={styles.emergencyBadge}>
          <Text style={styles.emergencyBadgeText}>EMERGENCY MODE</Text>
        </View>
      </View>

      {/* Map View with Emergency Markers */}
      <MapView
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={mapConfig.initialRegion}
        showsUserLocation={true}
        showsMyLocationButton={false}
      >
        {/* Evacuation Area Markers - Red */}
        {evacuationAreas.map((area) => (
          <Marker
            key={area.id}
            coordinate={area.coordinates}
            onPress={() => setNearestEvacuation(area)}
          >
            <View style={styles.evacuationMarker}>
              <Ionicons 
                name="location" 
                size={32} 
                color={colors.emergencyRed} 
              />
            </View>
          </Marker>
        ))}
      </MapView>

      {/* Emergency Mode Label */}
      <View style={styles.emergencyLabelContainer}>
        <Text style={styles.emergencyLabel}>Emergency Mode</Text>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionContainer}>
        <TouchableOpacity 
          style={styles.cancelActionButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.cancelActionText}>Cancel</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.activateButton}
          onPress={handleEmergencyPress}
        >
          <Text style={styles.activateButtonText}>Activate Evacuation</Text>
        </TouchableOpacity>
      </View>

      {/* Confirmation Modal */}
      <Modal
        visible={showConfirmModal}
        transparent={true}
        animationType="fade"
        onRequestClose={handleCancel}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalIconContainer}>
              <Ionicons name="warning" size={48} color={colors.emergencyRed} />
            </View>
            
            <Text style={styles.modalTitle}>Activate Emergency Mode?</Text>
            <Text style={styles.modalDescription}>
              This will start navigation to the nearest evacuation area: {nearestEvacuation.name}
            </Text>

            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={styles.modalCancelButton}
                onPress={handleCancel}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.modalActivateButton}
                onPress={handleActivateEvacuation}
              >
                <Text style={styles.modalActivateText}>Activate</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    backgroundColor: colors.primary,
    zIndex: 10,
  },
  menuButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emergencyBadge: {
    backgroundColor: colors.emergencyRed,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
  },
  emergencyBadgeText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  map: {
    flex: 1,
    marginTop: 100, // Account for header
  },
  evacuationMarker: {
    alignItems: 'center',
  },
  emergencyLabelContainer: {
    position: 'absolute',
    bottom: 180,
    left: spacing.lg,
  },
  emergencyLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.gray[800],
  },
  actionContainer: {
    position: 'absolute',
    bottom: 100,
    left: spacing.lg,
    right: spacing.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cancelActionButton: {
    backgroundColor: colors.gray[200],
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
  },
  cancelActionText: {
    color: colors.gray[700],
    fontSize: 16,
    fontWeight: '600',
  },
  activateButton: {
    backgroundColor: colors.emergencyRed,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    ...shadows.md,
  },
  activateButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing['2xl'],
    marginHorizontal: spacing.xl,
    alignItems: 'center',
  },
  modalIconContainer: {
    width: 80,
    height: 80,
    backgroundColor: 'rgba(220, 38, 38, 0.1)',
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.gray[900],
    marginBottom: spacing.sm,
  },
  modalDescription: {
    fontSize: 14,
    color: colors.gray[600],
    textAlign: 'center',
    marginBottom: spacing.xl,
    lineHeight: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    width: '100%',
  },
  modalCancelButton: {
    flex: 1,
    backgroundColor: colors.gray[200],
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    marginRight: spacing.sm,
    alignItems: 'center',
  },
  modalCancelText: {
    color: colors.gray[700],
    fontSize: 16,
    fontWeight: '600',
  },
  modalActivateButton: {
    flex: 1,
    backgroundColor: colors.emergencyRed,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    marginLeft: spacing.sm,
    alignItems: 'center',
  },
  modalActivateText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default EmergencyScreen;
