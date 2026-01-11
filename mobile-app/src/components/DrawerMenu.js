import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Dimensions,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, spacing, borderRadius } from '../constants/theme';

const { width } = Dimensions.get('window');
const DRAWER_WIDTH = width * 0.75;

const DrawerMenu = ({ visible, onClose, navigation }) => {
  const insets = useSafeAreaInsets();

  const menuItems = [
    { icon: 'home', label: 'Home', screen: 'MainTabs' },
    { icon: 'navigate', label: 'Navigation', screen: 'Navigate' },
    { icon: 'warning', label: 'Emergency', screen: 'Emergency' },
    { icon: 'information-circle', label: 'Information', screen: 'Info' },
    { icon: 'settings', label: 'Settings', screen: null },
    { icon: 'help-circle', label: 'Help & Support', screen: null },
    { icon: 'document-text', label: 'About ARound BulSU', screen: null },
  ];

  const handleMenuPress = (screen) => {
    if (screen) {
      onClose();
      navigation.navigate(screen);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity 
          style={styles.overlayTouch} 
          activeOpacity={1} 
          onPress={onClose}
        />
        
        <View style={[styles.drawer, { paddingTop: insets.top }]}>
          {/* Header */}
          <View style={styles.drawerHeader}>
            <View style={styles.logoContainer}>
              <Text style={styles.logoTextAR}>ARound</Text>
              <Text style={styles.logoTextBulSU}>BulSU</Text>
            </View>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={28} color={colors.white} />
            </TouchableOpacity>
          </View>

          {/* Menu Items */}
          <View style={styles.menuContainer}>
            {menuItems.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={styles.menuItem}
                onPress={() => handleMenuPress(item.screen)}
                activeOpacity={0.7}
              >
                <Ionicons name={item.icon} size={24} color={colors.gray[700]} />
                <Text style={styles.menuItemText}>{item.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Footer */}
          <View style={styles.drawerFooter}>
            <Text style={styles.versionText}>Version 1.0.0</Text>
            <Text style={styles.copyrightText}>© 2024 Bulacan State University</Text>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    flexDirection: 'row',
  },
  overlayTouch: {
    flex: 1,
  },
  drawer: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: DRAWER_WIDTH,
    backgroundColor: colors.white,
  },
  drawerHeader: {
    backgroundColor: colors.primary,
    padding: spacing.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logoContainer: {
    flexDirection: 'column',
  },
  logoTextAR: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.white,
  },
  logoTextBulSU: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.white,
    marginTop: -5,
  },
  menuContainer: {
    flex: 1,
    paddingTop: spacing.lg,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  menuItemText: {
    marginLeft: spacing.lg,
    fontSize: 16,
    fontWeight: '500',
    color: colors.gray[800],
  },
  drawerFooter: {
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
  },
  versionText: {
    fontSize: 12,
    color: colors.gray[500],
    textAlign: 'center',
  },
  copyrightText: {
    fontSize: 11,
    color: colors.gray[400],
    textAlign: 'center',
    marginTop: spacing.xs,
  },
});

export default DrawerMenu;
