# Campus Node Placement Guide for Accurate Navigation

## Overview

This guide explains how to properly place and connect nodes in the **Campus Nodes (A*)** manager to ensure navigation routes follow actual walkways instead of cutting through buildings.

---

## Why Routes Cut Through Buildings

The navigation system uses **A* pathfinding algorithm** which finds paths **only through connected nodes**. If nodes are not properly connected, the system falls back to drawing a **direct line** from start to destination.

### Current Issue
Looking at your `campus_nodes.json`, most nodes have **empty connection arrays** `[]`:
```json
"connections": {
  "node_1766027517126": [],  // Main Gate - NOT connected!
  "node_1766027558716": ["node_1766467675452"],  // Alvarado Hall - only 1 connection
  "node_1766027650192": [],  // Activity Center - NOT connected!
  ...
}
```

---

## Node Placement Strategy

### Option 1: Fewer Nodes with More Connections (RECOMMENDED)

Place nodes at **key decision points** and connect them along walkways:

```
🔴 Gate → 🟡 Intersection → 🟡 Intersection → 🔵 Building
              ↓
         🟡 Intersection → 🔵 Another Building
```

**Advantages:**
- Fewer nodes to manage
- Easier to visualize connections
- Faster pathfinding computation

**Where to place nodes:**
1. **Gates/Entrances** (green) - Campus entry/exit points
2. **Intersections** (orange) - Where walkways meet/split
3. **Building Entrances** (blue) - Entry points to buildings
4. **Evacuation Areas** (red) - Emergency gathering points

### Option 2: Many Nodes Along Walkways

Place nodes **every few meters** along walkways (like your current approach), but you MUST connect them sequentially:

```
🟠 → 🟠 → 🟠 → 🟠 → 🟠 → 🔵 Building
```

**This requires:**
- Connecting EVERY adjacent node
- More time-consuming to set up
- Better path accuracy along curved walkways

---

## How to Connect Nodes in Admin Panel

### Step-by-Step Connection Process:

1. **Click on a node** to select it (it should highlight)
2. **Click "Connect"** button (or the connect tool)
3. **Click on another node** to create a bidirectional connection
4. **Repeat** for all adjacent nodes along walkways

### Connection Rules:

✅ **DO connect:**
- Adjacent nodes along a straight walkway
- Nodes at T-intersections to ALL branches
- Building entrances to the nearest walkway node
- Gates to the nearest walkway/intersection

❌ **DON'T connect:**
- Nodes that would require walking through a building
- Nodes on opposite sides of a building without going around
- Non-adjacent nodes (skip connections)

---

## Recommended Node Layout for BulSU Campus

Based on your map, here's a suggested layout:

### Main Spine (Gate to Gate):
```
Main Gate (node_1766027517126)
    ↓
Intersection near Alvarado Hall
    ↓
Central Intersection (near monument)
    ↓
Intersection near Roxas Hall
    ↓
Gate 2 (node_1766027927626)
```

### Branch Connections:
```
Central Intersection
    ├→ E-Library branch
    ├→ College of HE branch  
    ├→ Activity Center branch
    └→ Carpio Hall branch

Each branch:
Intersection → Walkway nodes → Building Entrance
```

---

## Minimum Required Connections

For navigation to work, ensure these are connected:

### 1. All Gates Connected to the Network
```javascript
// Main Gate should connect to nearest intersection
"node_1766027517126": ["node_nearest_intersection"]
```

### 2. All Building Entrances Connected
```javascript
// Each building entrance needs at least 1 connection to a walkway/intersection
"node_1766027558716": ["node_walkway_nearby"]  // Alvarado Hall
```

### 3. Intersections Connected to All Branches
```javascript
// A 4-way intersection needs 4 connections
"node_intersection": ["node_north", "node_south", "node_east", "node_west"]
```

---

## Quick Fix: Auto-Connect Nearby Nodes

If you have many unconnected nodes, you can add auto-connection logic. Here's a script to help:

### In Admin Panel - Add Auto-Connect Feature

Add this button to `CampusNodeManager.jsx` to automatically connect nearby nodes:

```jsx
const autoConnectNearbyNodes = (maxDistance = 30) => {
  // maxDistance in meters
  const newNodes = [...nodes];
  
  nodes.forEach((node, i) => {
    nodes.forEach((otherNode, j) => {
      if (i >= j) return; // Skip self and already-checked pairs
      
      // Calculate distance between nodes
      const dist = getDistanceMeters(
        node.latitude, node.longitude,
        otherNode.latitude, otherNode.longitude
      );
      
      // If within maxDistance, connect them
      if (dist <= maxDistance) {
        // Add bidirectional connection
        if (!newNodes[i].connections.includes(otherNode.id)) {
          newNodes[i].connections.push(otherNode.id);
        }
        if (!newNodes[j].connections.includes(node.id)) {
          newNodes[j].connections.push(node.id);
        }
      }
    });
  });
  
  setNodes(newNodes);
  showStatus(`Auto-connected nodes within ${maxDistance}m`);
};

// Haversine formula for distance
const getDistanceMeters = (lat1, lon1, lat2, lon2) => {
  const R = 6371000; // Earth radius in meters
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};
```

---

## Testing Your Node Network

### 1. Visual Test in Admin Panel
- View the map with connections shown as lines
- Verify there's a continuous path from every gate to every building

### 2. Console Test
In mobile app, check the console logs:
```
Path found: 245m, ~3 min  ← SUCCESS
No path found from X to Y  ← MISSING CONNECTIONS
```

### 3. Check for Isolated Nodes
A node is isolated if it has NO connections:
```json
"node_xxx": []  // This node can never be reached!
```

---

## Summary Checklist

Before your navigation works correctly:

- [ ] Every gate has at least 1 connection
- [ ] Every building entrance has at least 1 connection  
- [ ] Every intersection connects to ALL adjacent paths
- [ ] Walkway nodes are connected in sequence
- [ ] No node has empty connections `[]` (except if intentionally isolated)
- [ ] Connections follow actual walkways, not through buildings

---

## Alternative: Google Directions API

If manual node placement is too tedious, you can use Google Directions API for outdoor navigation. See `GOOGLE_DIRECTIONS_INTEGRATION.md` for implementation details.
