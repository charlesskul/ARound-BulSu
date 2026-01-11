import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  Animated,
} from 'react-native';
import { Camera, CameraView } from 'expo-camera';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useApp } from '../context/AppContext';
import { colors, spacing, borderRadius, shadows } from '../constants/theme';
import { navigateToEvacuation } from '../services/pathfindingService';

const { width, height } = Dimensions.get('window');

const AREmergencyScreen = ({ navigation, route }) => {
  const insets = useSafeAreaInsets();
  const { clearEmergencyMode, currentLocation } = useApp();
  const { evacuationArea } = route.params || {};
  
  const [hasPermission, setHasPermission] = useState(null);
  const [evacuationPath, setEvacuationPath] = useState(null);
  const [distance, setDistance] = useState(0);
  const [currentInstruction, setCurrentInstruction] = useState('Head to evacuation area');
  
  // Animation values for emergency AR waypoints (red)
  const waypoint1Anim = useRef(new Animated.Value(1)).current;
  const waypoint2Anim = useRef(new Animated.Value(1)).current;
  const markerAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();

    // Animate waypoints with urgency (faster animation)
    const animateWaypoints = () => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(waypoint1Anim, {
            toValue: 1.3,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(waypoint1Anim, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
        ])
      ).start();

      setTimeout(() => {
        Animated.loop(
          Animated.sequence([
            Animated.timing(waypoint2Anim, {
              toValue: 1.3,
              duration: 400,
              useNativeDriver: true,
            }),
            Animated.timing(waypoint2Anim, {
              toValue: 1,
              duration: 400,
              useNativeDriver: true,
            }),
          ])
        ).start();
      }, 150);
    };

    // Animate marker bounce
    Animated.loop(
      Animated.sequence([
        Animated.timing(markerAnim, {
          toValue: -15,
          duration: 350,
          useNativeDriver: true,
        }),
        Animated.timing(markerAnim, {
          toValue: 0,
          duration: 350,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Pulse animation for urgency
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ])
    ).start();

    animateWaypoints();
  }, []);

  // Calculate evacuation path using Dijkstra algorithm
  useEffect(() => {
    if (currentLocation) {
      const result = navigateToEvacuation(currentLocation);
      if (result) {
        setEvacuationPath(result);
        setDistance(result.totalDistance);
        console.log(`[Emergency] Evacuation path calculated: ${result.totalDistance}m to ${result.endNode?.name}`);
      }
    }
  }, [currentLocation]);

  // Calculate distance between two coordinates
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3;
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const handleCancel = () => {
    if (clearEmergencyMode) {
      clearEmergencyMode();
    }
    navigation.goBack();
  };

  if (hasPermission === null) {
    return (
      <View style={styles.permissionContainer}>
        <Text>Requesting camera permission...</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.permissionContainer}>
        <Ionicons name="camera-off" size={64} color={colors.gray[400]} />
        <Text style={styles.permissionText}>Camera permission is required for AR navigation</Text>
        <TouchableOpacity style={styles.permissionButton} onPress={handleCancel}>
          <Text style={styles.permissionButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Camera View */}
      <CameraView style={styles.camera} facing="back">
        {/* Emergency AR Overlay */}
        <View style={styles.arOverlay}>
          {/* Destination Header - Emergency Style */}
          <View style={[styles.destinationHeader, { paddingTop: insets.top + 10 }]}>
            <Animated.View style={[styles.emergencyBanner, { transform: [{ scale: pulseAnim }] }]}>
              <Ionicons name="warning" size={16} color={colors.white} />
              <Text style={styles.emergencyBannerText}>EMERGENCY EVACUATION</Text>
            </Animated.View>
            <View style={styles.destinationInfo}>
              <Ionicons name="location" size={20} color={colors.emergencyRed} />
              <View style={styles.destinationText}>
                <Text style={styles.destinationLabel}>Nearest Evacuation Area</Text>
                <Text style={styles.destinationName}>{evacuationArea?.name || 'Bulacan Heroes Park'}</Text>
              </View>
            </View>
          </View>

          {/* Emergency AR Waypoints - Red circles */}
          <View style={styles.waypointsContainer}>
            {/* Red Waypoint 1 */}
            <Animated.View 
              style={[
                styles.emergencyWaypoint, 
                styles.waypoint1,
                { transform: [{ scale: waypoint1Anim }] }
              ]} 
            />
            
            {/* Red Waypoint 2 */}
            <Animated.View 
              style={[
                styles.emergencyWaypoint, 
                styles.waypoint2,
                { transform: [{ scale: waypoint2Anim }] }
              ]} 
            />
            
            {/* Red Waypoint 3 */}
            <View style={[styles.emergencyWaypoint, styles.waypoint3]} />

            {/* Emergency Destination Marker */}
            <Animated.View 
              style={[
                styles.destinationMarker,
                { transform: [{ translateY: markerAnim }] }
              ]}
            >
              <Ionicons name="location" size={56} color={colors.emergencyRed} />
            </Animated.View>
          </View>
        </View>
      </CameraView>

      {/* Bottom Controls - Emergency Style */}
      <View style={styles.bottomControls}>
        {/* Mini Map */}
        <View style={styles.miniMapContainer}>
          <MapView
            style={styles.miniMap}
            provider={PROVIDER_GOOGLE}
            region={{
              latitude: evacuationArea?.coordinates?.latitude || evacuationPath?.endNode?.coordinates?.latitude || 14.8510,
              longitude: evacuationArea?.coordinates?.longitude || evacuationPath?.endNode?.coordinates?.longitude || 120.8140,
              latitudeDelta: 0.004,
              longitudeDelta: 0.004,
            }}
            scrollEnabled={false}
            zoomEnabled={false}
            pitchEnabled={false}
            rotateEnabled={false}
            showsUserLocation={true}
          >
            {/* Evacuation destination marker */}
            {(evacuationArea || evacuationPath?.endNode) && (
              <>
                <Marker 
                  coordinate={
                    evacuationArea?.coordinates || 
                    evacuationPath?.endNode?.coordinates
                  }
                >
                  <View style={styles.miniMapMarker}>
                    <Ionicons name="location" size={24} color={colors.emergencyRed} />
                  </View>
                </Marker>
                
                {/* Show Dijkstra-calculated evacuation path */}
                {evacuationPath?.path && (
                  <Polyline
                    coordinates={evacuationPath.path.map(node => ({
                      latitude: node.coordinates.latitude,
                      longitude: node.coordinates.longitude
                    }))}
                    strokeColor={colors.emergencyRed}
                    strokeWidth={4}
                  />
                )}
                
                {/* Fallback: direct line if no path calculated */}
                {!evacuationPath && currentLocation && evacuationArea && (
                  <Polyline
                    coordinates={[currentLocation, evacuationArea.coordinates]}
                    strokeColor={colors.emergencyRed}
                    strokeWidth={3}
                  />
                )}
              </>
            )}
          </MapView>
        </View>

        {/* Distance Info */}
        {evacuationPath && (
          <View style={styles.distanceInfo}>
            <Text style={styles.distanceText}>
              {distance}m • ~{evacuationPath.estimatedTime} min to safety
            </Text>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.compassButton}>
            <Ionicons name="navigate" size={24} color={colors.white} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.black,
  },
  camera: {
    flex: 1,
  },
  arOverlay: {
    flex: 1,
  },
  destinationHeader: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
  },
  emergencyBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.emergencyRed,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
  },
  emergencyBannerText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    marginLeft: spacing.sm,
  },
  destinationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  destinationText: {
    marginLeft: spacing.sm,
  },
  destinationLabel: {
    fontSize: 12,
    color: colors.gray[500],
  },
  destinationName: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.gray[900],
  },
  waypointsContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 200,
  },
  emergencyWaypoint: {
    position: 'absolute',
    backgroundColor: colors.emergencyRed,
    borderRadius: 100,
    opacity: 0.85,
  },
  waypoint1: {
    width: 120,
    height: 40,
    bottom: 80,
  },
  waypoint2: {
    width: 90,
    height: 32,
    bottom: 180,
  },
  waypoint3: {
    width: 65,
    height: 24,
    bottom: 260,
    opacity: 0.7,
  },
  destinationMarker: {
    position: 'absolute',
    bottom: 300,
  },
  bottomControls: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing['2xl'],
  },
  miniMapContainer: {
    height: 120,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    marginBottom: spacing.md,
    borderWidth: 2,
    borderColor: colors.emergencyRed,
  },
  miniMap: {
    ...StyleSheet.absoluteFillObject,
  },
  miniMapMarker: {
    alignItems: 'center',
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cancelButton: {
    backgroundColor: colors.emergencyRed,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
  },
  cancelButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  compassButton: {
    width: 50,
    height: 50,
    backgroundColor: colors.emergencyRed,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.md,
  },
  distanceInfo: {
    backgroundColor: 'rgba(220, 38, 38, 0.9)',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
    alignItems: 'center',
  },
  distanceText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.white,
    padding: spacing.xl,
  },
  permissionText: {
    fontSize: 16,
    color: colors.gray[600],
    textAlign: 'center',
    marginTop: spacing.lg,
    marginBottom: spacing.xl,
  },
  permissionButton: {
    backgroundColor: colors.emergencyRed,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
  },
  permissionButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default AREmergencyScreen;
