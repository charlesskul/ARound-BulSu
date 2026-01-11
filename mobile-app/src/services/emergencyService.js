// Emergency Service - Handles emergency notifications from admin app
// In production, this would connect to a backend server/Firebase

import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

// API base URL - Change this to your server IP for real sync
const API_BASE_URL = 'http://192.168.254.104:3001/api';

// Storage keys
const EMERGENCY_STATE_KEY = '@emergency_state';
const PUSH_TOKEN_KEY = '@push_token';

// Configure notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

class EmergencyService {
  constructor() {
    this.listeners = [];
    this.currentEmergency = null;
    this.pushToken = null;
  }

  // Subscribe to emergency updates
  subscribe(callback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(cb => cb !== callback);
    };
  }

  // Notify all subscribers
  notifyListeners(emergency) {
    this.listeners.forEach(callback => callback(emergency));
  }

  // Initialize the service
  async initialize() {
    try {
      // Load cached emergency state
      const cachedState = await AsyncStorage.getItem(EMERGENCY_STATE_KEY);
      if (cachedState) {
        this.currentEmergency = JSON.parse(cachedState);
        this.notifyListeners(this.currentEmergency);
      }

      // Try to register for push notifications (will gracefully fail in Expo Go)
      await this.registerForPushNotifications();

      // Start polling for emergency updates (works in Expo Go and production)
      this.startPolling();
      
      // Do an immediate check
      await this.checkEmergencyStatus();

      console.log('Emergency service initialized');
    } catch (error) {
      console.log('Emergency service initialization warning:', error.message);
      // Still start polling even if there was an error
      this.startPolling();
    }
  }

  // Register for push notifications
  async registerForPushNotifications() {
    try {
      // Check if we're in Expo Go - push notifications don't work there in SDK 53+
      const isExpoGo = Constants.appOwnership === 'expo';
      
      if (isExpoGo) {
        console.log('Push notifications are not supported in Expo Go (SDK 53+). Using polling instead.');
        console.log('For full notification support, use a development build.');
        return;
      }

      // Request permissions
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.log('Push notification permission not granted');
        return;
      }

      // Get project ID from app config
      const projectId = Constants.expoConfig?.extra?.eas?.projectId || 
                        Constants.easConfig?.projectId;
      
      if (!projectId) {
        console.log('No projectId found. Push notifications require EAS configuration.');
        console.log('App will use polling for emergency updates instead.');
        return;
      }

      const token = await Notifications.getExpoPushTokenAsync({ projectId });
      this.pushToken = token.data;

      // Save token locally
      await AsyncStorage.setItem(PUSH_TOKEN_KEY, this.pushToken);

      console.log('Push token:', this.pushToken);
    } catch (error) {
      // Don't crash the app - just log and continue with polling
      console.log('Push notifications not available:', error.message);
      console.log('App will use polling for emergency updates instead.');
    }
  }

  // Poll server for emergency updates (fallback mechanism)
  startPolling() {
    // Poll every 5 seconds for faster sync (reduced from 10)
    this.pollInterval = setInterval(async () => {
      await this.checkEmergencyStatus();
    }, 5000);
    
    console.log('🚨 Emergency polling started (every 5 seconds)');
  }

  stopPolling() {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      console.log('🚨 Emergency polling stopped');
    }
  }

  // Force an immediate check (useful when app comes to foreground)
  async forceCheck() {
    console.log('🚨 Forcing emergency status check...');
    return await this.checkEmergencyStatus();
  }

  // Check emergency status from server
  async checkEmergencyStatus() {
    try {
      // Fetch emergency status from backend server with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
      
      const response = await fetch(`${API_BASE_URL}/emergency`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        const data = await response.json();
        
        // Check if the isActive state has changed
        const wasActive = this.currentEmergency?.isActive || false;
        const isNowActive = data.isActive || false;
        
        // Log for debugging
        console.log('Emergency check - Server:', isNowActive, 'Local:', wasActive);
        
        if (isNowActive && !wasActive) {
          // Emergency was just activated
          console.log('🚨 Emergency ACTIVATED - syncing to app');
          await this.updateEmergencyState(data);
        } else if (!isNowActive && wasActive) {
          // Emergency was just deactivated
          console.log('✅ Emergency DEACTIVATED - clearing from app');
          await this.clearEmergency();
        } else if (isNowActive && wasActive) {
          // Emergency still active but might have updated info
          const hasDataChanged = JSON.stringify(data) !== JSON.stringify(this.currentEmergency);
          if (hasDataChanged) {
            console.log('📝 Emergency updated - syncing changes');
            await this.updateEmergencyState(data);
          }
        }
      }
    } catch (error) {
      // Server might not be reachable - this is fine, just log it
      console.log('Could not reach emergency server:', error.message);
    }
  }

  // Update emergency state (called when receiving push notification or polling)
  async updateEmergencyState(emergency) {
    this.currentEmergency = emergency;
    
    // Save to local storage
    await AsyncStorage.setItem(EMERGENCY_STATE_KEY, JSON.stringify(emergency));
    
    // Notify all subscribers
    this.notifyListeners(emergency);

    // Show local notification if app is in background
    if (emergency.isActive) {
      await this.showEmergencyNotification(emergency);
    }
  }

  // Show local emergency notification
  async showEmergencyNotification(emergency) {
    try {
      // Request permission first
      const { status } = await Notifications.getPermissionsAsync();
      if (status !== 'granted') {
        const { status: newStatus } = await Notifications.requestPermissionsAsync();
        if (newStatus !== 'granted') {
          console.log('Notification permission not granted');
          return;
        }
      }
      
      await Notifications.scheduleNotificationAsync({
        content: {
          title: `🚨 ${emergency.title || 'EMERGENCY ALERT'}`,
          body: emergency.message || 'An emergency has been declared on campus.',
          data: { emergency },
          sound: true,
          priority: Notifications.AndroidNotificationPriority.MAX,
        },
        trigger: null, // Show immediately
      });
      console.log('🚨 Emergency notification shown');
    } catch (error) {
      console.log('Failed to show notification:', error.message);
    }
  }

  // Get current emergency state
  getCurrentEmergency() {
    return this.currentEmergency;
  }

  // Clear emergency state (when admin deactivates emergency)
  async clearEmergency() {
    this.currentEmergency = null;
    await AsyncStorage.removeItem(EMERGENCY_STATE_KEY);
    this.notifyListeners(null);
  }

  // Cleanup
  destroy() {
    this.stopPolling();
    this.listeners = [];
  }
}

// Singleton instance
export const emergencyService = new EmergencyService();

// Emergency types
export const EMERGENCY_TYPES = {
  EARTHQUAKE: 'earthquake',
  FIRE: 'fire',
  FLOOD: 'flood',
  EVACUATION: 'evacuation',
  OTHER: 'other',
};

// Emergency type display info
export const EMERGENCY_INFO = {
  earthquake: {
    icon: 'earth',
    color: '#DC2626',
    title: 'Earthquake Alert',
    instructions: [
      'Drop, Cover, and Hold On',
      'Stay away from windows and heavy furniture',
      'If indoors, stay inside until shaking stops',
      'Once shaking stops, evacuate to open areas',
    ],
  },
  fire: {
    icon: 'flame',
    color: '#EA580C',
    title: 'Fire Alert',
    instructions: [
      'Activate the nearest fire alarm',
      'Evacuate immediately using stairs (not elevators)',
      'Stay low if there is smoke',
      'Proceed to the nearest evacuation area',
    ],
  },
  flood: {
    icon: 'water',
    color: '#2563EB',
    title: 'Flood Warning',
    instructions: [
      'Move to higher ground immediately',
      'Avoid walking through flood waters',
      'Stay away from electrical equipment',
      'Wait for official clearance before returning',
    ],
  },
  evacuation: {
    icon: 'exit',
    color: '#7C3AED',
    title: 'General Evacuation',
    instructions: [
      'Remain calm and follow instructions',
      'Proceed to the nearest evacuation area',
      'Help others who need assistance',
      'Do not return until given clearance',
    ],
  },
  other: {
    icon: 'warning',
    color: '#B91C1C',
    title: 'Emergency Alert',
    instructions: [
      'Follow official instructions',
      'Stay calm and alert',
      'Proceed to designated safe areas',
      'Wait for further updates',
    ],
  },
};

export default emergencyService;
