import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  StatusBar,
  Linking,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useApp } from '../context/AppContext';
import { emergencyContacts } from '../data/campusData';
import { colors, spacing, borderRadius, shadows } from '../constants/theme';

const InfoScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { buildings, isDataFromServer } = useApp();
  const [activeTab, setActiveTab] = useState('contacts'); // 'contacts' or 'buildings'

  const handleCallPress = (number) => {
    Linking.openURL(`tel:${number.replace(/[^0-9]/g, '')}`);
  };

  const handleBuildingPress = (building) => {
    navigation.navigate('BuildingDetails', { building });
  };

  const renderContactItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.contactItem}
      onPress={() => handleCallPress(item.number)}
      activeOpacity={0.7}
    >
      <View style={styles.contactInfo}>
        <Text style={styles.contactName}>{item.name}</Text>
        <Text style={styles.contactNumber}>{item.number}</Text>
      </View>
      <View style={styles.callButton}>
        <Ionicons name="call" size={20} color={colors.primary} />
      </View>
    </TouchableOpacity>
  );

  const renderBuildingItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.buildingItem}
      onPress={() => handleBuildingPress(item)}
      activeOpacity={0.7}
    >
      {/* Placeholder for building image */}
      <View style={styles.buildingImagePlaceholder}>
        <Ionicons name="business" size={32} color={colors.gray[400]} />
      </View>
      <Text style={styles.buildingItemName}>{item.name}</Text>
      <Ionicons name="chevron-forward" size={20} color={colors.gray[400]} />
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.menuButton}>
          <Ionicons name="menu" size={28} color={colors.gray[700]} />
        </TouchableOpacity>
      </View>

      {/* Tab Switcher */}
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'contacts' && styles.activeTab]}
          onPress={() => setActiveTab('contacts')}
        >
          <Text style={[styles.tabText, activeTab === 'contacts' && styles.activeTabText]}>
            Emergency Contacts
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'buildings' && styles.activeTab]}
          onPress={() => setActiveTab('buildings')}
        >
          <Text style={[styles.tabText, activeTab === 'buildings' && styles.activeTabText]}>
            Buildings
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      {activeTab === 'contacts' ? (
        <FlatList
          data={emergencyContacts}
          renderItem={renderContactItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <FlatList
          data={buildings || []}
          renderItem={renderBuildingItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  menuButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.md,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: colors.primary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.gray[500],
  },
  activeTabText: {
    color: colors.primary,
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: 100,
  },
  // Contact Item Styles
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.gray[900],
    marginBottom: 4,
  },
  contactNumber: {
    fontSize: 14,
    color: colors.gray[500],
  },
  callButton: {
    width: 40,
    height: 40,
    backgroundColor: colors.gray[100],
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Building Item Styles
  buildingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  buildingImagePlaceholder: {
    width: 60,
    height: 60,
    backgroundColor: colors.gray[100],
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  buildingItemName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: colors.gray[900],
  },
});

export default InfoScreen;
