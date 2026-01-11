import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  Animated,
  Platform,
} from 'react-native';
import { Camera, CameraView } from 'expo-camera';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useApp } from '../context/AppContext';
import { colors, spacing, borderRadius, shadows } from '../constants/theme';

const { width, height } = Dimensions.get('window');

const ARNavigationScreen = ({ navigation, route }) => {
  const insets = useSafeAreaInsets();
  const { selectedBuilding, currentLocation, stopNavigation } = useApp();
  
  // Get calculated path from navigation params
  const calculatedPath = route.params?.calculatedPath;
  const destination = route.params?.destination;
  
  const [hasPermission, setHasPermission] = useState(null);
  const [distance, setDistance] = useState(calculatedPath?.totalDistance || selectedBuilding?.distance || 0);
  const [currentWaypointIndex, setCurrentWaypointIndex] = useState(0);
  const [currentInstruction, setCurrentInstruction] = useState('');
  
  // Animation values for AR waypoints
  const waypoint1Anim = useRef(new Animated.Value(1)).current;
  const waypoint2Anim = useRef(new Animated.Value(1)).current;
  const waypoint3Anim = useRef(new Animated.Value(1)).current;
  const markerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();

    // Animate waypoints
    const animateWaypoints = () => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(waypoint1Anim, {
            toValue: 1.2,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(waypoint1Anim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      ).start();

      setTimeout(() => {
        Animated.loop(
          Animated.sequence([
            Animated.timing(waypoint2Anim, {
              toValue: 1.2,
              duration: 800,
              useNativeDriver: true,
            }),
            Animated.timing(waypoint2Anim, {
              toValue: 1,
              duration: 800,
              useNativeDriver: true,
            }),
          ])
        ).start();
      }, 200);

      setTimeout(() => {
        Animated.loop(
          Animated.sequence([
            Animated.timing(waypoint3Anim, {
              toValue: 1.2,
              duration: 800,
              useNativeDriver: true,
            }),
            Animated.timing(waypoint3Anim, {
              toValue: 1,
              duration: 800,
              useNativeDriver: true,
            }),
          ])
        ).start();
      }, 400);
    };

    // Animate marker bounce
    Animated.loop(
      Animated.sequence([
        Animated.timing(markerAnim, {
          toValue: -10,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(markerAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ])
    ).start();

    animateWaypoints();
  }, []);

  // Update navigation based on calculated path and current location
  useEffect(() => {
    // Use coordinates array (which has lat/lng directly) instead of path (which has node IDs)
    if (calculatedPath?.coordinates && calculatedPath.coordinates.length > 0 && currentLocation) {
      const pathCoords = calculatedPath.coordinates;
      
      console.log('🧭 AR: Updating navigation with', pathCoords.length, 'waypoints');
      
      // Find the closest waypoint to current location
      let closestIndex = 0;
      let minDistance = Infinity;
      
      pathCoords.forEach((coord, index) => {
        if (!coord?.latitude || !coord?.longitude) return;
        const dist = calculateDistance(
          currentLocation.latitude,
          currentLocation.longitude,
          coord.latitude,
          coord.longitude
        );
        if (dist < minDistance) {
          minDistance = dist;
          closestIndex = index;
        }
      });
      
      // If very close to current waypoint, move to next
      if (minDistance < 10 && closestIndex < pathCoords.length - 1) {
        setCurrentWaypointIndex(closestIndex + 1);
      } else {
        setCurrentWaypointIndex(closestIndex);
      }
      
      // Calculate remaining distance
      let remainingDist = 0;
      for (let i = closestIndex; i < pathCoords.length - 1; i++) {
        if (pathCoords[i]?.latitude && pathCoords[i+1]?.latitude) {
          remainingDist += calculateDistance(
            pathCoords[i].latitude,
            pathCoords[i].longitude,
            pathCoords[i + 1].latitude,
            pathCoords[i + 1].longitude
          );
        }
      }
      setDistance(Math.round(remainingDist));
      
      // Generate instruction for current waypoint
      if (pathCoords[closestIndex]) {
        const nextCoord = pathCoords[closestIndex];
        const instruction = generateInstruction(currentLocation, nextCoord, pathCoords[closestIndex + 1]);
        setCurrentInstruction(instruction);
      }
    } else if (destination && currentLocation) {
      // Fallback: if no calculated path, use direct direction to destination
      console.log('🧭 AR: No path available, using direct navigation');
      const destCoords = destination.coordinates || destination;
      if (destCoords?.latitude && destCoords?.longitude) {
        const directDist = calculateDistance(
          currentLocation.latitude,
          currentLocation.longitude,
          destCoords.latitude,
          destCoords.longitude
        );
        setDistance(Math.round(directDist));
        
        const bearing = calculateBearing(
          currentLocation.latitude, currentLocation.longitude,
          destCoords.latitude, destCoords.longitude
        );
        
        let direction = '';
        if (bearing >= 315 || bearing < 45) direction = 'north';
        else if (bearing >= 45 && bearing < 135) direction = 'east';
        else if (bearing >= 135 && bearing < 225) direction = 'south';
        else direction = 'west';
        
        setCurrentInstruction(`Head ${direction} towards ${destination.name || 'destination'} (${Math.round(directDist)}m)`);
      }
    }
  }, [currentLocation, calculatedPath, destination]);

  // Calculate distance between two coordinates (Haversine formula)
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3; // Earth's radius in meters
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

  // Generate navigation instruction based on direction
  const generateInstruction = (current, target, next) => {
    if (!current || !target) return 'Continue straight';
    
    // target is now a coordinate object with latitude/longitude directly
    const targetLat = target.latitude;
    const targetLng = target.longitude;
    
    if (!targetLat || !targetLng) return 'Continue straight';
    
    const bearing = calculateBearing(
      current.latitude, current.longitude,
      targetLat, targetLng
    );
    
    const dist = calculateDistance(
      current.latitude, current.longitude,
      targetLat, targetLng
    );
    
    let direction = '';
    if (bearing >= 315 || bearing < 45) direction = 'north';
    else if (bearing >= 45 && bearing < 135) direction = 'east';
    else if (bearing >= 135 && bearing < 225) direction = 'south';
    else direction = 'west';
    
    // Use nodeName if available (from coordinates array)
    const waypointName = target.nodeName || 'waypoint';
    
    if (dist < 20) {
      return `Approaching ${waypointName}`;
    }
    
    return `Head ${direction} towards ${waypointName} (${Math.round(dist)}m)`;
  };

  // Calculate bearing between two points
  const calculateBearing = (lat1, lon1, lat2, lon2) => {
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;
    const y = Math.sin(Δλ) * Math.cos(φ2);
    const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
    const θ = Math.atan2(y, x);
    return (θ * 180 / Math.PI + 360) % 360;
  };

  const handleCancel = () => {
    stopNavigation();
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
        {/* AR Overlay */}
        <View style={styles.arOverlay}>
          {/* Destination Header */}
          <View style={[styles.destinationHeader, { paddingTop: insets.top + 10 }]}>
            <View style={styles.destinationInfo}>
              <Ionicons name="location" size={20} color={colors.primary} />
              <View style={styles.destinationText}>
                <Text style={styles.destinationName}>{selectedBuilding?.name || 'Destination'}</Text>
                <Text style={styles.destinationDistance}>{distance}m away</Text>
              </View>
            </View>
          </View>

          {/* AR Waypoints - Blue circles on the ground */}
          <View style={styles.waypointsContainer}>
            {/* Waypoint 1 - Closest */}
            <Animated.View 
              style={[
                styles.waypoint, 
                styles.waypoint1,
                { transform: [{ scale: waypoint1Anim }] }
              ]} 
            />
            
            {/* Waypoint 2 - Middle */}
            <Animated.View 
              style={[
                styles.waypoint, 
                styles.waypoint2,
                { transform: [{ scale: waypoint2Anim }] }
              ]} 
            />
            
            {/* Waypoint 3 - Further */}
            <Animated.View 
              style={[
                styles.waypoint, 
                styles.waypoint3,
                { transform: [{ scale: waypoint3Anim }] }
              ]} 
            />
            
            {/* Waypoint 4 - Furthest visible */}
            <View style={[styles.waypoint, styles.waypoint4]} />

            {/* Destination Marker */}
            <Animated.View 
              style={[
                styles.destinationMarker,
                { transform: [{ translateY: markerAnim }] }
              ]}
            >
              <Ionicons name="location" size={48} color={colors.navBlue} />
            </Animated.View>
          </View>
        </View>
      </CameraView>

      {/* Bottom Controls */}
      <View style={styles.bottomControls}>
        {/* Navigation Instruction */}
        {currentInstruction && (
          <View style={styles.instructionContainer}>
            <Ionicons name="navigate" size={20} color={colors.navBlue} />
            <Text style={styles.instructionText}>{currentInstruction}</Text>
          </View>
        )}
        
        {/* Mini Map */}
        <View style={styles.miniMapContainer}>
          <MapView
            style={styles.miniMap}
            provider={PROVIDER_GOOGLE}
            region={{
              latitude: selectedBuilding?.coordinates?.latitude || 14.8527,
              longitude: selectedBuilding?.coordinates?.longitude || 120.8157,
              latitudeDelta: 0.004,
              longitudeDelta: 0.004,
            }}
            scrollEnabled={false}
            zoomEnabled={false}
            pitchEnabled={false}
            rotateEnabled={false}
            showsUserLocation={true}
          >
            {selectedBuilding && (
              <>
                <Marker coordinate={selectedBuilding.coordinates}>
                  <View style={styles.miniMapMarker}>
                    <Ionicons name="location" size={24} color={colors.navBlue} />
                  </View>
                </Marker>
                {/* Show calculated path on mini map - use coordinates array */}
                {calculatedPath?.coordinates && calculatedPath.coordinates.length > 0 && (
                  <Polyline
                    coordinates={[
                      // Start from user's current location
                      ...(currentLocation ? [{ latitude: currentLocation.latitude, longitude: currentLocation.longitude }] : []),
                      // Then follow the path coordinates
                      ...calculatedPath.coordinates
                        .filter(coord => coord?.latitude && coord?.longitude)
                        .map(coord => ({
                          latitude: coord.latitude,
                          longitude: coord.longitude
                        }))
                    ]}
                    strokeColor={colors.navBlue}
                    strokeWidth={4}
                    lineDashPattern={[6, 3]}
                  />
                )}
                {/* Fallback: direct line if no path */}
                {(!calculatedPath?.coordinates || calculatedPath.coordinates.length === 0) && currentLocation && (
                  <Polyline
                    coordinates={[currentLocation, selectedBuilding.coordinates]}
                    strokeColor={colors.navBlue}
                    strokeWidth={3}
                    lineDashPattern={[6, 3]}
                  />
                )}
                {/* Show current waypoint marker */}
                {calculatedPath?.coordinates && calculatedPath.coordinates[currentWaypointIndex] && (
                  <Marker 
                    coordinate={{
                      latitude: calculatedPath.coordinates[currentWaypointIndex].latitude,
                      longitude: calculatedPath.coordinates[currentWaypointIndex].longitude
                    }}
                  >
                    <View style={styles.waypointMarker}>
                      <Ionicons name="ellipse" size={12} color={colors.success} />
                    </View>
                  </Marker>
                )}
              </>
            )}
          </MapView>
        </View>

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
  destinationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  destinationText: {
    marginLeft: spacing.sm,
  },
  destinationName: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.gray[900],
  },
  destinationDistance: {
    fontSize: 13,
    color: colors.gray[500],
  },
  waypointsContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 200,
  },
  waypoint: {
    position: 'absolute',
    backgroundColor: colors.navBlue,
    borderRadius: 100,
    opacity: 0.8,
  },
  waypoint1: {
    width: 100,
    height: 35,
    bottom: 80,
  },
  waypoint2: {
    width: 80,
    height: 28,
    bottom: 180,
  },
  waypoint3: {
    width: 60,
    height: 22,
    bottom: 260,
  },
  waypoint4: {
    width: 45,
    height: 16,
    bottom: 320,
    opacity: 0.6,
  },
  destinationMarker: {
    position: 'absolute',
    bottom: 340,
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
  },
  miniMap: {
    ...StyleSheet.absoluteFillObject,
  },
  miniMapMarker: {
    alignItems: 'center',
  },
  waypointMarker: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  instructionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  instructionText: {
    flex: 1,
    marginLeft: spacing.sm,
    fontSize: 14,
    fontWeight: '500',
    color: colors.gray[800],
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cancelButton: {
    backgroundColor: colors.primary,
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
    backgroundColor: colors.navBlue,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.md,
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
    backgroundColor: colors.primary,
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

export default ARNavigationScreen;
