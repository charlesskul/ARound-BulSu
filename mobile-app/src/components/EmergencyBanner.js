import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useApp } from '../context/AppContext';
import { colors } from '../constants/theme';

const { width } = Dimensions.get('window');

const EmergencyBanner = () => {
  const { isEmergencyMode, emergencyData, getEmergencyInfo } = useApp();
  const navigation = useNavigation();
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(-100)).current;

  useEffect(() => {
    if (isEmergencyMode) {
      // Slide in animation
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }).start();

      // Pulsing animation
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.05,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      );
      pulse.start();

      return () => pulse.stop();
    } else {
      // Slide out animation
      Animated.timing(slideAnim, {
        toValue: -100,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [isEmergencyMode]);

  if (!isEmergencyMode || !emergencyData) return null;

  const emergencyInfo = getEmergencyInfo();

  const handleNavigateToEvacuation = () => {
    navigation.navigate('AREmergency');
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [
            { translateY: slideAnim },
            { scale: pulseAnim },
          ],
          backgroundColor: emergencyInfo?.color || colors.danger,
        },
      ]}
    >
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Ionicons 
            name={emergencyInfo?.icon || 'warning'} 
            size={24} 
            color={colors.white} 
          />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.title}>{emergencyInfo?.title || 'Emergency Alert'}</Text>
          <Text style={styles.message} numberOfLines={1}>
            {emergencyData.message || 'Please follow evacuation instructions'}
          </Text>
        </View>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={handleNavigateToEvacuation}
        >
          <Text style={styles.actionText}>Evacuate</Text>
          <Ionicons name="arrow-forward" size={16} color={colors.white} />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

// Full screen emergency modal for critical alerts
export const EmergencyModal = ({ visible, onDismiss }) => {
  const { emergencyData, getEmergencyInfo } = useApp();
  const navigation = useNavigation();
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  if (!emergencyData) return null;

  const emergencyInfo = getEmergencyInfo();

  const handleNavigateToEvacuation = () => {
    onDismiss();
    navigation.navigate('AREmergency');
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
    >
      <Animated.View style={[styles.modalOverlay, { opacity: opacityAnim }]}>
        <Animated.View 
          style={[
            styles.modalContainer,
            { transform: [{ scale: scaleAnim }] },
          ]}
        >
          {/* Alert Icon */}
          <View style={[styles.modalIconContainer, { backgroundColor: emergencyInfo?.color || colors.danger }]}>
            <Ionicons 
              name={emergencyInfo?.icon || 'warning'} 
              size={48} 
              color={colors.white} 
            />
          </View>

          {/* Title */}
          <Text style={styles.modalTitle}>{emergencyInfo?.title || 'Emergency Alert'}</Text>
          
          {/* Message */}
          <Text style={styles.modalMessage}>
            {emergencyData.message || 'An emergency has been declared. Please follow the evacuation instructions.'}
          </Text>

          {/* Instructions */}
          <View style={styles.instructionsContainer}>
            <Text style={styles.instructionsTitle}>What to do:</Text>
            {emergencyInfo?.instructions?.map((instruction, index) => (
              <View key={index} style={styles.instructionRow}>
                <Text style={styles.instructionNumber}>{index + 1}.</Text>
                <Text style={styles.instructionText}>{instruction}</Text>
              </View>
            ))}
          </View>

          {/* Action Buttons */}
          <TouchableOpacity 
            style={[styles.modalButton, { backgroundColor: emergencyInfo?.color || colors.danger }]}
            onPress={handleNavigateToEvacuation}
          >
            <Ionicons name="navigate" size={22} color={colors.white} />
            <Text style={styles.modalButtonText}>Navigate to Safe Zone</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.dismissButton}
            onPress={onDismiss}
          >
            <Text style={styles.dismissText}>I Understand</Text>
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    paddingTop: 50,
    paddingBottom: 12,
    paddingHorizontal: 16,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
    marginLeft: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.white,
  },
  message: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 2,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.white,
    marginRight: 4,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContainer: {
    backgroundColor: colors.white,
    borderRadius: 24,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
  },
  modalIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  modalMessage: {
    fontSize: 16,
    color: colors.textLight,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 20,
  },
  instructionsContainer: {
    width: '100%',
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  instructionsTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
  },
  instructionRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  instructionNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
    width: 20,
  },
  instructionText: {
    fontSize: 14,
    color: colors.textLight,
    flex: 1,
  },
  modalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    width: '100%',
    marginBottom: 12,
  },
  modalButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.white,
    marginLeft: 8,
  },
  dismissButton: {
    paddingVertical: 12,
  },
  dismissText: {
    fontSize: 16,
    color: colors.textLight,
    fontWeight: '600',
  },
});

export default EmergencyBanner;
