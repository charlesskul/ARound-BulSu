import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Dimensions,
  Platform,
  StatusBar,
  Image,
  Modal,
  Animated,
} from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useApp } from '../context/AppContext';
import { mapConfig } from '../data/campusData';
import { campusNodes } from '../data/campusGraph';
import { navigateToBuilding, navigateToEvacuation } from '../services/pathfindingService';
import { colors, spacing, borderRadius, shadows } from '../constants/theme';
import EmergencyBanner from '../components/EmergencyBanner';

const { width, height } = Dimensions.get('window');

const NavigateScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const mapRef = useRef(null);
  const { 
    currentLocation, 
    selectedBuilding, 
    setSelectedBuilding, 
    startNavigation, 
    isNavigating, 
    navigationRoute, 
    isEmergencyMode,
    buildings, // Now from context (synced from server)
    isDataFromServer,
    refreshCampusData,
    isLoggedIn,
    userData,
    logout,
  } = useApp();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [showBuildingPreview, setShowBuildingPreview] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [pathResult, setPathResult] = useState(null);
  const [showPathNodes, setShowPathNodes] = useState(false);
  const slideAnim = useRef(new Animated.Value(-width * 0.75)).current;

  // Menu toggle functions
  const openMenu = () => {
    setShowMenu(true);
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const closeMenu = () => {
    Animated.timing(slideAnim, {
      toValue: -width * 0.75,
      duration: 300,
      useNativeDriver: true,
    }).start(() => setShowMenu(false));
  };

  const handleRefreshData = async () => {
    closeMenu();
    await refreshCampusData();
  };

  const handleLogout = () => {
    closeMenu();
    logout();
  };

  const handleBuildingSelect = (building) => {
    setSelectedBuilding(building);
    setShowBuildingPreview(true);
    
    // Safety check for coordinates
    const buildingLat = building?.coordinates?.latitude || building?.latitude || 0;
    const buildingLng = building?.coordinates?.longitude || building?.longitude || 0;
    
    if (!buildingLat || !buildingLng) {
      console.warn('Building has invalid coordinates:', building);
      return;
    }
    
    // Calculate path using A* algorithm
    if (currentLocation) {
      // Use nodeId if available (synced from admin), otherwise fall back to id or name
      const targetId = building.nodeId || building.id || building.name;
      console.log('🗺️ Calculating path to:', targetId);
      const result = navigateToBuilding(currentLocation, targetId);
      if (result) {
        setPathResult(result);
        console.log(`✅ Path found: ${result.totalDistance}m, ~${result.estimatedTime} min, ${result.coordinates?.length || 0} waypoints`);
        console.log('📍 Path coordinates:', result.coordinates?.slice(0, 3), '...');
      } else {
        console.log('❌ No path found - nodes may not be connected');
        setPathResult(null);
      }
    }
    
    // Animate to the building location
    mapRef.current?.animateToRegion({
      latitude: buildingLat,
      longitude: buildingLng,
      latitudeDelta: 0.002,
      longitudeDelta: 0.002,
    }, 500);
  };

  // Handle emergency evacuation pathfinding
  useEffect(() => {
    if (isEmergencyMode && currentLocation) {
      const evacResult = navigateToEvacuation(currentLocation);
      if (evacResult) {
        setPathResult(evacResult);
        console.log(`Evacuation path: ${evacResult.totalDistance}m to ${evacResult.endNode.name}`);
      }
    } else if (!isEmergencyMode) {
      // Clear evacuation path when emergency ends
      if (pathResult?.endNode?.isEvacuationPoint) {
        setPathResult(null);
      }
    }
  }, [isEmergencyMode, currentLocation]);

  const handleStartNavigation = () => {
    if (selectedBuilding) {
      startNavigation(selectedBuilding);
      // Pass the calculated path to AR navigation
      navigation.navigate('ARNavigation', {
        calculatedPath: pathResult,
        destination: selectedBuilding
      });
    }
  };

  const handleSearchPress = () => {
    navigation.navigate('BuildingSearch');
  };

  const generateRouteCoordinates = () => {
    // Use calculated path coordinates from A* or Dijkstra if available
    // pathResult.coordinates contains the actual lat/lng coordinates
    if (pathResult && pathResult.coordinates && pathResult.coordinates.length > 0) {
      const coords = pathResult.coordinates
        .filter(coord => coord?.latitude && coord?.longitude)
        .map(coord => ({
          latitude: coord.latitude,
          longitude: coord.longitude
        }));
      
      // If we have valid coordinates from the path, use them
      if (coords.length > 0) {
        // Prepend current location if available for smooth route from user
        if (currentLocation) {
          return [
            { latitude: currentLocation.latitude, longitude: currentLocation.longitude },
            ...coords
          ];
        }
        return coords;
      }
    }
    
    // Fallback: direct line if no path calculated yet
    if (!currentLocation || !selectedBuilding) return [];
    
    // Safely get selectedBuilding coordinates
    const destLat = selectedBuilding?.coordinates?.latitude || selectedBuilding?.latitude || 0;
    const destLng = selectedBuilding?.coordinates?.longitude || selectedBuilding?.longitude || 0;
    
    if (!destLat || !destLng) return [];
    
    return [
      { latitude: currentLocation.latitude, longitude: currentLocation.longitude },
      { latitude: destLat, longitude: destLng },
    ];
  };

  const generateIntermediatePoints = (start, end) => {
    // Generate intermediate points for a more realistic route
    const points = [];
    const steps = 3;
    
    for (let i = 1; i < steps; i++) {
      const ratio = i / steps;
      // Add some variation to make the route look more natural
      const latOffset = (Math.random() - 0.5) * 0.0005;
      const lngOffset = (Math.random() - 0.5) * 0.0005;
      
      points.push({
        latitude: start.latitude + (end.latitude - start.latitude) * ratio + latOffset,
        longitude: start.longitude + (end.longitude - start.longitude) * ratio + lngOffset,
      });
    }
    
    return points;
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Emergency Banner - Shows when admin activates emergency */}
      <EmergencyBanner />
      
      {/* Map View */}
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={mapConfig.initialRegion}
        showsUserLocation={true}
        showsMyLocationButton={false}
        showsCompass={false}
        mapType="standard"
      >
        {/* Building Markers */}
        {(buildings || [])
          .filter(building => {
            // Only render markers with valid coordinates
            const lat = building?.coordinates?.latitude || building?.latitude;
            const lng = building?.coordinates?.longitude || building?.longitude;
            return lat && lng && !isNaN(lat) && !isNaN(lng);
          })
          .map((building) => {
            const coordinate = {
              latitude: building?.coordinates?.latitude || building?.latitude || 0,
              longitude: building?.coordinates?.longitude || building?.longitude || 0,
            };
            return (
              <Marker
                key={building.id}
                coordinate={coordinate}
                onPress={() => handleBuildingSelect(building)}
              >
                <View style={styles.markerContainer}>
                  <Ionicons 
                    name="location" 
                    size={32} 
                    color={selectedBuilding?.id === building.id ? colors.primary : colors.navBlue} 
                  />
                </View>
              </Marker>
            );
          })}

        {/* Navigation Route */}
        {selectedBuilding && showBuildingPreview && (
          <Polyline
            coordinates={generateRouteCoordinates()}
            strokeColor={colors.navBlue}
            strokeWidth={4}
            lineDashPattern={[10, 5]}
          />
        )}
      </MapView>

      {/* Search Bar - Moved to top */}
      <TouchableOpacity 
        style={[styles.searchContainer, { top: insets.top + 12 }]}
        onPress={handleSearchPress}
        activeOpacity={0.9}
      >
        <TouchableOpacity onPress={openMenu} style={styles.menuIconButton}>
          <Ionicons name="menu" size={24} color={colors.gray[600]} />
        </TouchableOpacity>
        <Text style={styles.searchPlaceholder}>Find Building or Office</Text>
        <Ionicons name="search" size={24} color={colors.gray[500]} />
      </TouchableOpacity>

      {/* Data Sync Indicator */}
      {isDataFromServer && (
        <View style={[styles.syncIndicator, { top: insets.top + 70 }]}>
          <Ionicons name="cloud-done" size={14} color={colors.success} />
          <Text style={styles.syncText}>Synced</Text>
        </View>
      )}

      {/* Side Menu Drawer */}
      {showMenu && (
        <TouchableOpacity 
          style={styles.menuOverlay} 
          activeOpacity={1} 
          onPress={closeMenu}
        >
          <Animated.View 
            style={[
              styles.menuDrawer, 
              { transform: [{ translateX: slideAnim }], paddingTop: insets.top + 20 }
            ]}
          >
            <TouchableOpacity activeOpacity={1}>
              {/* Menu Header */}
              <View style={styles.menuHeader}>
                <View style={styles.menuAvatar}>
                  <Ionicons name="person" size={40} color={colors.white} />
                </View>
                <Text style={styles.menuUserName}>
                  {isLoggedIn ? (userData?.name || 'Student') : 'Guest User'}
                </Text>
                <Text style={styles.menuUserEmail}>
                  {isLoggedIn ? (userData?.studentId || '') : 'Not logged in'}
                </Text>
              </View>

              {/* Menu Items */}
              <View style={styles.menuItems}>
                <TouchableOpacity style={styles.menuItem} onPress={() => { closeMenu(); navigation.navigate('Navigate'); }}>
                  <Ionicons name="navigate" size={22} color={colors.gray[700]} />
                  <Text style={styles.menuItemText}>Navigation</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.menuItem} onPress={() => { closeMenu(); navigation.navigate('Info'); }}>
                  <Ionicons name="information-circle" size={22} color={colors.gray[700]} />
                  <Text style={styles.menuItemText}>Campus Info</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.menuItem} onPress={handleRefreshData}>
                  <Ionicons name="refresh" size={22} color={colors.gray[700]} />
                  <Text style={styles.menuItemText}>Refresh Data</Text>
                </TouchableOpacity>

                <View style={styles.menuDivider} />

                <TouchableOpacity style={styles.menuItem} onPress={() => { closeMenu(); }}>
                  <Ionicons name="settings" size={22} color={colors.gray[700]} />
                  <Text style={styles.menuItemText}>Settings</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.menuItem} onPress={() => { closeMenu(); }}>
                  <Ionicons name="help-circle" size={22} color={colors.gray[700]} />
                  <Text style={styles.menuItemText}>Help & Support</Text>
                </TouchableOpacity>

                {isLoggedIn && (
                  <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
                    <Ionicons name="log-out" size={22} color={colors.danger} />
                    <Text style={[styles.menuItemText, { color: colors.danger }]}>Logout</Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* App Version */}
              <View style={styles.menuFooter}>
                <Text style={styles.menuVersion}>ARound BulSU v1.0.0</Text>
              </View>
            </TouchableOpacity>
          </Animated.View>
        </TouchableOpacity>
      )}

      {/* Building Preview Card */}
      {showBuildingPreview && selectedBuilding && (
        <View style={styles.previewCard}>
          <View style={styles.previewHeader}>
            <Ionicons name="location" size={20} color={colors.primary} />
            <View style={styles.previewTitleContainer}>
              <Text style={styles.previewTitle}>{selectedBuilding.name}</Text>
              <Text style={styles.previewDistance}>
                {pathResult 
                  ? `${pathResult.totalDistance}m • ~${pathResult.estimatedTime} min walk`
                  : `${selectedBuilding.distance}m away`
                }
              </Text>
            </View>
          </View>

          {/* Route Info - Shows when path is calculated */}
          {pathResult && pathResult.path && (
            <View style={styles.routeInfoContainer}>
              <View style={styles.routeInfoItem}>
                <Ionicons name="footsteps" size={16} color={colors.navBlue} />
                <Text style={styles.routeInfoText}>{pathResult.path.length} waypoints</Text>
              </View>
              <View style={styles.routeInfoItem}>
                <Ionicons name="time" size={16} color={colors.navBlue} />
                <Text style={styles.routeInfoText}>~{pathResult.estimatedTime} min</Text>
              </View>
              <View style={styles.routeInfoItem}>
                <Ionicons name="navigate-circle" size={16} color={colors.navBlue} />
                <Text style={styles.routeInfoText}>{pathResult.totalDistance}m</Text>
              </View>
            </View>
          )}

          {/* Mini Map Preview */}
          <View style={styles.miniMapContainer}>
            {(() => {
              const selLat = selectedBuilding?.coordinates?.latitude || selectedBuilding?.latitude || 0;
              const selLng = selectedBuilding?.coordinates?.longitude || selectedBuilding?.longitude || 0;
              const selCoord = { latitude: selLat, longitude: selLng };
              
              if (!selLat || !selLng) return null;
              
              return (
                <MapView
                  style={styles.miniMap}
                  provider={PROVIDER_GOOGLE}
                  region={{
                    latitude: selLat,
                    longitude: selLng,
                    latitudeDelta: 0.003,
                    longitudeDelta: 0.003,
                  }}
                  scrollEnabled={false}
                  zoomEnabled={false}
                  pitchEnabled={false}
                  rotateEnabled={false}
                  showsUserLocation={true}
                >
                  <Marker coordinate={selCoord}>
                    <Ionicons name="location" size={28} color={colors.navBlue} />
                  </Marker>
                  {/* Show calculated path on mini map */}
                  {pathResult && pathResult.path && (
                    <Polyline
                      coordinates={pathResult.path.map(node => ({
                        latitude: node.coordinates?.latitude || 0,
                        longitude: node.coordinates?.longitude || 0
                      })).filter(c => c.latitude && c.longitude)}
                      strokeColor={colors.navBlue}
                      strokeWidth={3}
                      lineDashPattern={[8, 4]}
                    />
                  )}
                  {/* Fallback: direct line if no path */}
                  {!pathResult && currentLocation && (
                    <Polyline
                      coordinates={[currentLocation, selCoord]}
                      strokeColor={colors.navBlue}
                      strokeWidth={3}
                      lineDashPattern={[8, 4]}
                    />
                  )}
                </MapView>
              );
            })()}
          </View>

          {/* Offices/Departments */}
          <View style={styles.officesContainer}>
            <Text style={styles.officesLabel}>In this building:</Text>
            <View style={styles.officesTags}>
              {selectedBuilding.offices.slice(0, 3).map((office, index) => (
                <View key={index} style={styles.officeTag}>
                  <Text style={styles.officeTagText}>{office}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Start Navigation Button */}
          <TouchableOpacity 
            style={styles.startButton}
            onPress={handleStartNavigation}
          >
            <Ionicons name="navigate" size={20} color={colors.white} />
            <Text style={styles.startButtonText}>Start Navigating</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Map Controls */}
      <View style={styles.mapControls}>
        <TouchableOpacity style={styles.mapControlButton}>
          <Ionicons name="add" size={24} color={colors.gray[700]} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.mapControlButton}>
          <Ionicons name="remove" size={24} color={colors.gray[700]} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: spacing.lg,
    zIndex: 10,
  },
  menuButton: {
    width: 44,
    height: 44,
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.md,
  },
  searchContainer: {
    position: 'absolute',
    left: spacing.lg,
    right: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    ...shadows.md,
  },
  searchPlaceholder: {
    flex: 1,
    marginLeft: spacing.md,
    fontSize: 16,
    color: colors.gray[400],
  },
  previewCard: {
    position: 'absolute',
    bottom: 100,
    left: spacing.lg,
    right: spacing.lg,
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    ...shadows.lg,
  },
  previewHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  previewTitleContainer: {
    marginLeft: spacing.sm,
    flex: 1,
  },
  previewTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.gray[900],
  },
  previewDistance: {
    fontSize: 13,
    color: colors.gray[500],
    marginTop: 2,
  },
  routeInfoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: colors.gray[50],
    borderRadius: borderRadius.md,
    paddingVertical: spacing.sm,
    marginBottom: spacing.md,
  },
  routeInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  routeInfoText: {
    fontSize: 12,
    color: colors.gray[600],
    marginLeft: spacing.xs,
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
  officesContainer: {
    marginBottom: spacing.lg,
  },
  officesLabel: {
    fontSize: 13,
    color: colors.gray[500],
    marginBottom: spacing.sm,
  },
  officesTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  officeTag: {
    backgroundColor: colors.gray[100],
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    marginRight: spacing.sm,
    marginBottom: spacing.xs,
  },
  officeTagText: {
    fontSize: 12,
    color: colors.gray[700],
  },
  startButton: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    borderRadius: borderRadius.xl,
  },
  startButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: spacing.sm,
  },
  mapControls: {
    position: 'absolute',
    right: spacing.lg,
    bottom: 180,
  },
  mapControlButton: {
    width: 40,
    height: 40,
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
    ...shadows.sm,
  },
  markerContainer: {
    alignItems: 'center',
  },
  // Menu Drawer Styles
  menuIconButton: {
    padding: spacing.xs,
  },
  syncIndicator: {
    position: 'absolute',
    right: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
  },
  syncText: {
    fontSize: 12,
    color: colors.success,
    marginLeft: 4,
  },
  menuOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 1000,
  },
  menuDrawer: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: width * 0.75,
    backgroundColor: colors.white,
    ...shadows.xl,
  },
  menuHeader: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
    paddingTop: spacing.lg,
  },
  menuAvatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  menuUserName: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.white,
  },
  menuUserEmail: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  menuItems: {
    paddingVertical: spacing.md,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  menuItemText: {
    fontSize: 16,
    color: colors.gray[700],
    marginLeft: spacing.md,
  },
  menuDivider: {
    height: 1,
    backgroundColor: colors.gray[200],
    marginVertical: spacing.sm,
    marginHorizontal: spacing.lg,
  },
  menuFooter: {
    position: 'absolute',
    bottom: 30,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  menuVersion: {
    fontSize: 12,
    color: colors.gray[400],
  },
});

export default NavigateScreen;
