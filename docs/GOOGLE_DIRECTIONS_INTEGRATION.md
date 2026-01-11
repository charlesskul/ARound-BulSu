# Google Directions API Integration Guide

## Overview

This guide explains how to integrate Google Directions API as an alternative or fallback for campus navigation when custom node-based pathfinding doesn't provide accurate routes.

---

## When to Use Google Directions API

### Use Custom Nodes (A* Algorithm) for:
- Indoor campus areas where Google Maps lacks detail
- Custom walkways not in Google's database
- Precise building-to-building routes
- Areas with custom accessibility paths

### Use Google Directions API for:
- Routes from outside campus to inside
- Long distances across campus
- When custom nodes are not properly connected
- As a fallback when A* pathfinding fails

---

## Setup Instructions

### 1. Get a Google Cloud API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing
3. Enable the **Directions API**
4. Create credentials → API Key
5. (Recommended) Restrict the API key to your app's bundle ID

### 2. Add API Key to Your App

In your mobile app's environment, add:

```bash
# In .env or app.config.js
EXPO_PUBLIC_GOOGLE_DIRECTIONS_KEY=your_api_key_here
```

Or in `app.json`:
```json
{
  "expo": {
    "extra": {
      "googleDirectionsKey": "your_api_key_here"
    }
  }
}
```

### 3. Import and Use the Service

```javascript
import { 
  getGoogleWalkingDirections, 
  getHybridDirections 
} from '../services/googleDirectionsService';

// Option 1: Google Directions only
const route = await getGoogleWalkingDirections(
  { latitude: 14.8578, longitude: 120.8134 }, // origin
  { latitude: 14.8582, longitude: 120.8140 }  // destination
);

// Option 2: Hybrid (tries custom first, falls back to Google)
const route = await getHybridDirections(
  currentLocation,
  selectedBuilding.coordinates,
  (origin, dest) => navigateToBuilding(origin, dest.id)
);
```

---

## API Response Format

### Google Directions Response
```javascript
{
  success: true,
  coordinates: [
    { latitude: 14.8578, longitude: 120.8134 },
    { latitude: 14.8579, longitude: 120.8135 },
    // ... more points along the actual walkway
  ],
  distance: 245,           // meters
  distanceText: "245 m",
  duration: 3,             // minutes
  durationText: "3 mins",
  steps: [
    {
      instruction: "Head north toward Alvarado Hall",
      distance: "50 m",
      duration: "1 min"
    },
    // ... more turn-by-turn instructions
  ],
  source: 'google'
}
```

### Hybrid Navigation Response
```javascript
{
  // Same structure as above, plus:
  source: 'custom' | 'google' | 'direct'
}
```

---

## Integration with NavigateScreen

Modify `NavigateScreen.js` to use hybrid directions:

```javascript
import { getHybridDirections } from '../services/googleDirectionsService';

const handleBuildingSelect = async (building) => {
  setSelectedBuilding(building);
  setShowBuildingPreview(true);
  
  if (currentLocation) {
    // Try hybrid approach
    const result = await getHybridDirections(
      currentLocation,
      building.coordinates || { latitude: building.latitude, longitude: building.longitude },
      (origin, dest) => navigateToBuilding(origin, building.nodeId || building.id)
    );
    
    if (result) {
      setPathResult({
        ...result,
        path: result.coordinates.map((coord, i) => `waypoint_${i}`),
        totalDistance: result.distance,
        estimatedTime: result.duration
      });
      console.log(`Path found via ${result.source}: ${result.distance}m`);
    }
  }
};
```

---

## Cost Considerations

Google Directions API pricing:
- **$5 per 1,000 requests** (as of 2024)
- Free tier: $200/month credit ≈ 40,000 requests

### Optimization Tips:
1. Cache routes that don't change frequently
2. Use custom nodes for short distances
3. Only call Google API when necessary
4. Implement request throttling

---

## Caching Strategy

```javascript
// Simple in-memory cache
const routeCache = new Map();

const getCachedRoute = async (origin, destination) => {
  const cacheKey = `${origin.latitude.toFixed(4)},${origin.longitude.toFixed(4)}-${destination.latitude.toFixed(4)},${destination.longitude.toFixed(4)}`;
  
  if (routeCache.has(cacheKey)) {
    const cached = routeCache.get(cacheKey);
    if (Date.now() - cached.timestamp < 3600000) { // 1 hour cache
      return cached.data;
    }
  }
  
  const result = await getGoogleWalkingDirections(origin, destination);
  if (result) {
    routeCache.set(cacheKey, { data: result, timestamp: Date.now() });
  }
  return result;
};
```

---

## Troubleshooting

### "REQUEST_DENIED" Error
- Check API key is valid
- Ensure Directions API is enabled
- Check billing is set up

### No route found
- Points may be too far from roads
- Google doesn't have walking data for that area
- Try adding waypoints near roads

### Route cuts through buildings
- Google Maps may not have campus walkway data
- Use custom nodes for campus-internal navigation
- Report missing paths to Google Maps

---

## Recommended Approach for ARound BulSU

1. **Primary**: Use custom A* pathfinding with properly connected nodes
2. **Fallback**: Use Google Directions when:
   - No path found via custom nodes
   - User is coming from outside campus
   - Route is >500m (cross-campus)

3. **Visual indicator**: Show route source to users
   ```
   🟢 Campus route (optimized for walkways)
   🔵 Google Maps route
   ```
