# ARound BulSU - Development Changelog & Technical Documentation

> **Project:** AR-based Campus Navigation App for Bulacan State University  
> **Last Updated:** December 26, 2025  
> **Version:** 1.2.0

---

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [System Architecture](#system-architecture)
3. [Key Features Implemented](#key-features-implemented)
4. [Recent Changes & Updates](#recent-changes--updates)
5. [File Structure](#file-structure)
6. [API Documentation](#api-documentation)
7. [How Data Sync Works](#how-data-sync-works)
8. [Troubleshooting Guide](#troubleshooting-guide)

---

## 🆕 Latest Updates (December 26, 2025)

### Bug Fixes in v1.2.0
- ✅ Fixed pathfinding routes cutting through buildings
- ✅ Fixed "No path found" errors with enhanced node lookup
- ✅ Fixed AR waypoint directions with fallback navigation
- ✅ Reduced emergency polling delay (10s → 5s)
- ✅ Fixed building search crashes and improved filtering
- ✅ Fixed push notification permission handling
- ✅ Fixed "Refresh Data" to sync both buildings and pathfinding graph

**Full details:** See [BUG_FIXES_DEC26_2025.md](./BUG_FIXES_DEC26_2025.md)

---

## 🎯 Project Overview

ARound BulSU is a mobile navigation application that helps students, faculty, and visitors navigate the Bulacan State University campus using:

- **Augmented Reality (AR)** - Visual overlays showing directions
- **A* Pathfinding Algorithm** - Optimal route calculation for daily navigation
- **Dijkstra Algorithm** - Shortest path for emergency evacuations
- **Real-time Sync** - Admin-managed campus nodes synced to mobile app

### Technology Stack

| Component | Technology |
|-----------|------------|
| Mobile App | React Native + Expo SDK 54 |
| Admin App | React 18 + Vite + Tailwind CSS |
| Backend | Node.js + Express |
| Maps (Mobile) | react-native-maps (Google Maps) |
| Maps (Admin) | Mapbox GL JS |
| AR | expo-camera + custom AR overlays |

---

## 🏗️ System Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Admin App     │────▶│  Backend API    │◀────│   Mobile App    │
│   (React)       │     │  (Express)      │     │  (React Native) │
│                 │     │                 │     │                 │
│ • Node Manager  │     │ • /api/campus-  │     │ • Navigation    │
│ • Mapbox Maps   │     │   nodes         │     │ • AR View       │
│ • Connections   │     │ • /api/buildings│     │ • Emergency     │
└─────────────────┘     │ • /api/emergency│     └─────────────────┘
                        └─────────────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │  campus_nodes.json  │
                    │  (Data Storage)     │
                    └─────────────────────┘
```

---

## ✨ Key Features Implemented

### 1. Campus Node Manager (Admin App)
- **Visual node placement** using Mapbox satellite view
- **Node types:** Gate, Building Entrance, Path, Intersection, Evacuation
- **Connection creation** - Click nodes to create walking paths
- **Sync to backend** - Save nodes for mobile app to use

### 2. Dynamic Data Sync (Mobile App)
- Fetches campus nodes from backend API
- Falls back to cached/default data when offline
- Auto-refreshes every 5 minutes

### 3. A* Pathfinding
- Calculates optimal walking routes
- Uses heuristics for faster computation
- Supports accessibility options (avoid stairs, prefer covered paths)

### 4. Emergency Mode
- Dijkstra algorithm for guaranteed shortest evacuation path
- Real-time emergency alerts from admin
- Auto-navigation to nearest evacuation point

---

## 🔄 Recent Changes & Updates

### December 18, 2025

#### 1. Fixed API Base URL Issue
**Problem:** Mobile app couldn't connect to backend - wrong IP address  
**File:** `mobile-app/src/services/apiService.js`

```javascript
// BEFORE (wrong IP)
const API_BASE_URL = 'http://10.255.233.117:3001/api';

// AFTER (correct IP)
const API_BASE_URL = 'http://192.168.100.188:3001/api';
```

**Note:** IP changes when network changes. Run `ipconfig` to get current IP.

---

#### 2. Added Campus Data Sync from Admin to Mobile
**Problem:** Mobile app used hardcoded building data, not synced with admin  
**Files Modified:**
- `mobile-app/src/services/campusDataProvider.js`
- `mobile-app/src/context/AppContext.js`

**What Changed:**
```javascript
// campusDataProvider.js - Now fetches from /api/campus-nodes
async fetchData() {
  const [campusNodesData, campusData] = await Promise.all([
    apiService.getCampusNodes(),  // NEW: Fetch admin nodes
    apiService.getCampusData(),
  ]);
  
  // Convert admin nodes to buildings format
  const buildingsFromNodes = this.convertNodesToBuildings(campusNodesData.nodes);
  this.buildings = buildingsFromNodes;
}
```

**How it works:**
1. Admin places nodes in Campus Node Manager
2. Admin clicks "Sync" to save to backend
3. Mobile app fetches nodes on startup
4. Nodes are converted to buildings for display

---

#### 3. Fixed "Could not find start or destination node" Error
**Problem:** Pathfinding couldn't match building IDs  
**File:** `mobile-app/src/services/pathfindingService.js`

**What Changed:**
```javascript
// BEFORE - Only looked for buildingId
const buildingNode = Object.values(campusNodes).find(
  node => node.buildingId === buildingId
);

// AFTER - Multiple lookup methods
export const navigateToBuilding = (currentLocation, buildingIdOrNodeId, options = {}) => {
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
  
  // Method 3: Name-based lookup
  if (!buildingNode) {
    buildingNode = Object.values(campusNodes).find(
      node => node.name?.toLowerCase() === buildingIdOrNodeId?.toLowerCase()
    );
  }
};
```

---

#### 4. Fixed "Cannot read property 'latitude' of undefined" Error
**Problem:** App crashed when clicking markers with missing coordinates  
**File:** `mobile-app/src/screens/NavigateScreen.js`

**Changes Made:**

**a) Safe coordinate access in handleBuildingSelect:**
```javascript
const handleBuildingSelect = (building) => {
  // ADDED: Safety check for coordinates
  const buildingLat = building?.coordinates?.latitude || building?.latitude || 0;
  const buildingLng = building?.coordinates?.longitude || building?.longitude || 0;
  
  if (!buildingLat || !buildingLng) {
    console.warn('Building has invalid coordinates:', building);
    return;
  }
  // ... rest of function
};
```

**b) Filter invalid markers before rendering:**
```javascript
{(buildings || [])
  .filter(building => {
    const lat = building?.coordinates?.latitude || building?.latitude;
    const lng = building?.coordinates?.longitude || building?.longitude;
    return lat && lng && !isNaN(lat) && !isNaN(lng);
  })
  .map((building) => (
    <Marker ... />
  ))}
```

---

#### 5. Added Campus Node Connections
**Problem:** Pathfinding returned null because nodes had no connections  
**File:** `backend/data/campus_nodes.json`

**Before:** All connections were empty arrays `[]`  
**After:** Added logical walking paths between buildings

```json
{
  "connections": {
    "node_main_gate": ["node_alvarado", "node_activity_center"],
    "node_alvarado": ["node_main_gate", "node_carpio", "node_college_he"],
    // ... more connections
  }
}
```

**Connection Map:**
```
Main Gate ─── Alvarado Hall ─── College of HE ─── CSSP ─── Gate 4
    │              │                  │              │
    └── Activity Center ─── Carpio Hall ─── Fedirizo Hall
              │                  │              │
         Pimentel Hall     Natividad Hall ── Flores Hall ── Valencia Hall ── Gate 3
              │                  │
           Gate 2 ─── Roxas Hall
```

---

#### 6. Created Dynamic getNearestNode Function
**Problem:** Static function only used hardcoded nodes  
**File:** `mobile-app/src/services/pathfindingService.js`

```javascript
// NEW: Dynamic function that uses synced nodes
const getNearestNode = (latitude, longitude) => {
  const nodes = getCampusNodes(); // Gets synced or default nodes
  let nearestNode = null;
  let minDistance = Infinity;
  
  Object.values(nodes).forEach(node => {
    if (!node?.coordinates?.latitude || !node?.coordinates?.longitude) return;
    
    const distance = calculateDistance(
      latitude, longitude,
      node.coordinates.latitude, node.coordinates.longitude
    );
    if (distance < minDistance) {
      minDistance = distance;
      nearestNode = node;
    }
  });
  
  return nearestNode;
};
```

---

#### 7. Initialized campusDataService in AppContext
**Problem:** Campus data service was created but never initialized  
**File:** `mobile-app/src/context/AppContext.js`

```javascript
import campusDataService from '../services/campusDataService';

useEffect(() => {
  // ... existing code ...

  // NEW: Initialize campus nodes sync service
  campusDataService.initialize().then(() => {
    console.log('📍 Campus node data service initialized');
  });

  // NEW: Periodic refresh (every 5 minutes)
  const refreshInterval = setInterval(() => {
    campusDataProvider.fetchData();
    campusDataService.syncFromServer();
  }, 5 * 60 * 1000);
}, []);
```

---

## 📁 File Structure

```
ARound BulSu/
├── mobile-app/                 # React Native Mobile Application
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   ├── context/            # React Context providers
│   │   │   └── AppContext.js   # Main app state management
│   │   ├── data/               # Static data files
│   │   │   ├── campusData.js   # Default building data
│   │   │   └── campusGraph.js  # Default navigation graph
│   │   ├── screens/            # App screens
│   │   │   ├── NavigateScreen.js
│   │   │   ├── ARNavigationScreen.js
│   │   │   └── ...
│   │   ├── services/           # Business logic services
│   │   │   ├── apiService.js         # Backend API calls
│   │   │   ├── campusDataProvider.js # Campus data management
│   │   │   ├── campusDataService.js  # Node sync service
│   │   │   ├── pathfindingService.js # A* and Dijkstra algorithms
│   │   │   └── emergencyService.js   # Emergency handling
│   │   └── constants/          # Theme, colors, config
│   └── App.js                  # App entry point
│
├── admin-app/                  # React Admin Dashboard
│   ├── src/
│   │   ├── pages/
│   │   │   ├── CampusNodeManager.jsx  # Mapbox node editor
│   │   │   ├── Dashboard.jsx
│   │   │   └── ...
│   │   └── context/
│   └── package.json
│
├── backend/                    # Express.js API Server
│   ├── server.js               # Main server file
│   ├── data/
│   │   ├── campus_nodes.json   # Navigation nodes (synced)
│   │   ├── campus_data.json    # Building details
│   │   └── emergency_status.json
│   └── package.json
│
└── flowchart/                  # Documentation diagrams
```

---

## 🔌 API Documentation

### Base URL
```
http://<YOUR_IP>:3001/api
```

### Endpoints

#### GET /api/campus-nodes
Returns all navigation nodes and connections.

**Response:**
```json
{
  "nodes": {
    "node_123": {
      "id": "node_123",
      "name": "Main Gate",
      "type": "gate",
      "coordinates": { "latitude": 14.857, "longitude": 120.812 },
      "description": "Main entrance"
    }
  },
  "connections": {
    "node_123": ["node_456", "node_789"]
  },
  "lastUpdated": "2025-12-18T04:15:25.960Z"
}
```

#### POST /api/campus-nodes
Save nodes and connections from admin app.

**Request Body:**
```json
{
  "nodes": { ... },
  "connections": { ... }
}
```

#### GET /api/health
Health check endpoint.

---

## 🔄 How Data Sync Works

### Sync Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        ADMIN APP                                 │
├─────────────────────────────────────────────────────────────────┤
│  1. Admin opens Campus Node Manager                             │
│  2. Clicks on map to place nodes (buildings, gates, paths)      │
│  3. Selects nodes and clicks "Connect" to create paths          │
│  4. Clicks "Sync" button                                        │
│                         │                                        │
│                         ▼                                        │
│              POST /api/campus-nodes                              │
│              { nodes: {...}, connections: {...} }                │
└─────────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                       BACKEND SERVER                             │
├─────────────────────────────────────────────────────────────────┤
│  5. Receives POST request                                       │
│  6. Saves to backend/data/campus_nodes.json                     │
│  7. Returns success response                                    │
└─────────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                       MOBILE APP                                 │
├─────────────────────────────────────────────────────────────────┤
│  8. On app start: campusDataService.initialize()                │
│  9. Fetches GET /api/campus-nodes                               │
│  10. campusDataProvider converts nodes to buildings             │
│  11. AppContext updates buildings state                         │
│  12. NavigateScreen re-renders with new markers                 │
│  13. pathfindingService uses new nodes for A*                   │
│                                                                  │
│  Auto-refresh every 5 minutes                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔧 Troubleshooting Guide

### Common Issues & Solutions

#### 1. "Network request failed" on mobile
**Cause:** Wrong API IP address  
**Solution:**
1. Run `ipconfig` on your computer
2. Find IPv4 Address (e.g., `192.168.100.188`)
3. Update `mobile-app/src/services/apiService.js`:
   ```javascript
   const API_BASE_URL = 'http://YOUR_IP:3001/api';
   ```

#### 2. Markers not showing on map
**Cause:** Buildings have invalid coordinates  
**Solution:** Check console for warnings about invalid coordinates

#### 3. "Could not find start or destination node"
**Cause:** Node IDs don't match between building and graph  
**Solution:** Use the Admin app to sync nodes, ensure they have proper IDs

#### 4. Pathfinding returns null
**Cause:** No connections between nodes  
**Solution:** In Admin → Campus Node Manager, create connections between nodes

#### 5. Backend server won't start (EADDRINUSE)
**Cause:** Port 3001 already in use  
**Solution:**
```powershell
# Find and kill process using port 3001
netstat -ano | findstr :3001
taskkill /PID <PID> /F
```

---

## 👥 Development Team

- **Project:** ARound BulSU
- **Institution:** Bulacan State University
- **Purpose:** Thesis Project - AR Campus Navigation

---

## 📝 Notes for Future Development

1. **IP Address Management:** Consider using environment variables or a config file for the API URL
2. **Offline Mode:** Implement better caching for fully offline navigation
3. **Connection Auto-Generation:** Add feature to auto-connect nearby nodes
4. **Building Photos:** Allow admin to upload building images
5. **Indoor Navigation:** Expand to indoor floor plans

---

*Document generated as part of development documentation for ARound BulSU thesis project.*
