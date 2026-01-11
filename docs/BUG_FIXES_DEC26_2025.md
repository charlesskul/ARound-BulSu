# ARound BulSU - Bug Fixes & Updates

**Date:** December 26, 2025  
**Version:** 1.2.0  
**Status:** ✅ Completed

---

## Overview

This document details the comprehensive bug fixes and improvements made to the ARound BulSU application on December 26, 2025. These changes address multiple issues reported in the mobile app, including pathfinding, emergency notifications, search functionality, and data synchronization.

---

## Issues Identified & Fixed

### 1. ✅ IP Address Configuration
**Problem:** Mobile app was using outdated IP address (`192.168.100.188`) which prevented connection to the backend server.

**Files Modified:**
- `mobile-app/src/services/apiService.js`
- `mobile-app/src/services/emergencyService.js`

**Fix:**
```javascript
// BEFORE
const API_BASE_URL = 'http://192.168.100.188:3001/api';

// AFTER
const API_BASE_URL = 'http://192.168.254.104:3001/api';
```

**Note:** Use `.\update-ip.ps1` script to automatically update IP when changing networks.

---

### 2. ✅ Navigation Routes Cutting Through Buildings
**Problem:** Route polylines were drawing direct lines through buildings instead of following the walkway paths defined in the Campus Node Manager.

**Root Cause:** 
- Pathfinding was returning `null` because node lookup was failing
- The synced node IDs from admin (`node_1766027517126`) didn't match during lookup
- Data sync timing issues - pathfinding attempted before sync completed

**Files Modified:**
- `mobile-app/src/services/pathfindingService.js`
- `mobile-app/src/context/AppContext.js`

**Fix - Enhanced Node Lookup (5 methods):**
```javascript
// Method 1: Direct node ID lookup
if (campusNodes[buildingIdOrNodeId]) {
  buildingNode = campusNodes[buildingIdOrNodeId];
}

// Method 2: Legacy buildingId lookup
if (!buildingNode) {
  buildingNode = Object.values(campusNodes).find(
    node => node.buildingId === buildingIdOrNodeId
  );
}

// Method 3: Exact name match
if (!buildingNode && typeof buildingIdOrNodeId === 'string') {
  buildingNode = Object.values(campusNodes).find(
    node => node.name?.toLowerCase() === buildingIdOrNodeId.toLowerCase()
  );
}

// Method 4: Partial name match
if (!buildingNode && typeof buildingIdOrNodeId === 'string') {
  const searchName = buildingIdOrNodeId.toLowerCase();
  buildingNode = Object.values(campusNodes).find(
    node => node.name?.toLowerCase().includes(searchName) ||
            searchName.includes(node.name?.toLowerCase())
  );
}

// Method 5: Coordinate proximity match (within 50m)
if (!buildingNode && typeof buildingIdOrNodeId === 'object') {
  // Find nearest node to target coordinates
}
```

**Fix - Proper Data Initialization Order:**
```javascript
// AppContext.js - Now initializes services in sequence
const initializeData = async () => {
  // 1. Initialize campus nodes sync service FIRST
  await campusDataService.initialize();
  
  // 2. Then fetch campus data
  await campusDataProvider.fetchData();
  
  // 3. Force sync to ensure latest data
  await campusDataService.syncFromServer();
};
```

---

### 3. ✅ "No Path Found" Errors
**Problem:** Users frequently received "No path found" errors when trying to navigate to buildings.

**Root Cause:** 
- Node lookup was failing due to ID mismatches
- Nodes had no connections in the graph
- Synced data wasn't being used for pathfinding

**Files Modified:**
- `mobile-app/src/services/pathfindingService.js`

**Fix - Added comprehensive debug logging:**
```javascript
console.log('🗺️ ==================== PATHFINDING START ====================');
console.log('🗺️ Total nodes available:', Object.keys(campusNodes).length);
console.log('🗺️ Graph connections:', Object.keys(campusGraph).length);
console.log(`🗺️ Start node "${startNode.name}" has ${startConnections.length} connections`);
console.log(`🗺️ Dest node "${buildingNode.name}" has ${destConnections.length} connections`);

// Warnings for debugging
if (startConnections.length === 0) {
  console.warn('⚠️ Start node has NO connections - pathfinding will fail!');
}
if (destConnections.length === 0) {
  console.warn('⚠️ Destination node has NO connections - pathfinding will fail!');
}
```

---

### 4. ✅ AR Waypoint Directions Not Working
**Problem:** AR navigation screen showed incorrect or no waypoint directions when navigating.

**Root Cause:** When `calculatedPath` was null (pathfinding failed), no fallback direction was provided.

**Files Modified:**
- `mobile-app/src/screens/ARNavigationScreen.js`

**Fix - Added fallback direct navigation:**
```javascript
useEffect(() => {
  if (calculatedPath?.coordinates && calculatedPath.coordinates.length > 0 && currentLocation) {
    // Use calculated path waypoints
    // ... existing logic
  } else if (destination && currentLocation) {
    // Fallback: direct navigation to destination
    console.log('🧭 AR: No path available, using direct navigation');
    const destCoords = destination.coordinates || destination;
    if (destCoords?.latitude && destCoords?.longitude) {
      const directDist = calculateDistance(/*...*/);
      setDistance(Math.round(directDist));
      
      // Calculate bearing and set instruction
      const bearing = calculateBearing(/*...*/);
      let direction = '';
      if (bearing >= 315 || bearing < 45) direction = 'north';
      else if (bearing >= 45 && bearing < 135) direction = 'east';
      else if (bearing >= 135 && bearing < 225) direction = 'south';
      else direction = 'west';
      
      setCurrentInstruction(`Head ${direction} towards ${destination.name} (${Math.round(directDist)}m)`);
    }
  }
}, [currentLocation, calculatedPath, destination]);
```

---

### 5. ✅ Emergency Polling Delay
**Problem:** Emergency updates took longer than 10 seconds to appear on mobile devices.

**Files Modified:**
- `mobile-app/src/services/emergencyService.js`

**Fix - Reduced polling interval and added timeout:**
```javascript
// BEFORE: 10 second polling
this.pollInterval = setInterval(async () => {
  await this.checkEmergencyStatus();
}, 10000);

// AFTER: 5 second polling with timeout
startPolling() {
  this.pollInterval = setInterval(async () => {
    await this.checkEmergencyStatus();
  }, 5000); // Reduced to 5 seconds
  
  console.log('🚨 Emergency polling started (every 5 seconds)');
}

// Added request timeout
async checkEmergencyStatus() {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000);
  
  const response = await fetch(`${API_BASE_URL}/emergency`, {
    signal: controller.signal,
  });
  
  clearTimeout(timeoutId);
  // ...
}

// Added force check function
async forceCheck() {
  console.log('🚨 Forcing emergency status check...');
  return await this.checkEmergencyStatus();
}
```

---

### 6. ✅ Building Search Bugs
**Problem:** Building search sometimes crashed or showed incorrect results.

**Root Cause:**
- `keyExtractor` crashed when `item.id` was undefined
- No null safety for building properties
- Distance not calculated dynamically

**Files Modified:**
- `mobile-app/src/screens/BuildingSearchScreen.js`

**Fix - Complete rewrite with improvements:**
```javascript
// Safe key extractor
keyExtractor={(item, index) => item.nodeId || item.id?.toString() || `building-${index}`}

// Dynamic distance calculation
const buildingsWithDistance = useMemo(() => {
  return buildings.map(building => {
    if (currentLocation && building.coordinates) {
      // Calculate Haversine distance
      distance = Math.round(R * c);
    }
    return { ...building, distance };
  });
}, [buildings, currentLocation]);

// Improved search filtering
const filteredBuildings = useMemo(() => {
  return buildingsWithDistance.filter(building => {
    const nameMatch = building.name?.toLowerCase().includes(query);
    const officeMatch = building.offices?.some(/*...*/);
    const descMatch = building.description?.toLowerCase().includes(query);
    const typeMatch = building.type?.toLowerCase().includes(query);
    return nameMatch || officeMatch || descMatch || typeMatch;
  });
}, [buildingsWithDistance, searchQuery]);

// Empty state handling
ListEmptyComponent={
  <View style={styles.emptyContainer}>
    <Ionicons name="search-outline" size={48} color={colors.gray[300]} />
    <Text style={styles.emptyText}>No buildings found</Text>
  </View>
}
```

---

### 7. ✅ Push Notifications Not Working
**Problem:** Push notifications weren't triggering on mobile devices.

**Root Cause:** Push notifications don't work in Expo Go for SDK 53+. This is an Expo limitation, not a bug.

**Files Modified:**
- `mobile-app/src/services/emergencyService.js`

**Fix - Better permission handling and fallback:**
```javascript
async showEmergencyNotification(emergency) {
  try {
    // Request permission first
    const { status } = await Notifications.getPermissionsAsync();
    if (status !== 'granted') {
      const { status: newStatus } = await Notifications.requestPermissionsAsync();
      if (newStatus !== 'granted') {
        console.log('Notification permission not granted');
        return;
      }
    }
    
    await Notifications.scheduleNotificationAsync({
      content: {
        title: `🚨 ${emergency.title || 'EMERGENCY ALERT'}`,
        body: emergency.message || 'An emergency has been declared on campus.',
        sound: true,
        priority: Notifications.AndroidNotificationPriority.MAX,
      },
      trigger: null,
    });
    console.log('🚨 Emergency notification shown');
  } catch (error) {
    console.log('Failed to show notification:', error.message);
  }
}
```

**Note:** For full push notification support, build a development build using EAS Build instead of using Expo Go.

---

### 8. ✅ Refresh Data Not Working Properly
**Problem:** Pressing "Refresh Data" in the menu didn't update the pathfinding graph.

**Root Cause:** Only `campusDataProvider` was being refreshed, not `campusDataService` (which handles the pathfinding graph).

**Files Modified:**
- `mobile-app/src/context/AppContext.js`

**Fix - Sync both services:**
```javascript
// BEFORE
const refreshCampusData = async () => {
  return await campusDataProvider.fetchData();
};

// AFTER
const refreshCampusData = async () => {
  console.log('📍 Manual refresh triggered...');
  try {
    // Sync pathfinding graph FIRST
    await campusDataService.syncFromServer();
    console.log('📍 Pathfinding graph synced');
    
    // Then sync building list
    const result = await campusDataProvider.fetchData();
    console.log('📍 Building data synced');
    
    return result;
  } catch (err) {
    console.log('📍 Refresh error:', err.message);
    return await campusDataProvider.fetchData();
  }
};
```

---

## Files Changed Summary

| File | Changes |
|------|---------|
| `mobile-app/src/services/apiService.js` | Updated IP address |
| `mobile-app/src/services/emergencyService.js` | Updated IP, faster polling, timeout, permission handling |
| `mobile-app/src/services/pathfindingService.js` | Enhanced node lookup (5 methods), comprehensive logging |
| `mobile-app/src/context/AppContext.js` | Fixed init order, improved refresh function |
| `mobile-app/src/screens/ARNavigationScreen.js` | Added fallback direct navigation |
| `mobile-app/src/screens/BuildingSearchScreen.js` | Complete rewrite with null safety |
| `admin-app/src/pages/CampusNodeManager.jsx` | Fixed loadNodes() to merge connections from data.connections |
| `mobile-app/src/services/campusDataService.js` | Fixed import, added cache clear, improved fallback logic |
| `mobile-app/src/services/pathfindingService.js` | Enhanced fallback to use default graph when synced is empty |

---

## 🔴 CRITICAL FIX: Node Sync Issue (December 26, 2025 - Update 2)

### Problem
Admin app and mobile app nodes were NOT synced. All connections in `campus_nodes.json` were empty arrays, causing pathfinding to always fail.

### Root Cause Analysis

**1. Data Structure Mismatch:**
The backend stores data in TWO separate objects:
```json
{
  "nodes": { "node_123": { "id": "node_123", "name": "Building A", ... } },
  "connections": { "node_123": ["node_456", "node_789"] }
}
```

**2. Admin `loadNodes()` Bug (Line 74):**
```javascript
// ❌ WRONG - reads from node object which is empty
connections: n.connections || []

// ✅ FIXED - reads from separate connections map  
connections: connectionsMap[nodeId] || n.connections || []
```

**3. Import Error in `campusDataService.js`:**
```javascript
// ❌ WRONG - campusGraph doesn't exist as an export
import { campusNodes as defaultNodes, campusGraph as defaultGraph } from '../data/campusGraph';

// ✅ FIXED - build graph from edges
import { campusNodes as defaultNodes, campusEdges, buildAdjacencyList } from '../data/campusGraph';
const defaultGraph = buildAdjacencyList(campusEdges, false);
```

**4. No Fallback for Empty Synced Data:**
When backend returned empty connections, mobile app used them instead of falling back to good default data.

### Files Fixed

**`admin-app/src/pages/CampusNodeManager.jsx`**
```javascript
// loadNodes() now properly merges connections
const loadNodes = async () => {
  // ...
  const connectionsMap = data.connections || {};  // Get separate connections map
  
  const arr = Object.values(data.nodes).map(n => {
    const nodeId = n.id || ...;
    return {
      // ...
      // CRITICAL FIX: Read from connectionsMap, not node object
      connections: connectionsMap[nodeId] || connectionsMap[n.id] || n.connections || [],
    };
  });
  console.log('Loaded nodes with connections:', arr.filter(n => n.connections.length > 0).length);
};
```

**`mobile-app/src/services/campusDataService.js`**
```javascript
// Fixed import and added cache management
import { campusNodes as defaultNodes, campusEdges, buildAdjacencyList } from '../data/campusGraph';
const defaultGraph = buildAdjacencyList(campusEdges, false);

// Added clearCache() method
async clearCache() {
  await AsyncStorage.multiRemove([STORAGE_KEY_NODES, STORAGE_KEY_GRAPH, STORAGE_KEY_LAST_SYNC]);
  this.campusNodes = { ...defaultNodes };
  this.campusGraph = { ...defaultGraph };
}

// Added useDefaults() method
useDefaults() {
  this.campusNodes = { ...defaultNodes };
  this.campusGraph = { ...defaultGraph };
}
```

**`mobile-app/src/services/pathfindingService.js`**
```javascript
// getCampusGraph() now validates synced data has actual connections
const getCampusGraph = () => {
  const syncedGraph = campusDataService.getGraph();
  
  if (syncedGraph && Object.keys(syncedGraph).length > 0) {
    // Verify at least some connections exist (not all empty arrays)
    const hasActualConnections = Object.values(syncedGraph).some(
      connections => Array.isArray(connections) && connections.length > 0
    );
    
    if (hasActualConnections) {
      return syncedGraph;
    } else {
      console.warn('⚠️ Synced graph has empty connections, falling back to default edges');
    }
  }
  
  // Fallback to default graph built from campusEdges
  return buildAdjacencyList(campusEdges, false);
};

// getCampusNodes() validates coordinates exist
const getCampusNodes = () => {
  const syncedNodes = campusDataService.getNodes();
  
  if (syncedNodes && Object.keys(syncedNodes).length > 0) {
    const hasValidNodes = Object.values(syncedNodes).some(node => 
      node?.coordinates?.latitude && node?.coordinates?.longitude
    );
    
    if (hasValidNodes) {
      return syncedNodes;
    }
  }
  
  return defaultCampusNodes;  // Fallback to local campusGraph.js
};
```

### How to Fix Connection Data

If all your connections are empty in `campus_nodes.json`, you have two options:

**Option 1: Use Default Graph (Recommended for now)**
The mobile app will automatically fall back to the local `campusGraph.js` which has pre-defined nodes and edges.

**Option 2: Recreate Connections in Admin Panel**
1. Open Admin Panel > Campus Node Manager
2. Load nodes from server
3. Re-draw connections between nodes by clicking "Connect Mode" and clicking node pairs
4. Click "Sync" to save to backend

**Option 3: Clear Mobile App Cache**
If mobile has cached empty data, clear it:
```javascript
// In the app, call:
import campusDataService from './services/campusDataService';
await campusDataService.clearCache();
```

Or restart expo with cache clear:
```powershell
npx expo start --clear
```

---

## Testing Instructions

### 1. Restart All Services
```powershell
# Terminal 1: Backend
cd backend
npm start

# Terminal 2: Admin App
cd admin-app
npm run dev

# Terminal 3: Mobile App (with cache clear!)
cd mobile-app
npx expo start --clear
```

### 2. Test Pathfinding
1. Open mobile app
2. Select any building marker
3. Check console for pathfinding logs:
   ```
   🗺️ ==================== PATHFINDING START ====================
   🗺️ Using synced nodes: 45
   🗺️ Using synced graph: 45 connections
   ✅ A* found path with 8 waypoints, 245m
   ```
4. Route should follow walkways, not cut through buildings

### 3. Test Emergency Sync
1. Open Admin Panel > Emergency Control
2. Activate an emergency
3. Mobile app should show emergency banner within 5 seconds

### 4. Test Building Search
1. Tap search bar in mobile app
2. Search for "Hall" or any building name
3. Results should show with distances
4. Tapping a result should select and navigate back to map

---

## Known Limitations

1. **Push Notifications in Expo Go**: Won't work in SDK 53+. Use polling fallback or create EAS development build.

2. **IP Changes**: When switching networks, run `.\update-ip.ps1` to update configuration.

3. **Pathfinding Accuracy**: Depends on proper node connections in Admin Panel's Campus Node Manager.

---

## Future Improvements

- [ ] Add offline pathfinding with cached graph
- [ ] Implement proper push notifications with EAS Build
- [ ] Add path smoothing with Bezier curves
- [ ] Auto-detect and prompt for IP changes

---

## Contributors
- Development Team - ARound BulSU Project
- Bulacan State University - Main Campus

**Last Updated:** December 26, 2025
