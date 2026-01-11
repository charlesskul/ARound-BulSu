// Campus Data Provider
// This provider fetches campus data from the backend server or uses local fallback
// It ensures the mobile app always has data to display, even when offline
// NOW SYNCS with Campus Node Manager data from admin app!

import apiService from './apiService';
import { buildings as defaultBuildings, evacuationAreas as defaultEvacuationAreas } from '../data/campusData';

class CampusDataProvider {
  constructor() {
    this.buildings = defaultBuildings || [];
    this.evacuationAreas = defaultEvacuationAreas || [];
    this.isServerData = false;
    this.lastFetchTime = null;
    this.listeners = [];
    this.campusNodes = {}; // Nodes from admin Campus Node Manager
  }

  // Subscribe to data updates
  subscribe(callback) {
    this.listeners.push(callback);
    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter(cb => cb !== callback);
    };
  }

  // Notify all listeners of data change
  notifyListeners() {
    this.listeners.forEach(callback => {
      callback({
        buildings: this.buildings,
        evacuationAreas: this.evacuationAreas,
        isServerData: this.isServerData,
        lastFetchTime: this.lastFetchTime,
      });
    });
  }

  // Fetch data from server, fallback to local data if server unavailable
  async fetchData() {
    try {
      console.log('📍 CampusDataProvider: Starting data fetch...');
      // Check if server is available
      const health = await apiService.healthCheck();
      console.log('📍 CampusDataProvider: Health check result:', health.status);
      
      if (health.status === 'ok') {
        // Fetch campus nodes from admin app AND regular campus data
        const [campusNodesData, campusData] = await Promise.all([
          apiService.getCampusNodes().catch(err => {
            console.log('Campus nodes fetch failed:', err.message);
            return { nodes: {}, connections: {} };
          }),
          apiService.getCampusData().catch(err => {
            console.log('Campus data fetch failed:', err.message);
            return { buildings: [], evacuationAreas: [] };
          }),
        ]);

        // Store campus nodes
        this.campusNodes = campusNodesData.nodes || {};
        console.log(`📍 Fetched ${Object.keys(this.campusNodes).length} nodes from Campus Node Manager`);

        // Convert building_entrance nodes to buildings format
        const buildingsFromNodes = this.convertNodesToBuildings(this.campusNodes);
        console.log(`📍 Converted ${buildingsFromNodes.length} building nodes`);

        // Merge: prioritize nodes from admin, then server buildings, then defaults
        if (buildingsFromNodes.length > 0) {
          // Use buildings from admin Campus Node Manager
          this.buildings = buildingsFromNodes;
          console.log('📍 Using buildings from Campus Node Manager');
        } else if (campusData.buildings && campusData.buildings.length > 0) {
          this.buildings = campusData.buildings;
        }
        
        // Convert evacuation nodes to evacuation areas
        const evacuationFromNodes = this.convertNodesToEvacuationAreas(this.campusNodes);
        if (evacuationFromNodes.length > 0) {
          this.evacuationAreas = evacuationFromNodes;
          console.log(`📍 Using ${evacuationFromNodes.length} evacuation areas from nodes`);
        } else if (campusData.evacuationAreas && campusData.evacuationAreas.length > 0) {
          this.evacuationAreas = campusData.evacuationAreas;
        }
        
        this.isServerData = true;
        this.lastFetchTime = new Date();
        console.log('✅ Campus data synced from server');
        console.log('✅ Buildings to notify:', this.buildings?.length, 'first:', this.buildings?.[0]?.name);
      } else {
        console.log('Server unavailable, using local data');
        this.isServerData = false;
      }
    } catch (error) {
      console.log('Failed to fetch from server, using local data:', error.message);
      this.isServerData = false;
    }

    console.log('📍 Notifying', this.listeners.length, 'listeners with', this.buildings?.length, 'buildings');
    this.notifyListeners();
    return {
      buildings: this.buildings,
      evacuationAreas: this.evacuationAreas,
      isServerData: this.isServerData,
    };
  }

  // Convert campus nodes (from admin) to buildings format for the mobile app
  convertNodesToBuildings(nodes) {
    const buildings = [];
    let buildingId = 1;

    console.log('📍 convertNodesToBuildings: Processing', Object.keys(nodes || {}).length, 'nodes');
    
    Object.values(nodes || {}).forEach(node => {
      // Include building_entrance, building, gate types as navigable destinations
      if (['building_entrance', 'building', 'gate', 'landmark'].includes(node.type)) {
        const coords = node.coordinates || {};
        console.log(`📍 Converting node: ${node.name} (${node.type}) at ${coords.latitude}, ${coords.longitude}`);
        buildings.push({
          id: buildingId++,
          nodeId: node.id, // Keep reference to original node
          name: node.name || `Building ${buildingId}`,
          coordinates: {
            latitude: coords.latitude || 0,
            longitude: coords.longitude || 0,
          },
          distance: 0,
          image: null,
          offices: node.offices || [],
          description: node.description || `${node.name} - ${node.type}`,
          evacuationArea: node.evacuationArea || 'Main Grounds',
          floorCount: node.floorCount || 1,
          type: node.type,
        });
      }
    });

    console.log(`📍 convertNodesToBuildings: Created ${buildings.length} buildings`);
    return buildings;
  }

  // Convert evacuation nodes to evacuation areas format
  convertNodesToEvacuationAreas(nodes) {
    const evacuationAreas = [];
    let areaId = 1;

    Object.values(nodes).forEach(node => {
      if (node.type === 'evacuation' || node.isEvacuationPoint) {
        const coords = node.coordinates || {};
        evacuationAreas.push({
          id: areaId++,
          nodeId: node.id,
          name: node.name || `Evacuation Area ${areaId}`,
          coordinates: {
            latitude: coords.latitude || 0,
            longitude: coords.longitude || 0,
          },
          description: node.description || 'Emergency evacuation point',
          capacity: node.capacity || 100,
        });
      }
    });

    return evacuationAreas;
  }

  // Get current buildings
  getBuildings() {
    return this.buildings;
  }

  // Get current evacuation areas
  getEvacuationAreas() {
    return this.evacuationAreas;
  }

  // Get building by ID
  getBuildingById(id) {
    return this.buildings.find(b => b.id === id);
  }

  // Get building by name
  getBuildingByName(name) {
    return this.buildings.find(b => 
      b.name.toLowerCase().includes(name.toLowerCase())
    );
  }

  // Get evacuation area by ID
  getEvacuationAreaById(id) {
    return this.evacuationAreas.find(e => e.id === id);
  }

  // Search buildings by name or office
  searchBuildings(query) {
    if (!query) return this.buildings;
    
    const lowerQuery = query.toLowerCase();
    return this.buildings.filter(building => {
      const nameMatch = building.name.toLowerCase().includes(lowerQuery);
      const officeMatch = building.offices?.some(office => 
        office.toLowerCase().includes(lowerQuery)
      );
      const descMatch = building.description?.toLowerCase().includes(lowerQuery);
      return nameMatch || officeMatch || descMatch;
    });
  }

  // Get data status
  getStatus() {
    return {
      isServerData: this.isServerData,
      lastFetchTime: this.lastFetchTime,
      buildingCount: this.buildings.length,
      evacuationAreaCount: this.evacuationAreas.length,
    };
  }

  // Force refresh from server
  async refresh() {
    return await this.fetchData();
  }
}

// Export singleton instance
const campusDataProvider = new CampusDataProvider();
export default campusDataProvider;
