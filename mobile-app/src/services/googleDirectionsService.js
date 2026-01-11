// Google Directions API Service for Campus Navigation
// This service provides walking directions using Google's road/path network
// Use this as an alternative or fallback when custom node connections are insufficient

const GOOGLE_DIRECTIONS_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_DIRECTIONS_KEY || '';

/**
 * Get walking directions from Google Directions API
 * Returns a polyline of coordinates that follow actual walkways/roads
 * 
 * @param {Object} origin - {latitude, longitude}
 * @param {Object} destination - {latitude, longitude}
 * @param {Array} waypoints - Optional intermediate points [{latitude, longitude}, ...]
 * @returns {Object} - {success, coordinates, distance, duration, polyline}
 */
export const getGoogleWalkingDirections = async (origin, destination, waypoints = []) => {
  if (!GOOGLE_DIRECTIONS_API_KEY) {
    console.warn('Google Directions API key not configured');
    return null;
  }

  try {
    const originStr = `${origin.latitude},${origin.longitude}`;
    const destStr = `${destination.latitude},${destination.longitude}`;
    
    let url = `https://maps.googleapis.com/maps/api/directions/json?origin=${originStr}&destination=${destStr}&mode=walking&key=${GOOGLE_DIRECTIONS_API_KEY}`;
    
    // Add waypoints if provided
    if (waypoints.length > 0) {
      const waypointsStr = waypoints.map(wp => `${wp.latitude},${wp.longitude}`).join('|');
      url += `&waypoints=${waypointsStr}`;
    }
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.status !== 'OK') {
      console.error('Google Directions API error:', data.status, data.error_message);
      return null;
    }
    
    const route = data.routes[0];
    const leg = route.legs[0];
    
    // Decode the polyline to get coordinates
    const coordinates = decodePolyline(route.overview_polyline.points);
    
    return {
      success: true,
      coordinates,
      distance: leg.distance.value, // in meters
      distanceText: leg.distance.text,
      duration: Math.ceil(leg.duration.value / 60), // in minutes
      durationText: leg.duration.text,
      steps: leg.steps.map(step => ({
        instruction: step.html_instructions.replace(/<[^>]*>/g, ''), // Strip HTML
        distance: step.distance.text,
        duration: step.duration.text,
        startLocation: {
          latitude: step.start_location.lat,
          longitude: step.start_location.lng
        },
        endLocation: {
          latitude: step.end_location.lat,
          longitude: step.end_location.lng
        }
      })),
      polyline: route.overview_polyline.points
    };
  } catch (error) {
    console.error('Error fetching Google directions:', error);
    return null;
  }
};

/**
 * Decode Google's encoded polyline format to array of coordinates
 * @param {string} encoded - Encoded polyline string
 * @returns {Array} - Array of {latitude, longitude}
 */
const decodePolyline = (encoded) => {
  const coordinates = [];
  let index = 0;
  let lat = 0;
  let lng = 0;

  while (index < encoded.length) {
    let shift = 0;
    let result = 0;
    let byte;

    // Decode latitude
    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);
    
    const deltaLat = (result & 1) ? ~(result >> 1) : (result >> 1);
    lat += deltaLat;

    // Decode longitude
    shift = 0;
    result = 0;
    
    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);
    
    const deltaLng = (result & 1) ? ~(result >> 1) : (result >> 1);
    lng += deltaLng;

    coordinates.push({
      latitude: lat / 1e5,
      longitude: lng / 1e5
    });
  }

  return coordinates;
};

/**
 * Hybrid navigation - tries custom nodes first, falls back to Google Directions
 * @param {Object} origin - User's current location
 * @param {Object} destination - Target building/location
 * @param {Function} customPathfinder - Your A-star or Dijkstra pathfinding function
 */
export const getHybridDirections = async (origin, destination, customPathfinder) => {
  // First try custom pathfinding
  const customResult = customPathfinder(origin, destination);
  
  if (customResult && customResult.success && customResult.coordinates.length > 2) {
    console.log('Using custom pathfinding');
    return {
      ...customResult,
      source: 'custom'
    };
  }
  
  // Fall back to Google Directions
  console.log('Falling back to Google Directions');
  const googleResult = await getGoogleWalkingDirections(origin, destination);
  
  if (googleResult) {
    return {
      ...googleResult,
      source: 'google'
    };
  }
  
  // Last resort: direct line
  return {
    success: true,
    coordinates: [
      { latitude: origin.latitude, longitude: origin.longitude },
      { latitude: destination.latitude, longitude: destination.longitude }
    ],
    distance: calculateDirectDistance(origin, destination),
    duration: Math.ceil(calculateDirectDistance(origin, destination) / 1.4 / 60),
    source: 'direct'
  };
};

// Calculate direct distance between two points (Haversine formula)
const calculateDirectDistance = (point1, point2) => {
  const R = 6371000; // Earth radius in meters
  const dLat = (point2.latitude - point1.latitude) * Math.PI / 180;
  const dLon = (point2.longitude - point1.longitude) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(point1.latitude * Math.PI / 180) * Math.cos(point2.latitude * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

export default {
  getGoogleWalkingDirections,
  getHybridDirections,
  decodePolyline
};
