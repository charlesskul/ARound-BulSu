// Pathfinding Algorithms for BulSU Campus Navigation
// A* Algorithm - For daily navigation (uses heuristics for faster pathfinding)
// Dijkstra Algorithm - For emergency evacuation (guaranteed shortest path)

// Import default/fallback data
import {
  campusNodes as defaultCampusNodes,
  campusEdges,
  buildAdjacencyList,
  calculateDistance,
  getEvacuationPoints as getDefaultEvacuationPoints,
} from '../data/campusGraph';

// Import dynamic data service for synced nodes from admin
import campusDataService from './campusDataService';

// Helper to get current nodes (from campusDataService if synced, else defaults)
const getCampusNodes = () => {
  const syncedNodes = campusDataService.getNodes();
  // Use synced nodes if we have them AND they have actual data with valid coordinates
  if (syncedNodes && Object.keys(syncedNodes).length > 0) {
    // Verify at least some nodes have valid coordinates
    const hasValidNodes = Object.values(syncedNodes).some(node => 
      node?.coordinates?.latitude && node?.coordinates?.longitude
    );
    
    if (hasValidNodes) {
      console.log('🗺️ Using synced nodes:', Object.keys(syncedNodes).length);
      return syncedNodes;
    } else {
      console.warn('⚠️ Synced nodes missing coordinates, falling back to defaults');
    }
  }
  console.log('🗺️ Using default nodes:', Object.keys(defaultCampusNodes).length);
  return defaultCampusNodes;
};

// Helper to get current graph/connections
const getCampusGraph = () => {
  const syncedGraph = campusDataService.getGraph();
  
  // Check if synced graph actually has connections (not just empty arrays)
  if (syncedGraph && Object.keys(syncedGraph).length > 0) {
    // Verify at least some connections exist (not all empty arrays)
    const hasActualConnections = Object.values(syncedGraph).some(
      connections => Array.isArray(connections) && connections.length > 0
    );
    
    if (hasActualConnections) {
      console.log('🗺️ Using synced graph:', Object.keys(syncedGraph).length, 'nodes with connections');
      return syncedGraph;
    } else {
      console.warn('⚠️ Synced graph has empty connections, falling back to default edges');
    }
  }
  
  console.log('🗺️ Using default graph from edges');
  // Build from edges if no synced graph or synced graph has no actual connections
  return buildAdjacencyList(campusEdges, false);
};

// Helper to get evacuation points from current data
const getEvacuationPoints = () => {
  const nodes = getCampusNodes();
  return Object.values(nodes).filter(node => 
    node.isEvacuationPoint || node.type === 'evacuation'
  );
};

// Dynamic getNearestNode that works with synced nodes
const getNearestNode = (latitude, longitude) => {
  const nodes = getCampusNodes();
  let nearestNode = null;
  let minDistance = Infinity;
  
  Object.values(nodes).forEach(node => {
    // Skip nodes without valid coordinates
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
  
  if (nearestNode) {
    console.log(`🗺️ Nearest node to user: ${nearestNode.name} (${Math.round(minDistance)}m away)`);
  }
  
  return nearestNode;
};
// ==================== PRIORITY QUEUE ====================
// Min-heap implementation for efficient node selection
class PriorityQueue {
  constructor() {
    this.values = [];
  }

  enqueue(node, priority) {
    this.values.push({ node, priority });
    this.bubbleUp();
  }

  dequeue() {
    const min = this.values[0];
    const end = this.values.pop();
    if (this.values.length > 0) {
      this.values[0] = end;
      this.bubbleDown();
    }
    return min;
  }

  bubbleUp() {
    let idx = this.values.length - 1;
    const element = this.values[idx];
    while (idx > 0) {
      const parentIdx = Math.floor((idx - 1) / 2);
      const parent = this.values[parentIdx];
      if (element.priority >= parent.priority) break;
      this.values[parentIdx] = element;
      this.values[idx] = parent;
      idx = parentIdx;
    }
  }

  bubbleDown() {
    let idx = 0;
    const length = this.values.length;
    const element = this.values[0];
    while (true) {
      const leftChildIdx = 2 * idx + 1;
      const rightChildIdx = 2 * idx + 2;
      let leftChild, rightChild;
      let swap = null;

      if (leftChildIdx < length) {
        leftChild = this.values[leftChildIdx];
        if (leftChild.priority < element.priority) {
          swap = leftChildIdx;
        }
      }
      if (rightChildIdx < length) {
        rightChild = this.values[rightChildIdx];
        if (
          (swap === null && rightChild.priority < element.priority) ||
          (swap !== null && rightChild.priority < leftChild.priority)
        ) {
          swap = rightChildIdx;
        }
      }
      if (swap === null) break;
      this.values[idx] = this.values[swap];
      this.values[swap] = element;
      idx = swap;
    }
  }

  isEmpty() {
    return this.values.length === 0;
  }
}

// ==================== A* ALGORITHM ====================
/**
 * A* Pathfinding Algorithm
 * Best for daily navigation - uses heuristics to find path faster
 * 
 * @param {string} startNodeId - Starting node ID
 * @param {string} endNodeId - Destination node ID
 * @param {Object} options - Configuration options
 * @returns {Object} - Path result with nodes, coordinates, distance, and time
 */
export const aStarPathfinding = (startNodeId, endNodeId, options = {}) => {
  const {
    avoidStairs = false,
    preferCovered = false,
    emergencyMode = false,
  } = options;

  // Get current nodes and graph (may be synced from admin)
  const campusNodes = getCampusNodes();
  const campusGraph = getCampusGraph();

  // Build adjacency list from synced graph or edges
  const adjacencyList = campusGraph;
  
  // Validate nodes exist
  if (!campusNodes[startNodeId] || !campusNodes[endNodeId]) {
    console.error('Invalid start or end node');
    return null;
  }

  const startNode = campusNodes[startNodeId];
  const endNode = campusNodes[endNodeId];

  // Heuristic function - Euclidean distance to goal
  const heuristic = (nodeId) => {
    const node = campusNodes[nodeId];
    if (!node || !node.coordinates) return Infinity;
    return calculateDistance(
      node.coordinates.latitude,
      node.coordinates.longitude,
      endNode.coordinates.latitude,
      endNode.coordinates.longitude
    );
  };

  // Initialize data structures
  const openSet = new PriorityQueue();
  const cameFrom = {};
  const gScore = {}; // Cost from start to node
  const fScore = {}; // gScore + heuristic
  const closedSet = new Set();

  // Initialize scores
  Object.keys(campusNodes).forEach(nodeId => {
    gScore[nodeId] = Infinity;
    fScore[nodeId] = Infinity;
  });

  gScore[startNodeId] = 0;
  fScore[startNodeId] = heuristic(startNodeId);
  openSet.enqueue(startNodeId, fScore[startNodeId]);

  while (!openSet.isEmpty()) {
    const current = openSet.dequeue().node;

    // Found the goal
    if (current === endNodeId) {
      return reconstructPath(cameFrom, current, gScore[current], campusNodes);
    }

    closedSet.add(current);

    // Explore neighbors - handle both synced graph format and edge-based format
    const neighbors = adjacencyList[current] || [];
    for (const neighborItem of neighbors) {
      // Handle both formats: array of strings (synced) or array of {node, weight} objects
      const neighborId = typeof neighborItem === 'string' ? neighborItem : neighborItem.node;
      
      if (closedSet.has(neighborId)) continue;

      // Calculate weight - use edge weight or calculate from coordinates
      let weight = typeof neighborItem === 'string' 
        ? calculateDistanceBetweenNodes(current, neighborId, campusNodes) 
        : neighborItem.weight;
      
      // Apply preference modifiers
      if (typeof neighborItem !== 'string') {
        if (avoidStairs && neighborItem.hasStairs) {
          weight *= 2; // Penalize stairs
        }
        if (preferCovered && !neighborItem.isCovered) {
          weight *= 1.3; // Slight penalty for uncovered paths
        }
      }

      const tentativeGScore = gScore[current] + weight;

      if (tentativeGScore < gScore[neighborId]) {
        // This is a better path
        cameFrom[neighborId] = current;
        gScore[neighborId] = tentativeGScore;
        fScore[neighborId] = tentativeGScore + heuristic(neighborId);
        openSet.enqueue(neighborId, fScore[neighborId]);
      }
    }
  }

  // No path found
  console.log('No path found from', startNodeId, 'to', endNodeId);
  return null;
};

// ==================== DIJKSTRA'S ALGORITHM ====================
/**
 * Dijkstra's Algorithm
 * Best for emergency evacuation - guarantees shortest path
 * Used to find the nearest evacuation point
 * 
 * @param {string} startNodeId - Starting node ID
 * @param {string} endNodeId - Destination node ID (optional for evacuation)
 * @param {Object} options - Configuration options
 * @returns {Object} - Path result with nodes, coordinates, distance, and time
 */
export const dijkstraPathfinding = (startNodeId, endNodeId = null, options = {}) => {
  const {
    emergencyMode = true,
    findNearestEvacuation = false,
  } = options;

  // Get current nodes and graph (may be synced from admin)
  const campusNodes = getCampusNodes();
  const campusGraph = getCampusGraph();

  // Build adjacency list from synced graph
  const adjacencyList = campusGraph;
  
  // Validate start node
  if (!campusNodes[startNodeId]) {
    console.error('Invalid start node');
    return null;
  }

  // If finding nearest evacuation, we'll check all evacuation points
  const evacuationPoints = findNearestEvacuation ? getEvacuationPoints() : [];

  // Initialize data structures
  const distances = {};
  const previous = {};
  const visited = new Set();
  const pq = new PriorityQueue();

  // Initialize distances
  Object.keys(campusNodes).forEach(nodeId => {
    distances[nodeId] = Infinity;
    previous[nodeId] = null;
  });

  distances[startNodeId] = 0;
  pq.enqueue(startNodeId, 0);

  while (!pq.isEmpty()) {
    const { node: currentNode } = pq.dequeue();

    if (visited.has(currentNode)) continue;
    visited.add(currentNode);

    // If we have a specific end node and reached it
    if (endNodeId && currentNode === endNodeId) {
      return reconstructPath(previous, currentNode, distances[currentNode], campusNodes);
    }

    // If finding nearest evacuation, check if current is an evacuation point
    if (findNearestEvacuation) {
      const isEvacPoint = evacuationPoints.some(ep => ep.id === currentNode);
      if (isEvacPoint && currentNode !== startNodeId) {
        return reconstructPath(previous, currentNode, distances[currentNode], campusNodes);
      }
    }

    // Explore neighbors - handle both synced graph format and edge-based format
    const neighbors = adjacencyList[currentNode] || [];
    for (const neighborItem of neighbors) {
      // Handle both formats: array of strings (synced) or array of {node, weight} objects
      const neighborId = typeof neighborItem === 'string' ? neighborItem : neighborItem.node;
      const neighborWeight = typeof neighborItem === 'string' 
        ? calculateDistanceBetweenNodes(currentNode, neighborId, campusNodes) 
        : neighborItem.weight;
      
      if (visited.has(neighborId)) continue;

      const newDistance = distances[currentNode] + neighborWeight;

      if (newDistance < distances[neighborId]) {
        distances[neighborId] = newDistance;
        previous[neighborId] = currentNode;
        pq.enqueue(neighborId, newDistance);
      }
    }
  }

  // If finding nearest evacuation and no path found through emergency routes,
  // try again with all routes
  if (findNearestEvacuation && emergencyMode) {
    console.log('No emergency route found, trying all routes...');
    return dijkstraPathfinding(startNodeId, endNodeId, {
      ...options,
      emergencyMode: false,
    });
  }

  // No path found
  console.log('No path found');
  return null;
};

// Helper to calculate distance between two nodes
const calculateDistanceBetweenNodes = (nodeId1, nodeId2, campusNodes) => {
  const node1 = campusNodes[nodeId1];
  const node2 = campusNodes[nodeId2];
  if (!node1?.coordinates || !node2?.coordinates) return 100; // Default weight
  return calculateDistance(
    node1.coordinates.latitude,
    node1.coordinates.longitude,
    node2.coordinates.latitude,
    node2.coordinates.longitude
  );
};

// ==================== PATH RECONSTRUCTION ====================
/**
 * Reconstruct the path from the pathfinding result
 */
const reconstructPath = (cameFrom, currentNode, totalDistance, campusNodes = null) => {
  // Use provided nodes or get current
  const nodes = campusNodes || getCampusNodes();
  
  const path = [];
  let current = currentNode;

  while (current) {
    path.unshift(current);
    current = cameFrom[current];
  }

  // Convert path to coordinates
  const coordinates = path.map(nodeId => {
    const node = nodes[nodeId];
    if (!node) return { nodeId, nodeName: nodeId, nodeType: 'unknown' };
    return {
      ...node.coordinates,
      nodeId,
      nodeName: node.name,
      nodeType: node.type,
    };
  });

  // Calculate estimated walking time (average walking speed: 1.4 m/s)
  const walkingSpeed = 1.4; // meters per second
  const estimatedTimeSeconds = totalDistance / walkingSpeed;
  const estimatedTimeMinutes = Math.ceil(estimatedTimeSeconds / 60);

  return {
    success: true,
    path,
    coordinates,
    totalDistance: Math.round(totalDistance),
    estimatedTime: estimatedTimeMinutes,
    startNode: nodes[path[0]],
    endNode: nodes[path[path.length - 1]],
    nodeCount: path.length,
  };
};

// ==================== HIGH-LEVEL NAVIGATION FUNCTIONS ====================

/**
 * Navigate from current location to a building
 * Uses A* for optimal pathfinding
 * 
 * @param {Object} currentLocation - User's current location {latitude, longitude}
 * @param {number|string} buildingIdOrNodeId - Building ID or node ID to navigate to
 * @param {Object} options - Navigation options
 */
export const navigateToBuilding = (currentLocation, buildingIdOrNodeId, options = {}) => {
  const campusNodes = getCampusNodes();
  const campusGraph = getCampusGraph();
  
  console.log('🗺️ ==================== PATHFINDING START ====================');
  console.log('🗺️ navigateToBuilding called with:', buildingIdOrNodeId);
  console.log('🗺️ Total nodes available:', Object.keys(campusNodes).length);
  console.log('🗺️ Graph connections:', Object.keys(campusGraph).length);
  console.log('🗺️ Current location:', currentLocation);
  
  // Find nearest node to current location
  const startNode = getNearestNode(currentLocation.latitude, currentLocation.longitude);
  
  // Find building entrance node - support multiple lookup methods
  let buildingNode = null;
  
  // Method 1: Direct node ID lookup (for synced nodes like "node_1766027517126")
  if (campusNodes[buildingIdOrNodeId]) {
    buildingNode = campusNodes[buildingIdOrNodeId];
    console.log('🗺️ Found node by direct ID:', buildingNode?.name);
  }
  
  // Method 2: Look for node with matching buildingId (legacy support)
  if (!buildingNode) {
    buildingNode = Object.values(campusNodes).find(
      node => node.buildingId === buildingIdOrNodeId
    );
    if (buildingNode) console.log('🗺️ Found node by buildingId:', buildingNode?.name);
  }
  
  // Method 3: Look for node with matching name (exact match)
  if (!buildingNode && typeof buildingIdOrNodeId === 'string') {
    buildingNode = Object.values(campusNodes).find(
      node => node.name && node.name.toLowerCase() === buildingIdOrNodeId.toLowerCase()
    );
    if (buildingNode) console.log('🗺️ Found node by exact name:', buildingNode?.name);
  }
  
  // Method 4: Partial name match (for buildings like "Alvarado Hall" vs "Alvarado")
  if (!buildingNode && typeof buildingIdOrNodeId === 'string') {
    const searchName = buildingIdOrNodeId.toLowerCase();
    buildingNode = Object.values(campusNodes).find(
      node => node.name && (
        node.name.toLowerCase().includes(searchName) ||
        searchName.includes(node.name.toLowerCase())
      )
    );
    if (buildingNode) console.log('🗺️ Found node by partial name:', buildingNode?.name);
  }
  
  // Method 5: Find by coordinates (if buildingIdOrNodeId is an object with coordinates)
  if (!buildingNode && typeof buildingIdOrNodeId === 'object' && buildingIdOrNodeId.coordinates) {
    const targetCoords = buildingIdOrNodeId.coordinates;
    let minDist = Infinity;
    Object.values(campusNodes).forEach(node => {
      if (node.coordinates) {
        const dist = calculateDistance(
          targetCoords.latitude, targetCoords.longitude,
          node.coordinates.latitude, node.coordinates.longitude
        );
        if (dist < minDist && dist < 50) { // Within 50 meters
          minDist = dist;
          buildingNode = node;
        }
      }
    });
    if (buildingNode) console.log('🗺️ Found node by coordinates:', buildingNode?.name);
  }

  if (!startNode || !buildingNode) {
    console.error('❌ Could not find start or destination node', { 
      hasStart: !!startNode, 
      startName: startNode?.name,
      hasDest: !!buildingNode,
      searchId: buildingIdOrNodeId,
      availableNodeNames: Object.values(campusNodes).slice(0, 10).map(n => n.name)
    });
    return null;
  }

  // Check if nodes have connections
  const startConnections = campusGraph[startNode.id] || [];
  const destConnections = campusGraph[buildingNode.id] || [];
  console.log(`🗺️ Start node "${startNode.name}" (${startNode.id}) has ${startConnections.length} connections`);
  console.log(`🗺️ Dest node "${buildingNode.name}" (${buildingNode.id}) has ${destConnections.length} connections`);
  
  // Warning if nodes have no connections
  if (startConnections.length === 0) {
    console.warn('⚠️ Start node has NO connections - pathfinding will fail!');
  }
  if (destConnections.length === 0) {
    console.warn('⚠️ Destination node has NO connections - pathfinding will fail!');
  }

  console.log(`🗺️ Navigating from ${startNode.name} to ${buildingNode.name}`);
  
  const result = aStarPathfinding(startNode.id, buildingNode.id, options);
  
  if (result) {
    console.log(`✅ A* found path with ${result.coordinates?.length} waypoints, ${result.totalDistance}m`);
    console.log('🗺️ ==================== PATHFINDING SUCCESS ====================');
  } else {
    console.log('❌ A* could not find a path - nodes may not be connected');
    console.log('🗺️ ==================== PATHFINDING FAILED ====================');
  }
  
  return result;
};

/**
 * Navigate from current location to nearest evacuation point
 * Uses Dijkstra for guaranteed shortest path
 */
export const navigateToEvacuation = (currentLocation, options = {}) => {
  // Find nearest node to current location
  const startNode = getNearestNode(currentLocation.latitude, currentLocation.longitude);

  if (!startNode) {
    console.error('Could not find start node');
    return null;
  }

  console.log(`Finding nearest evacuation from ${startNode.name}`);
  
  return dijkstraPathfinding(startNode.id, null, {
    ...options,
    emergencyMode: true,
    findNearestEvacuation: true,
  });
};

/**
 * Navigate from current location to a specific evacuation point
 */
export const navigateToSpecificEvacuation = (currentLocation, evacuationNodeId, options = {}) => {
  const campusNodes = getCampusNodes();
  const startNode = getNearestNode(currentLocation.latitude, currentLocation.longitude);

  if (!startNode || !campusNodes[evacuationNodeId]) {
    console.error('Could not find start or evacuation node');
    return null;
  }

  console.log(`Navigating to evacuation: ${campusNodes[evacuationNodeId].name}`);
  
  return dijkstraPathfinding(startNode.id, evacuationNodeId, {
    ...options,
    emergencyMode: true,
  });
};

/**
 * Get all possible paths to evacuation points with distances
 * Useful for showing multiple evacuation options
 */
export const getAllEvacuationPaths = (currentLocation) => {
  const startNode = getNearestNode(currentLocation.latitude, currentLocation.longitude);
  if (!startNode) return [];

  const evacuationPoints = getEvacuationPoints();
  const paths = [];

  for (const evacPoint of evacuationPoints) {
    const path = dijkstraPathfinding(startNode.id, evacPoint.id, {
      emergencyMode: true,
    });
    
    if (path) {
      paths.push({
        ...path,
        evacuationPoint: evacPoint,
      });
    }
  }

  // Sort by distance
  return paths.sort((a, b) => a.totalDistance - b.totalDistance);
};

// ==================== SYNC FUNCTION ====================
/**
 * Force sync campus nodes from server
 * Call this when you want to refresh the navigation data
 */
export const syncCampusNodes = async () => {
  try {
    await campusDataService.forceSync();
    console.log('📍 Campus nodes synced successfully');
    return true;
  } catch (error) {
    console.error('📍 Failed to sync campus nodes:', error);
    return false;
  }
};

/**
 * Initialize campus data service
 * Call this when app starts
 */
export const initializeCampusData = async () => {
  return campusDataService.initialize();
};

/**
 * Get sync status
 */
export const getCampusDataStatus = () => {
  return campusDataService.getSyncStatus();
};

// ==================== EXPORT DEFAULT ====================
export default {
  aStarPathfinding,
  dijkstraPathfinding,
  navigateToBuilding,
  navigateToEvacuation,
  navigateToSpecificEvacuation,
  getAllEvacuationPaths,
  syncCampusNodes,
  initializeCampusData,
  getCampusDataStatus,
};
