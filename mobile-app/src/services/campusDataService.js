// Campus Data Service - Manages syncing campus nodes between admin and mobile app
// This service fetches nodes from the backend and provides them for pathfinding

import AsyncStorage from '@react-native-async-storage/async-storage';
import apiService from './apiService';

// Default fallback nodes and edges (used when backend is unreachable or has empty data)
import { 
  campusNodes as defaultNodes, 
  campusEdges,
  buildAdjacencyList 
} from '../data/campusGraph';

// Build default graph from edges
const defaultGraph = buildAdjacencyList(campusEdges, false);

const STORAGE_KEY_NODES = '@campus_nodes';
const STORAGE_KEY_GRAPH = '@campus_graph';
const STORAGE_KEY_LAST_SYNC = '@campus_last_sync';

class CampusDataService {
  constructor() {
    this.campusNodes = { ...defaultNodes };
    this.campusGraph = { ...defaultGraph };
    this.lastSyncTime = null;
    this.isLoaded = false;
    this.syncListeners = [];
  }

  // Initialize - load from cache first, then sync from server
  async initialize() {
    try {
      // First, try to load from local cache
      await this.loadFromCache();
      
      // Then try to sync from server (non-blocking)
      this.syncFromServer().catch(err => {
        console.log('Background sync failed:', err.message);
      });
      
      this.isLoaded = true;
      return true;
    } catch (error) {
      console.error('CampusDataService init error:', error);
      // Fall back to default data
      this.campusNodes = { ...defaultNodes };
      this.campusGraph = { ...defaultGraph };
      this.isLoaded = true;
      return true;
    }
  }

  // Load data from local cache
  async loadFromCache() {
    try {
      const [nodesJson, graphJson, lastSync] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEY_NODES),
        AsyncStorage.getItem(STORAGE_KEY_GRAPH),
        AsyncStorage.getItem(STORAGE_KEY_LAST_SYNC),
      ]);

      if (nodesJson && graphJson) {
        const cachedNodes = JSON.parse(nodesJson);
        const cachedGraph = JSON.parse(graphJson);
        
        // Validate cached graph has actual connections
        const hasActualConnections = Object.values(cachedGraph).some(
          conns => Array.isArray(conns) && conns.length > 0
        );
        
        if (hasActualConnections) {
          // Cache has good data
          this.campusNodes = cachedNodes;
          this.campusGraph = cachedGraph;
          console.log(`📍 Loaded ${Object.keys(this.campusNodes).length} nodes from cache (with connections)`);
        } else {
          // Cache has nodes but empty connections - use nodes, keep default graph
          console.warn('⚠️ Cached connections are empty - using default graph');
          this.campusNodes = cachedNodes;
          // Keep this.campusGraph as defaultGraph (set in constructor)
          console.log(`📍 Loaded ${Object.keys(this.campusNodes).length} nodes from cache (using default connections)`);
        }
        
        this.lastSyncTime = lastSync ? new Date(lastSync) : null;
        return true;
      }
      
      console.log('📍 No cached campus data, using defaults');
      return false;
    } catch (error) {
      console.error('Failed to load from cache:', error);
      return false;
    }
  }

  // Save data to local cache
  async saveToCache() {
    try {
      await Promise.all([
        AsyncStorage.setItem(STORAGE_KEY_NODES, JSON.stringify(this.campusNodes)),
        AsyncStorage.setItem(STORAGE_KEY_GRAPH, JSON.stringify(this.campusGraph)),
        AsyncStorage.setItem(STORAGE_KEY_LAST_SYNC, this.lastSyncTime?.toISOString() || ''),
      ]);
      console.log('📍 Campus data saved to cache');
      return true;
    } catch (error) {
      console.error('Failed to save to cache:', error);
      return false;
    }
  }

  // Sync data from backend server
  async syncFromServer() {
    try {
      console.log('📍 Syncing campus nodes from server...');
      const data = await apiService.getCampusNodes();
      
      if (data.nodes && Object.keys(data.nodes).length > 0) {
        // Check if backend connections have actual data (not all empty arrays)
        const connections = data.connections || {};
        const hasActualConnections = Object.values(connections).some(
          conns => Array.isArray(conns) && conns.length > 0
        );
        
        if (hasActualConnections) {
          // Backend has good data - use it
          this.campusNodes = data.nodes;
          this.campusGraph = connections;
          console.log(`📍 Synced ${Object.keys(this.campusNodes).length} nodes with ${Object.keys(connections).length} connection sets from server`);
        } else {
          // Backend has nodes but NO connections - only update nodes, keep default graph
          console.warn('⚠️ Backend connections are empty - keeping default graph for pathfinding');
          this.campusNodes = data.nodes;
          // DON'T overwrite this.campusGraph - keep the default graph with actual connections
          console.log(`📍 Synced ${Object.keys(this.campusNodes).length} nodes (keeping default connections)`);
        }
        
        this.lastSyncTime = new Date();
        
        // Save to cache
        await this.saveToCache();
        
        // Notify listeners
        this.notifyListeners();
        
        return true;
      } else {
        console.log('📍 Server returned no nodes, keeping current data');
        return false;
      }
    } catch (error) {
      console.error('📍 Sync from server failed:', error.message);
      throw error;
    }
  }

  // Force refresh from server
  async forceSync() {
    return this.syncFromServer();
  }

  // Get all nodes
  getNodes() {
    return this.campusNodes;
  }

  // Get a specific node
  getNode(nodeId) {
    return this.campusNodes[nodeId] || null;
  }

  // Get connections graph
  getGraph() {
    return this.campusGraph;
  }

  // Get connections for a specific node
  getConnections(nodeId) {
    return this.campusGraph[nodeId] || [];
  }

  // Get evacuation points
  getEvacuationPoints() {
    return Object.values(this.campusNodes).filter(node => 
      node.isEvacuationPoint || node.type === 'evacuation'
    );
  }

  // Get building entrances
  getBuildingEntrances() {
    return Object.values(this.campusNodes).filter(node => 
      node.type === 'building' || node.type === 'building_entrance'
    );
  }

  // Get node for a specific building
  getNodeForBuilding(buildingId) {
    return Object.values(this.campusNodes).find(node => node.buildingId === buildingId);
  }

  // Find nearest node to coordinates
  findNearestNode(latitude, longitude) {
    let nearestNode = null;
    let minDistance = Infinity;

    Object.values(this.campusNodes).forEach(node => {
      const coords = node.coordinates;
      if (coords && coords.latitude && coords.longitude) {
        const distance = this.calculateDistance(
          latitude, longitude,
          coords.latitude, coords.longitude
        );
        if (distance < minDistance) {
          minDistance = distance;
          nearestNode = node;
        }
      }
    });

    return nearestNode;
  }

  // Calculate distance between two points (Haversine formula)
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  }

  // Get sync status
  getSyncStatus() {
    // Check if graph has actual connections
    const hasConnections = Object.values(this.campusGraph).some(
      conns => Array.isArray(conns) && conns.length > 0
    );
    
    return {
      isLoaded: this.isLoaded,
      lastSyncTime: this.lastSyncTime,
      nodeCount: Object.keys(this.campusNodes).length,
      connectionCount: Object.keys(this.campusGraph).length,
      hasActualConnections: hasConnections,
    };
  }

  // Clear cached data and reset to defaults (useful when backend data is corrupted)
  async clearCache() {
    try {
      await AsyncStorage.multiRemove([
        STORAGE_KEY_NODES,
        STORAGE_KEY_GRAPH,
        STORAGE_KEY_LAST_SYNC,
      ]);
      
      // Reset to default data
      this.campusNodes = { ...defaultNodes };
      this.campusGraph = { ...defaultGraph };
      this.lastSyncTime = null;
      
      console.log('📍 Cache cleared, using default campus data');
      this.notifyListeners();
      return true;
    } catch (error) {
      console.error('Failed to clear cache:', error);
      return false;
    }
  }

  // Force use default data (without clearing cache)
  useDefaults() {
    this.campusNodes = { ...defaultNodes };
    this.campusGraph = { ...defaultGraph };
    console.log('📍 Switched to default campus data');
    this.notifyListeners();
  }

  // Add a listener for sync updates
  addSyncListener(callback) {
    this.syncListeners.push(callback);
    return () => {
      this.syncListeners = this.syncListeners.filter(cb => cb !== callback);
    };
  }

  // Notify all listeners of sync update
  notifyListeners() {
    this.syncListeners.forEach(callback => {
      try {
        callback(this.getSyncStatus());
      } catch (error) {
        console.error('Sync listener error:', error);
      }
    });
  }
}

// Export singleton instance
const campusDataService = new CampusDataService();
export default campusDataService;

// Also export for direct access
export { campusDataService };
