import React, { createContext, useContext, useState, useEffect } from 'react';
import * as Location from 'expo-location';
import { emergencyService, EMERGENCY_INFO } from '../services/emergencyService';
import campusDataProvider from '../services/campusDataProvider';
import campusDataService from '../services/campusDataService';

const AppContext = createContext();

export const useApp = () => useContext(AppContext);

export const AppProvider = ({ children }) => {
  const [currentLocation, setCurrentLocation] = useState(null);
  const [selectedBuilding, setSelectedBuilding] = useState(null);
  const [isEmergencyMode, setIsEmergencyMode] = useState(false);
  const [emergencyData, setEmergencyData] = useState(null);
  const [isNavigating, setIsNavigating] = useState(false);
  const [navigationRoute, setNavigationRoute] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState(null);
  
  // Campus data state - initialize with empty arrays, then load from provider
  const [buildings, setBuildings] = useState([]);
  const [evacuationAreas, setEvacuationAreas] = useState([]);
  const [isDataFromServer, setIsDataFromServer] = useState(false);
  const [dataLastUpdated, setDataLastUpdated] = useState(null);

  // Initialize campus data on mount
  // Server data will override this via subscribe callback when fetchData() completes
  useEffect(() => {
    // Load default data initially (for quick display while server loads)
    const initialBuildings = campusDataProvider.getBuildings();
    const initialEvacuationAreas = campusDataProvider.getEvacuationAreas();
    
    console.log('📍 AppContext: Loading initial defaults - buildings:', initialBuildings?.length);
    
    if (initialBuildings && initialBuildings.length > 0) {
      setBuildings(initialBuildings);
    }
    if (initialEvacuationAreas && initialEvacuationAreas.length > 0) {
      setEvacuationAreas(initialEvacuationAreas);
    }
  }, []);

  useEffect(() => {
    // Initialize location tracking
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.log('Permission to access location was denied');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setCurrentLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      // Watch location updates
      Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          distanceInterval: 1,
        },
        (location) => {
          setCurrentLocation({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          });
        }
      );
    })();

    // Initialize emergency service and subscribe to updates
    emergencyService.initialize();
    
    const unsubscribeEmergency = emergencyService.subscribe((emergency) => {
      if (emergency && emergency.isActive) {
        setIsEmergencyMode(true);
        setEmergencyData(emergency);
        // Clear any ongoing navigation when emergency is activated
        setIsNavigating(false);
        setNavigationRoute(null);
      } else {
        setIsEmergencyMode(false);
        setEmergencyData(null);
      }
    });

    // Subscribe to campus data updates
    const unsubscribeCampusData = campusDataProvider.subscribe((data) => {
      console.log('📍 AppContext: Campus data update received!');
      console.log('📍 AppContext: Buildings count:', data.buildings?.length);
      console.log('📍 AppContext: Is from server:', data.isServerData);
      if (data.buildings?.length > 0) {
        console.log('📍 AppContext: First building:', data.buildings[0].name, 'at', data.buildings[0].coordinates);
      }
      setBuildings(data.buildings);
      setEvacuationAreas(data.evacuationAreas);
      setIsDataFromServer(data.isServerData);
      setDataLastUpdated(data.lastFetchTime);
    });

    // Initialize data services in sequence for proper sync
    const initializeData = async () => {
      try {
        // First, initialize campus nodes sync service (for pathfinding graph)
        // This MUST complete before pathfinding will work correctly
        console.log('📍 Initializing campus data services...');
        await campusDataService.initialize();
        console.log('📍 Campus node data service initialized');
        
        // Then fetch campus data from server (buildings list)
        await campusDataProvider.fetchData();
        console.log('📍 Campus data provider fetched');
        
        // Force a sync to ensure we have latest data
        await campusDataService.syncFromServer().catch(err => {
          console.log('📍 Initial sync warning:', err.message);
        });
        console.log('📍 All campus data services ready');
      } catch (err) {
        console.log('📍 Campus data init error:', err.message);
      }
    };
    
    initializeData();

    // Periodically refresh campus data (every 5 minutes)
    const refreshInterval = setInterval(() => {
      campusDataProvider.fetchData();
      campusDataService.syncFromServer().catch(err => {
        console.log('📍 Background node sync failed:', err.message);
      });
    }, 5 * 60 * 1000);

    return () => {
      unsubscribeEmergency();
      unsubscribeCampusData();
      emergencyService.destroy();
      clearInterval(refreshInterval);
    };
  }, []);

  const login = (studentId, password) => {
    // In production, validate against backend
    setIsLoggedIn(true);
    setUserData({
      studentId,
      name: 'Student User',
    });
    return true;
  };

  const logout = () => {
    setIsLoggedIn(false);
    setUserData(null);
  };

  const startNavigation = (building) => {
    setSelectedBuilding(building);
    setIsNavigating(true);
    // Generate route to building
    setNavigationRoute({
      destination: building,
      waypoints: generateWaypoints(currentLocation, building.coordinates),
    });
  };

  const stopNavigation = () => {
    setIsNavigating(false);
    setNavigationRoute(null);
  };

  // Get emergency display info
  const getEmergencyInfo = () => {
    if (!emergencyData) return null;
    return EMERGENCY_INFO[emergencyData.type] || EMERGENCY_INFO.other;
  };

  const generateWaypoints = (start, end) => {
    // Simplified waypoint generation - in production, use actual pathfinding
    if (!start || !end) return [];
    
    const waypoints = [];
    const steps = 5;
    
    for (let i = 1; i <= steps; i++) {
      waypoints.push({
        latitude: start.latitude + (end.latitude - start.latitude) * (i / steps),
        longitude: start.longitude + (end.longitude - start.longitude) * (i / steps),
      });
    }
    
    return waypoints;
  };

  // Refresh campus data from server - syncs both buildings AND pathfinding graph
  const refreshCampusData = async () => {
    console.log('📍 Manual refresh triggered...');
    try {
      // Sync pathfinding graph first
      await campusDataService.syncFromServer();
      console.log('📍 Pathfinding graph synced');
      
      // Then sync building list
      const result = await campusDataProvider.fetchData();
      console.log('📍 Building data synced');
      
      return result;
    } catch (err) {
      console.log('📍 Refresh error:', err.message);
      // Still try to fetch buildings even if graph sync fails
      return await campusDataProvider.fetchData();
    }
  };

  // Search buildings
  const searchBuildings = (query) => {
    return campusDataProvider.searchBuildings(query);
  };

  // Clear emergency mode (for when user dismisses or navigates away)
  const clearEmergencyMode = () => {
    setIsEmergencyMode(false);
    setEmergencyData(null);
  };

  const value = {
    currentLocation,
    selectedBuilding,
    setSelectedBuilding,
    isEmergencyMode,
    emergencyData,
    getEmergencyInfo,
    isNavigating,
    navigationRoute,
    startNavigation,
    stopNavigation,
    isLoggedIn,
    userData,
    login,
    logout,
    // Campus data
    buildings,
    evacuationAreas,
    isDataFromServer,
    dataLastUpdated,
    refreshCampusData,
    searchBuildings,
    // Emergency
    clearEmergencyMode,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
