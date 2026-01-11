// API Service for syncing with backend server
// This service fetches campus data (buildings, evacuation areas) from the admin backend

// IMPORTANT: Change this to your server's IP address
// For local development:
// - On same device as server: 'http://localhost:3001/api'
// - On Android emulator: 'http://10.0.2.2:3001/api'
// - On physical device: 'http://<YOUR_COMPUTER_IP>:3001/api'
// Get your IP by running: ipconfig (Windows) or ifconfig (Mac/Linux)
const API_BASE_URL = 'http://192.168.254.104:3001/api'; // Your computer's IP address

class ApiService {
  constructor() {
    this.baseUrl = API_BASE_URL;
    this.isConnected = false;
    this.lastSyncTime = null;
  }

  // Set the server URL dynamically
  setServerUrl(url) {
    this.baseUrl = url;
  }

  // Health check to see if server is available
  async healthCheck() {
    try {
      const response = await fetch(`${this.baseUrl}/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        this.isConnected = true;
        return { status: 'ok' };
      }
      this.isConnected = false;
      return { status: 'error' };
    } catch (error) {
      this.isConnected = false;
      console.log('Server health check failed:', error.message);
      return { status: 'error', message: error.message };
    }
  }

  // Fetch all campus data (buildings and evacuation areas)
  async getCampusData() {
    try {
      const [buildingsRes, evacuationRes] = await Promise.all([
        fetch(`${this.baseUrl}/buildings`),
        fetch(`${this.baseUrl}/evacuation-areas`),
      ]);

      const buildings = await buildingsRes.json();
      const evacuationAreas = await evacuationRes.json();

      this.lastSyncTime = new Date();
      this.isConnected = true;

      return {
        buildings: Array.isArray(buildings) ? buildings : [],
        evacuationAreas: Array.isArray(evacuationAreas) ? evacuationAreas : [],
      };
    } catch (error) {
      console.log('Failed to fetch campus data:', error.message);
      this.isConnected = false;
      throw error;
    }
  }

  // Fetch only buildings
  async getBuildings() {
    try {
      const response = await fetch(`${this.baseUrl}/buildings`);
      if (!response.ok) throw new Error('Failed to fetch buildings');
      const data = await response.json();
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.log('Failed to fetch buildings:', error.message);
      throw error;
    }
  }

  // Fetch only evacuation areas
  async getEvacuationAreas() {
    try {
      const response = await fetch(`${this.baseUrl}/evacuation-areas`);
      if (!response.ok) throw new Error('Failed to fetch evacuation areas');
      const data = await response.json();
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.log('Failed to fetch evacuation areas:', error.message);
      throw error;
    }
  }

  // Fetch current emergency status
  async getEmergencyStatus() {
    try {
      const response = await fetch(`${this.baseUrl}/emergency`);
      if (!response.ok) throw new Error('Failed to fetch emergency status');
      return await response.json();
    } catch (error) {
      console.log('Failed to fetch emergency status:', error.message);
      throw error;
    }
  }

  // Fetch campus nodes for pathfinding (synced from admin app)
  async getCampusNodes() {
    try {
      const response = await fetch(`${this.baseUrl}/campus-nodes`);
      if (!response.ok) throw new Error('Failed to fetch campus nodes');
      const data = await response.json();
      
      // Backend returns { nodes: { id: {...}, ... }, connections: { id: [...], ... } }
      // Normalize to the format the mobile app expects
      const nodes = {};
      const connections = {};
      
      if (data.nodes) {
        Object.entries(data.nodes).forEach(([nodeId, node]) => {
          // Normalize coordinates format
          const latitude = node.latitude ?? node.coordinates?.latitude ?? null;
          const longitude = node.longitude ?? node.coordinates?.longitude ?? null;
          
          nodes[nodeId] = {
            id: node.id || nodeId,
            name: node.name || nodeId,
            type: node.type || 'path',
            coordinates: { latitude, longitude },
            isEvacuationPoint: node.type === 'evacuation' || node.isEvacuationPoint || false,
            description: node.description || '',
            buildingId: node.buildingId || null,
          };
        });
      }
      
      // Process connections - either from connections map or from node.connections array
      if (data.connections) {
        Object.entries(data.connections).forEach(([nodeId, conns]) => {
          connections[nodeId] = Array.isArray(conns) ? conns : [];
        });
      } else {
        // Fallback: extract connections from nodes if they have connections array
        Object.values(data.nodes || {}).forEach(node => {
          if (node.connections && Array.isArray(node.connections)) {
            connections[node.id] = node.connections;
          }
        });
      }
      
      this.lastSyncTime = new Date();
      this.isConnected = true;
      
      return { nodes, connections, lastUpdated: data.lastUpdated };
    } catch (error) {
      console.log('Failed to fetch campus nodes:', error.message);
      this.isConnected = false;
      throw error;
    }
  }

  // Get connection status
  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      lastSyncTime: this.lastSyncTime,
    };
  }
}

// Export singleton instance
const apiService = new ApiService();
export default apiService;
