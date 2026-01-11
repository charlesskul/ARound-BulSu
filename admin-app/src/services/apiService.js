// API Service for ARound BulSU Admin App
// Connects to the backend server for data synchronization

const API_BASE_URL = 'http://localhost:3001/api';

class ApiService {
  // ==================== HEALTH CHECK ====================
  
  async healthCheck() {
    try {
      const response = await fetch(`${API_BASE_URL}/health`);
      return await response.json();
    } catch (error) {
      console.error('Health check failed:', error);
      return { status: 'error', message: error.message };
    }
  }

  // ==================== CAMPUS DATA ====================

  async getCampusData() {
    try {
      const response = await fetch(`${API_BASE_URL}/campus`);
      if (!response.ok) throw new Error('Failed to fetch campus data');
      return await response.json();
    } catch (error) {
      console.error('Error fetching campus data:', error);
      throw error;
    }
  }

  async updateCampusData(data) {
    try {
      const response = await fetch(`${API_BASE_URL}/campus`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to update campus data');
      return await response.json();
    } catch (error) {
      console.error('Error updating campus data:', error);
      throw error;
    }
  }

  // ==================== BUILDINGS ====================

  async getBuildings() {
    try {
      const response = await fetch(`${API_BASE_URL}/buildings`);
      if (!response.ok) throw new Error('Failed to fetch buildings');
      return await response.json();
    } catch (error) {
      console.error('Error fetching buildings:', error);
      throw error;
    }
  }

  async getBuilding(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/buildings/${id}`);
      if (!response.ok) throw new Error('Failed to fetch building');
      return await response.json();
    } catch (error) {
      console.error('Error fetching building:', error);
      throw error;
    }
  }

  async addBuilding(building) {
    try {
      const response = await fetch(`${API_BASE_URL}/buildings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(building),
      });
      if (!response.ok) throw new Error('Failed to add building');
      return await response.json();
    } catch (error) {
      console.error('Error adding building:', error);
      throw error;
    }
  }

  async updateBuilding(id, building) {
    try {
      const response = await fetch(`${API_BASE_URL}/buildings/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(building),
      });
      if (!response.ok) throw new Error('Failed to update building');
      return await response.json();
    } catch (error) {
      console.error('Error updating building:', error);
      throw error;
    }
  }

  async updateBuildingCoordinates(id, latitude, longitude) {
    try {
      const response = await fetch(`${API_BASE_URL}/buildings/${id}/coordinates`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ latitude, longitude }),
      });
      if (!response.ok) throw new Error('Failed to update building coordinates');
      return await response.json();
    } catch (error) {
      console.error('Error updating building coordinates:', error);
      throw error;
    }
  }

  async deleteBuilding(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/buildings/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete building');
      return await response.json();
    } catch (error) {
      console.error('Error deleting building:', error);
      throw error;
    }
  }

  // ==================== EVACUATION AREAS ====================

  async getEvacuationAreas() {
    try {
      const response = await fetch(`${API_BASE_URL}/evacuation-areas`);
      if (!response.ok) throw new Error('Failed to fetch evacuation areas');
      return await response.json();
    } catch (error) {
      console.error('Error fetching evacuation areas:', error);
      throw error;
    }
  }

  async addEvacuationArea(area) {
    try {
      const response = await fetch(`${API_BASE_URL}/evacuation-areas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(area),
      });
      if (!response.ok) throw new Error('Failed to add evacuation area');
      return await response.json();
    } catch (error) {
      console.error('Error adding evacuation area:', error);
      throw error;
    }
  }

  async updateEvacuationArea(id, area) {
    try {
      const response = await fetch(`${API_BASE_URL}/evacuation-areas/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(area),
      });
      if (!response.ok) throw new Error('Failed to update evacuation area');
      return await response.json();
    } catch (error) {
      console.error('Error updating evacuation area:', error);
      throw error;
    }
  }

  async deleteEvacuationArea(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/evacuation-areas/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete evacuation area');
      return await response.json();
    } catch (error) {
      console.error('Error deleting evacuation area:', error);
      throw error;
    }
  }

  // ==================== EMERGENCY STATUS ====================

  async getEmergencyStatus() {
    try {
      const response = await fetch(`${API_BASE_URL}/emergency`);
      if (!response.ok) throw new Error('Failed to fetch emergency status');
      return await response.json();
    } catch (error) {
      console.error('Error fetching emergency status:', error);
      throw error;
    }
  }

  async activateEmergency(emergencyData) {
    try {
      const response = await fetch(`${API_BASE_URL}/emergency/activate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(emergencyData),
      });
      if (!response.ok) throw new Error('Failed to activate emergency');
      return await response.json();
    } catch (error) {
      console.error('Error activating emergency:', error);
      throw error;
    }
  }

  async deactivateEmergency(deactivatedBy) {
    try {
      const response = await fetch(`${API_BASE_URL}/emergency/deactivate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deactivatedBy }),
      });
      if (!response.ok) throw new Error('Failed to deactivate emergency');
      return await response.json();
    } catch (error) {
      console.error('Error deactivating emergency:', error);
      throw error;
    }
  }

  // ==================== SYNC STATUS ====================

  async getSyncStatus() {
    try {
      const response = await fetch(`${API_BASE_URL}/sync/status`);
      if (!response.ok) throw new Error('Failed to fetch sync status');
      return await response.json();
    } catch (error) {
      console.error('Error fetching sync status:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const apiService = new ApiService();
export default apiService;
