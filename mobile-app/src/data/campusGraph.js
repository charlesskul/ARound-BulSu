// Campus Graph Data for BulSU Main Campus, Malolos, Bulacan
// This defines all walkable paths, intersections, and connections for pathfinding
// Campus center: approximately 14.8524° N, 120.8147° E

/**
 * Node Types:
 * - 'building': Building entrance/exit points
 * - 'intersection': Path intersections
 * - 'waypoint': Points along paths
 * - 'gate': Campus entry/exit gates
 * - 'evacuation': Safe evacuation areas
 */

// ==================== CAMPUS NODES ====================
// Each node represents a walkable point on campus
export const campusNodes = {
  // ============ GATES ============
  'gate_main': {
    id: 'gate_main',
    name: 'Main Gate',
    type: 'gate',
    coordinates: { latitude: 14.85120, longitude: 120.81450 },
    isEvacuationPoint: true,
    description: 'Main entrance/exit of BulSU'
  },
  'gate_back': {
    id: 'gate_back',
    name: 'Back Gate',
    type: 'gate',
    coordinates: { latitude: 14.85420, longitude: 120.81280 },
    isEvacuationPoint: true,
    description: 'Back entrance near athletic field'
  },
  'gate_side': {
    id: 'gate_side',
    name: 'Side Gate',
    type: 'gate',
    coordinates: { latitude: 14.85300, longitude: 120.81600 },
    isEvacuationPoint: true,
    description: 'Side entrance'
  },

  // ============ MAIN INTERSECTIONS ============
  'int_main_entrance': {
    id: 'int_main_entrance',
    name: 'Main Entrance Plaza',
    type: 'intersection',
    coordinates: { latitude: 14.85150, longitude: 120.81460 },
    description: 'Plaza area after main gate'
  },
  'int_pimentel_front': {
    id: 'int_pimentel_front',
    name: 'Pimentel Hall Front',
    type: 'intersection',
    coordinates: { latitude: 14.85190, longitude: 120.81490 },
    description: 'In front of Pimentel Hall'
  },
  'int_central_quad': {
    id: 'int_central_quad',
    name: 'Central Quadrangle',
    type: 'intersection',
    coordinates: { latitude: 14.85240, longitude: 120.81470 },
    isEvacuationPoint: true,
    description: 'Central open area - primary evacuation zone'
  },
  'int_roxas_junction': {
    id: 'int_roxas_junction',
    name: 'Roxas Hall Junction',
    type: 'intersection',
    coordinates: { latitude: 14.85270, longitude: 120.81430 },
    description: 'Junction near Roxas Hall'
  },
  'int_engineering_plaza': {
    id: 'int_engineering_plaza',
    name: 'Engineering Plaza',
    type: 'intersection',
    coordinates: { latitude: 14.85300, longitude: 120.81400 },
    isEvacuationPoint: true,
    description: 'Open area near engineering buildings'
  },
  'int_carpio_front': {
    id: 'int_carpio_front',
    name: 'Carpio Hall Front',
    type: 'intersection',
    coordinates: { latitude: 14.85310, longitude: 120.81460 },
    description: 'In front of Carpio Hall'
  },
  'int_chtm_area': {
    id: 'int_chtm_area',
    name: 'CHTM Area',
    type: 'intersection',
    coordinates: { latitude: 14.85340, longitude: 120.81500 },
    description: 'Area near CHTM building'
  },
  'int_library_front': {
    id: 'int_library_front',
    name: 'Library Front',
    type: 'intersection',
    coordinates: { latitude: 14.85280, longitude: 120.81520 },
    description: 'In front of University Library'
  },
  'int_gym_area': {
    id: 'int_gym_area',
    name: 'Gymnasium Area',
    type: 'intersection',
    coordinates: { latitude: 14.85220, longitude: 120.81560 },
    description: 'Near the gymnasium'
  },
  'int_athletic_field': {
    id: 'int_athletic_field',
    name: 'Athletic Field Entrance',
    type: 'intersection',
    coordinates: { latitude: 14.85380, longitude: 120.81330 },
    isEvacuationPoint: true,
    description: 'Entrance to athletic field - evacuation area'
  },
  'int_science_area': {
    id: 'int_science_area',
    name: 'Science Building Area',
    type: 'intersection',
    coordinates: { latitude: 14.85250, longitude: 120.81390 },
    description: 'Near Federizo Hall'
  },
  'int_chapel_area': {
    id: 'int_chapel_area',
    name: 'Chapel Area',
    type: 'intersection',
    coordinates: { latitude: 14.85200, longitude: 120.81420 },
    description: 'Near the university chapel'
  },
  'int_canteen': {
    id: 'int_canteen',
    name: 'Canteen Junction',
    type: 'intersection',
    coordinates: { latitude: 14.85160, longitude: 120.81530 },
    description: 'Near the university canteen'
  },

  // ============ BUILDING ENTRANCES ============
  'bldg_pimentel': {
    id: 'bldg_pimentel',
    name: 'Pimentel Hall Entrance',
    type: 'building',
    buildingId: 1,
    coordinates: { latitude: 14.85205, longitude: 120.81505 },
    description: 'Main administrative building entrance'
  },
  'bldg_roxas': {
    id: 'bldg_roxas',
    name: 'Roxas Hall Entrance',
    type: 'building',
    buildingId: 2,
    coordinates: { latitude: 14.85285, longitude: 120.81420 },
    description: 'College of Engineering entrance'
  },
  'bldg_alvarado': {
    id: 'bldg_alvarado',
    name: 'Alvarado Hall Entrance',
    type: 'building',
    buildingId: 3,
    coordinates: { latitude: 14.85245, longitude: 120.81480 },
    description: 'College of Education entrance'
  },
  'bldg_natividad': {
    id: 'bldg_natividad',
    name: 'Natividad Hall Entrance',
    type: 'building',
    buildingId: 4,
    coordinates: { latitude: 14.85180, longitude: 120.81530 },
    description: 'College of Nursing entrance'
  },
  'bldg_carpio': {
    id: 'bldg_carpio',
    name: 'Carpio Hall Entrance',
    type: 'building',
    buildingId: 5,
    coordinates: { latitude: 14.85320, longitude: 120.81450 },
    description: 'College of Business Administration entrance'
  },
  'bldg_federizo': {
    id: 'bldg_federizo',
    name: 'Federizo Hall Entrance',
    type: 'building',
    buildingId: 6,
    coordinates: { latitude: 14.85260, longitude: 120.81380 },
    description: 'College of Science entrance'
  },
  'bldg_chtm': {
    id: 'bldg_chtm',
    name: 'CHTM Building Entrance',
    type: 'building',
    buildingId: 7,
    coordinates: { latitude: 14.85355, longitude: 120.81490 },
    description: 'College of Hospitality and Tourism Management entrance'
  },
  'bldg_gymnasium': {
    id: 'bldg_gymnasium',
    name: 'Gymnasium Entrance',
    type: 'building',
    buildingId: 8,
    coordinates: { latitude: 14.85210, longitude: 120.81580 },
    description: 'University Gymnasium entrance'
  },
  'bldg_library': {
    id: 'bldg_library',
    name: 'University Library Entrance',
    type: 'building',
    buildingId: 9,
    coordinates: { latitude: 14.85290, longitude: 120.81540 },
    description: 'University Library entrance'
  },
  'bldg_cict': {
    id: 'bldg_cict',
    name: 'CICT Building Entrance',
    type: 'building',
    buildingId: 10,
    coordinates: { latitude: 14.85150, longitude: 120.81580 },
    description: 'College of ICT entrance'
  },
  'bldg_chapel': {
    id: 'bldg_chapel',
    name: 'University Chapel Entrance',
    type: 'building',
    buildingId: 11,
    coordinates: { latitude: 14.85190, longitude: 120.81410 },
    description: 'University Chapel entrance'
  },
  'bldg_student_center': {
    id: 'bldg_student_center',
    name: 'Student Center Entrance',
    type: 'building',
    buildingId: 12,
    coordinates: { latitude: 14.85230, longitude: 120.81550 },
    description: 'Student Center entrance'
  },

  // ============ WAYPOINTS (Path segments) ============
  'wp_main_path_1': {
    id: 'wp_main_path_1',
    name: 'Main Path 1',
    type: 'waypoint',
    coordinates: { latitude: 14.85170, longitude: 120.81475 }
  },
  'wp_main_path_2': {
    id: 'wp_main_path_2',
    name: 'Main Path 2',
    type: 'waypoint',
    coordinates: { latitude: 14.85210, longitude: 120.81485 }
  },
  'wp_east_path_1': {
    id: 'wp_east_path_1',
    name: 'East Path 1',
    type: 'waypoint',
    coordinates: { latitude: 14.85180, longitude: 120.81550 }
  },
  'wp_east_path_2': {
    id: 'wp_east_path_2',
    name: 'East Path 2',
    type: 'waypoint',
    coordinates: { latitude: 14.85250, longitude: 120.81540 }
  },
  'wp_west_path_1': {
    id: 'wp_west_path_1',
    name: 'West Path 1',
    type: 'waypoint',
    coordinates: { latitude: 14.85220, longitude: 120.81400 }
  },
  'wp_west_path_2': {
    id: 'wp_west_path_2',
    name: 'West Path 2',
    type: 'waypoint',
    coordinates: { latitude: 14.85280, longitude: 120.81380 }
  },
  'wp_north_path_1': {
    id: 'wp_north_path_1',
    name: 'North Path 1',
    type: 'waypoint',
    coordinates: { latitude: 14.85330, longitude: 120.81420 }
  },
  'wp_north_path_2': {
    id: 'wp_north_path_2',
    name: 'North Path 2',
    type: 'waypoint',
    coordinates: { latitude: 14.85360, longitude: 120.81380 }
  },
  'wp_south_path_1': {
    id: 'wp_south_path_1',
    name: 'South Path 1',
    type: 'waypoint',
    coordinates: { latitude: 14.85140, longitude: 120.81500 }
  },

  // ============ EVACUATION AREAS ============
  'evac_front_grounds': {
    id: 'evac_front_grounds',
    name: 'Front Grounds',
    type: 'evacuation',
    coordinates: { latitude: 14.85160, longitude: 120.81480 },
    isEvacuationPoint: true,
    capacity: 500,
    description: 'Primary evacuation area near main gate'
  },
  'evac_central_quad': {
    id: 'evac_central_quad',
    name: 'Central Quadrangle',
    type: 'evacuation',
    coordinates: { latitude: 14.85240, longitude: 120.81470 },
    isEvacuationPoint: true,
    capacity: 800,
    description: 'Large open area at campus center'
  },
  'evac_athletic_field': {
    id: 'evac_athletic_field',
    name: 'Athletic Field',
    type: 'evacuation',
    coordinates: { latitude: 14.85400, longitude: 120.81320 },
    isEvacuationPoint: true,
    capacity: 1000,
    description: 'Largest evacuation area'
  },
  'evac_engineering_grounds': {
    id: 'evac_engineering_grounds',
    name: 'Engineering Grounds',
    type: 'evacuation',
    coordinates: { latitude: 14.85310, longitude: 120.81390 },
    isEvacuationPoint: true,
    capacity: 400,
    description: 'Open area near engineering buildings'
  },
};

// ==================== EDGES (Connections between nodes) ====================
// Each edge represents a walkable path between two nodes
// Weight is calculated from distance but can include factors like:
// - Terrain difficulty
// - Stairs/slopes
// - Covered vs open paths
// - Emergency-specific factors (blocked paths, etc.)

export const campusEdges = [
  // ============ MAIN GATE CONNECTIONS ============
  { from: 'gate_main', to: 'int_main_entrance', weight: 30, type: 'path', isEmergencyRoute: true },
  
  // ============ MAIN ENTRANCE AREA ============
  { from: 'int_main_entrance', to: 'evac_front_grounds', weight: 15, type: 'path', isEmergencyRoute: true },
  { from: 'int_main_entrance', to: 'wp_main_path_1', weight: 25, type: 'path', isEmergencyRoute: true },
  { from: 'int_main_entrance', to: 'int_canteen', weight: 40, type: 'path' },
  
  // ============ FRONT GROUNDS TO PIMENTEL ============
  { from: 'evac_front_grounds', to: 'int_pimentel_front', weight: 35, type: 'path', isEmergencyRoute: true },
  { from: 'wp_main_path_1', to: 'int_pimentel_front', weight: 20, type: 'path' },
  { from: 'int_pimentel_front', to: 'bldg_pimentel', weight: 15, type: 'path' },
  { from: 'int_pimentel_front', to: 'wp_main_path_2', weight: 20, type: 'path' },
  { from: 'int_pimentel_front', to: 'int_chapel_area', weight: 30, type: 'path' },
  
  // ============ CENTRAL QUADRANGLE CONNECTIONS ============
  { from: 'wp_main_path_2', to: 'int_central_quad', weight: 25, type: 'path', isEmergencyRoute: true },
  { from: 'int_central_quad', to: 'evac_central_quad', weight: 5, type: 'path', isEmergencyRoute: true },
  { from: 'int_central_quad', to: 'bldg_alvarado', weight: 20, type: 'path' },
  { from: 'int_central_quad', to: 'int_roxas_junction', weight: 30, type: 'path', isEmergencyRoute: true },
  { from: 'int_central_quad', to: 'int_library_front', weight: 35, type: 'path' },
  { from: 'int_central_quad', to: 'int_science_area', weight: 40, type: 'path' },
  
  // ============ ROXAS/ENGINEERING AREA ============
  { from: 'int_roxas_junction', to: 'bldg_roxas', weight: 15, type: 'path' },
  { from: 'int_roxas_junction', to: 'int_engineering_plaza', weight: 25, type: 'path', isEmergencyRoute: true },
  { from: 'int_roxas_junction', to: 'int_science_area', weight: 30, type: 'path' },
  { from: 'int_engineering_plaza', to: 'evac_engineering_grounds', weight: 10, type: 'path', isEmergencyRoute: true },
  { from: 'int_engineering_plaza', to: 'int_carpio_front', weight: 35, type: 'path' },
  { from: 'int_engineering_plaza', to: 'wp_north_path_1', weight: 25, type: 'path' },
  
  // ============ CARPIO/CHTM AREA ============
  { from: 'int_carpio_front', to: 'bldg_carpio', weight: 15, type: 'path' },
  { from: 'int_carpio_front', to: 'int_chtm_area', weight: 30, type: 'path' },
  { from: 'int_chtm_area', to: 'bldg_chtm', weight: 15, type: 'path' },
  { from: 'int_chtm_area', to: 'int_library_front', weight: 40, type: 'path' },
  
  // ============ SCIENCE/FEDERIZO AREA ============
  { from: 'int_science_area', to: 'bldg_federizo', weight: 15, type: 'path' },
  { from: 'int_science_area', to: 'wp_west_path_1', weight: 20, type: 'path' },
  { from: 'int_science_area', to: 'wp_west_path_2', weight: 25, type: 'path' },
  { from: 'wp_west_path_2', to: 'int_engineering_plaza', weight: 30, type: 'path' },
  
  // ============ CHAPEL AREA ============
  { from: 'int_chapel_area', to: 'bldg_chapel', weight: 10, type: 'path' },
  { from: 'int_chapel_area', to: 'wp_west_path_1', weight: 25, type: 'path' },
  { from: 'wp_west_path_1', to: 'int_science_area', weight: 30, type: 'path' },
  
  // ============ LIBRARY AREA ============
  { from: 'int_library_front', to: 'bldg_library', weight: 15, type: 'path' },
  { from: 'int_library_front', to: 'wp_east_path_2', weight: 20, type: 'path' },
  { from: 'int_library_front', to: 'int_gym_area', weight: 40, type: 'path' },
  
  // ============ GYMNASIUM/EAST AREA ============
  { from: 'int_gym_area', to: 'bldg_gymnasium', weight: 15, type: 'path' },
  { from: 'int_gym_area', to: 'bldg_student_center', weight: 20, type: 'path' },
  { from: 'int_gym_area', to: 'wp_east_path_1', weight: 30, type: 'path' },
  { from: 'wp_east_path_1', to: 'int_canteen', weight: 25, type: 'path' },
  { from: 'wp_east_path_2', to: 'int_gym_area', weight: 25, type: 'path' },
  
  // ============ CANTEEN/CICT AREA ============
  { from: 'int_canteen', to: 'bldg_natividad', weight: 20, type: 'path' },
  { from: 'int_canteen', to: 'bldg_cict', weight: 25, type: 'path' },
  { from: 'int_canteen', to: 'wp_south_path_1', weight: 20, type: 'path' },
  { from: 'wp_south_path_1', to: 'int_main_entrance', weight: 25, type: 'path', isEmergencyRoute: true },
  
  // ============ ATHLETIC FIELD CONNECTIONS ============
  { from: 'wp_north_path_1', to: 'wp_north_path_2', weight: 30, type: 'path' },
  { from: 'wp_north_path_2', to: 'int_athletic_field', weight: 35, type: 'path', isEmergencyRoute: true },
  { from: 'int_athletic_field', to: 'evac_athletic_field', weight: 20, type: 'path', isEmergencyRoute: true },
  { from: 'int_athletic_field', to: 'gate_back', weight: 40, type: 'path', isEmergencyRoute: true },
  
  // ============ SIDE GATE CONNECTIONS ============
  { from: 'gate_side', to: 'int_gym_area', weight: 50, type: 'path' },
  { from: 'gate_side', to: 'bldg_cict', weight: 45, type: 'path' },
];

// ==================== HELPER FUNCTIONS ====================

/**
 * Get all evacuation points
 */
export const getEvacuationPoints = () => {
  return Object.values(campusNodes).filter(node => node.isEvacuationPoint);
};

/**
 * Get all building nodes
 */
export const getBuildingNodes = () => {
  return Object.values(campusNodes).filter(node => node.type === 'building');
};

/**
 * Get node by building ID
 */
export const getNodeByBuildingId = (buildingId) => {
  return Object.values(campusNodes).find(node => node.buildingId === buildingId);
};

/**
 * Get nearest node to a coordinate
 */
export const getNearestNode = (latitude, longitude) => {
  let nearestNode = null;
  let minDistance = Infinity;
  
  Object.values(campusNodes).forEach(node => {
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

/**
 * Calculate distance between two coordinates in meters
 */
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371000; // Earth's radius in meters
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const toRad = (deg) => deg * (Math.PI / 180);

/**
 * Build adjacency list from edges
 */
export const buildAdjacencyList = (edges = campusEdges, emergencyOnly = false) => {
  const adjacencyList = {};
  
  // Initialize all nodes
  Object.keys(campusNodes).forEach(nodeId => {
    adjacencyList[nodeId] = [];
  });
  
  // Add edges (bidirectional)
  edges.forEach(edge => {
    // Filter for emergency routes if needed
    if (emergencyOnly && !edge.isEmergencyRoute) return;
    
    adjacencyList[edge.from].push({
      node: edge.to,
      weight: edge.weight,
      type: edge.type,
      isEmergencyRoute: edge.isEmergencyRoute
    });
    
    adjacencyList[edge.to].push({
      node: edge.from,
      weight: edge.weight,
      type: edge.type,
      isEmergencyRoute: edge.isEmergencyRoute
    });
  });
  
  return adjacencyList;
};

export default {
  campusNodes,
  campusEdges,
  getEvacuationPoints,
  getBuildingNodes,
  getNodeByBuildingId,
  getNearestNode,
  calculateDistance,
  buildAdjacencyList,
};
