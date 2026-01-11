import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import apiService from '../services/apiService';

const EmergencyContext = createContext(null);

export const useEmergency = () => {
  const context = useContext(EmergencyContext);
  if (!context) {
    throw new Error('useEmergency must be used within an EmergencyProvider');
  }
  return context;
};

export const EmergencyProvider = ({ children }) => {
  const [emergencyStatus, setEmergencyStatus] = useState({
    isActive: false,
    type: null,
    message: '',
    activatedAt: null,
    activatedBy: null,
    affectedAreas: 'All Campus',
  });

  const [evacuationStats, setEvacuationStats] = useState({
    usersInBuildings: 0,
    usersInSafeZones: 0,
    usersEnRoute: 0,
    totalUsers: 1245,
    evacuationProgress: 0,
  });

  // Load emergency state from backend on mount
  useEffect(() => {
    const loadEmergencyStatus = async () => {
      try {
        const serverStatus = await apiService.getEmergencyStatus();
        if (serverStatus) {
          setEmergencyStatus(serverStatus);
        }
      } catch (error) {
        // Fall back to localStorage if server unavailable
        const storedStatus = localStorage.getItem('emergencyStatus');
        if (storedStatus) {
          setEmergencyStatus(JSON.parse(storedStatus));
        }
      }
    };
    loadEmergencyStatus();
  }, []);

  // Simulate real-time evacuation updates when emergency is active
  useEffect(() => {
    let interval;
    if (emergencyStatus.isActive) {
      interval = setInterval(() => {
        setEvacuationStats(prev => {
          const totalUsers = prev.totalUsers;
          const newProgress = Math.min(prev.evacuationProgress + Math.random() * 5, 100);
          const safeUsers = Math.floor((newProgress / 100) * totalUsers);
          const enRoute = Math.floor(Math.random() * 50);
          const inBuildings = totalUsers - safeUsers - enRoute;

          return {
            ...prev,
            usersInBuildings: Math.max(0, inBuildings),
            usersInSafeZones: safeUsers,
            usersEnRoute: enRoute,
            evacuationProgress: newProgress,
          };
        });
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [emergencyStatus.isActive]);

  const activateEmergency = async (type, message, affectedAreas, adminName) => {
    const newStatus = {
      isActive: true,
      type,
      title: getEmergencyTitle(type),
      message: message || getDefaultMessage(type),
      activatedAt: new Date().toISOString(),
      activatedBy: adminName,
      affectedAreas,
    };

    try {
      // Sync to backend server for mobile app
      await apiService.activateEmergency(newStatus);
      console.log('✅ Emergency activated and synced to backend');
    } catch (error) {
      console.error('Failed to sync emergency to backend:', error);
    }

    setEmergencyStatus(newStatus);
    localStorage.setItem('emergencyStatus', JSON.stringify(newStatus));

    // Reset evacuation stats
    setEvacuationStats({
      usersInBuildings: 1200,
      usersInSafeZones: 45,
      usersEnRoute: 0,
      totalUsers: 1245,
      evacuationProgress: 3.6,
    });

    return { success: true };
  };

  const deactivateEmergency = async () => {
    const summary = {
      type: emergencyStatus.type,
      duration: calculateDuration(emergencyStatus.activatedAt),
      usersEvacuated: evacuationStats.usersInSafeZones,
      markedSafe: evacuationStats.usersInSafeZones,
      sosAlerts: Math.floor(Math.random() * 5),
    };

    const newStatus = {
      isActive: false,
      type: null,
      title: null,
      message: '',
      activatedAt: null,
      activatedBy: null,
      affectedAreas: 'All Campus',
    };

    try {
      // Sync to backend server for mobile app
      await apiService.deactivateEmergency();
      console.log('✅ Emergency deactivated and synced to backend');
    } catch (error) {
      console.error('Failed to sync deactivation to backend:', error);
    }

    setEmergencyStatus(newStatus);
    localStorage.setItem('emergencyStatus', JSON.stringify(newStatus));

    return { success: true, summary };
  };

  const getEmergencyTitle = (type) => {
    const titles = {
      fire: 'Fire Emergency',
      earthquake: 'Earthquake Alert',
      typhoon: 'Typhoon Warning',
      threat: 'Security Alert',
      health: 'Health Emergency',
      other: 'Emergency Alert',
    };
    return titles[type] || titles.other;
  };

  const getDefaultMessage = (type) => {
    const messages = {
      fire: 'Fire emergency detected. Please evacuate the building immediately using the nearest exit.',
      earthquake: 'Earthquake alert! Duck, cover, and hold. Evacuate after shaking stops.',
      typhoon: 'Typhoon warning in effect. Stay indoors and away from windows.',
      threat: 'Security threat reported. Follow instructions from security personnel.',
      health: 'Health emergency in progress. Avoid affected areas and follow medical guidance.',
      other: 'Emergency alert. Please follow evacuation procedures.',
    };
    return messages[type] || messages.other;
  };

  const calculateDuration = (startTime) => {
    if (!startTime) return '0 minutes';
    const start = new Date(startTime);
    const now = new Date();
    const diffMs = now - start;
    const diffMins = Math.floor(diffMs / 60000);
    const diffSecs = Math.floor((diffMs % 60000) / 1000);
    return `${diffMins} minutes ${diffSecs} seconds`;
  };

  const value = {
    emergencyStatus,
    evacuationStats,
    activateEmergency,
    deactivateEmergency,
  };

  return (
    <EmergencyContext.Provider value={value}>
      {children}
    </EmergencyContext.Provider>
  );
};

export default EmergencyContext;
