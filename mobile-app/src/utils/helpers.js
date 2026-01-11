// Utility functions for ARound BulSU

/**
 * Calculate distance between two coordinates using Haversine formula
 * @param {Object} coord1 - {latitude, longitude}
 * @param {Object} coord2 - {latitude, longitude}
 * @returns {number} Distance in meters
 */
export const calculateDistance = (coord1, coord2) => {
  if (!coord1 || !coord2) return 0;

  const R = 6371e3; // Earth's radius in meters
  const φ1 = (coord1.latitude * Math.PI) / 180;
  const φ2 = (coord2.latitude * Math.PI) / 180;
  const Δφ = ((coord2.latitude - coord1.latitude) * Math.PI) / 180;
  const Δλ = ((coord2.longitude - coord1.longitude) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
};

/**
 * Format distance for display
 * @param {number} meters - Distance in meters
 * @returns {string} Formatted distance string
 */
export const formatDistance = (meters) => {
  if (meters < 1000) {
    return `${meters}m`;
  }
  return `${(meters / 1000).toFixed(1)}km`;
};

/**
 * Calculate bearing between two points
 * @param {Object} start - {latitude, longitude}
 * @param {Object} end - {latitude, longitude}
 * @returns {number} Bearing in degrees
 */
export const calculateBearing = (start, end) => {
  const startLat = (start.latitude * Math.PI) / 180;
  const startLng = (start.longitude * Math.PI) / 180;
  const endLat = (end.latitude * Math.PI) / 180;
  const endLng = (end.longitude * Math.PI) / 180;

  const y = Math.sin(endLng - startLng) * Math.cos(endLat);
  const x =
    Math.cos(startLat) * Math.sin(endLat) -
    Math.sin(startLat) * Math.cos(endLat) * Math.cos(endLng - startLng);

  let bearing = (Math.atan2(y, x) * 180) / Math.PI;
  bearing = (bearing + 360) % 360;

  return bearing;
};

/**
 * Get compass direction from bearing
 * @param {number} bearing - Bearing in degrees
 * @returns {string} Direction (N, NE, E, etc.)
 */
export const getCompassDirection = (bearing) => {
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  const index = Math.round(bearing / 45) % 8;
  return directions[index];
};

/**
 * Generate waypoints between two points
 * @param {Object} start - {latitude, longitude}
 * @param {Object} end - {latitude, longitude}
 * @param {number} count - Number of waypoints
 * @returns {Array} Array of waypoint coordinates
 */
export const generateWaypoints = (start, end, count = 5) => {
  if (!start || !end) return [];

  const waypoints = [];
  for (let i = 1; i <= count; i++) {
    const ratio = i / (count + 1);
    waypoints.push({
      latitude: start.latitude + (end.latitude - start.latitude) * ratio,
      longitude: start.longitude + (end.longitude - start.longitude) * ratio,
    });
  }

  return waypoints;
};

/**
 * Check if a point is within campus bounds
 * @param {Object} point - {latitude, longitude}
 * @param {Object} bounds - {north, south, east, west}
 * @returns {boolean}
 */
export const isWithinBounds = (point, bounds) => {
  if (!point || !bounds) return false;

  return (
    point.latitude <= bounds.north &&
    point.latitude >= bounds.south &&
    point.longitude <= bounds.east &&
    point.longitude >= bounds.west
  );
};

/**
 * Find nearest location from a list
 * @param {Object} currentLocation - {latitude, longitude}
 * @param {Array} locations - Array of locations with coordinates
 * @returns {Object} Nearest location
 */
export const findNearestLocation = (currentLocation, locations) => {
  if (!currentLocation || !locations?.length) return null;

  let nearest = locations[0];
  let minDistance = calculateDistance(currentLocation, nearest.coordinates);

  for (const location of locations) {
    const distance = calculateDistance(currentLocation, location.coordinates);
    if (distance < minDistance) {
      minDistance = distance;
      nearest = location;
    }
  }

  return { ...nearest, distance: minDistance };
};

/**
 * Sort locations by distance from current location
 * @param {Object} currentLocation - {latitude, longitude}
 * @param {Array} locations - Array of locations with coordinates
 * @returns {Array} Sorted array with distances
 */
export const sortByDistance = (currentLocation, locations) => {
  if (!currentLocation || !locations?.length) return locations;

  return locations
    .map((location) => ({
      ...location,
      calculatedDistance: calculateDistance(currentLocation, location.coordinates),
    }))
    .sort((a, b) => a.calculatedDistance - b.calculatedDistance);
};

/**
 * Format phone number for display
 * @param {string} number - Raw phone number
 * @returns {string} Formatted number
 */
export const formatPhoneNumber = (number) => {
  // Return as-is if already formatted
  if (number.includes('-') || number.includes('(')) {
    return number;
  }
  
  // Format based on length
  if (number.length === 11 && number.startsWith('0')) {
    return `${number.slice(0, 4)}-${number.slice(4, 7)}-${number.slice(7)}`;
  }
  
  return number;
};

/**
 * Debounce function for search
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in ms
 * @returns {Function} Debounced function
 */
export const debounce = (func, wait) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
};
