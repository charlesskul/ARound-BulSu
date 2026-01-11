import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useApp } from '../context/AppContext';
import { colors, spacing, borderRadius, shadows } from '../constants/theme';

const BuildingSearchScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { setSelectedBuilding, startNavigation, buildings, currentLocation } = useApp();
  const [searchQuery, setSearchQuery] = useState('');

  // Calculate distance for each building if we have current location
  const buildingsWithDistance = useMemo(() => {
    if (!buildings || buildings.length === 0) return [];
    
    return buildings.map(building => {
      let distance = building.distance || 0;
      
      // Calculate actual distance if we have current location
      if (currentLocation && building.coordinates) {
        const lat1 = currentLocation.latitude;
        const lon1 = currentLocation.longitude;
        const lat2 = building.coordinates.latitude;
        const lon2 = building.coordinates.longitude;
        
        if (lat2 && lon2) {
          // Haversine formula
          const R = 6371e3;
          const φ1 = lat1 * Math.PI / 180;
          const φ2 = lat2 * Math.PI / 180;
          const Δφ = (lat2 - lat1) * Math.PI / 180;
          const Δλ = (lon2 - lon1) * Math.PI / 180;
          const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
                    Math.cos(φ1) * Math.cos(φ2) *
                    Math.sin(Δλ/2) * Math.sin(Δλ/2);
          const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
          distance = Math.round(R * c);
        }
      }
      
      return { ...building, distance };
    });
  }, [buildings, currentLocation]);

  const filteredBuildings = useMemo(() => {
    if (!buildingsWithDistance || buildingsWithDistance.length === 0) return [];
    
    const query = searchQuery.toLowerCase().trim();
    if (!query) return buildingsWithDistance;
    
    return buildingsWithDistance.filter(building => {
      // Search by name
      const nameMatch = building.name?.toLowerCase().includes(query);
      
      // Search by offices
      const officeMatch = building.offices?.some(office => 
        office?.toLowerCase().includes(query)
      );
      
      // Search by description
      const descMatch = building.description?.toLowerCase().includes(query);
      
      // Search by type
      const typeMatch = building.type?.toLowerCase().includes(query);
      
      return nameMatch || officeMatch || descMatch || typeMatch;
    });
  }, [buildingsWithDistance, searchQuery]);

  // Sort by distance
  const sortedBuildings = useMemo(() => {
    return [...filteredBuildings].sort((a, b) => (a.distance || 0) - (b.distance || 0));
  }, [filteredBuildings]);

  const handleBuildingSelect = (building) => {
    setSelectedBuilding(building);
    navigation.goBack();
  };

  const renderBuildingItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.buildingItem}
      onPress={() => handleBuildingSelect(item)}
      activeOpacity={0.7}
    >
      <View style={styles.iconContainer}>
        <Ionicons 
          name={item.type === 'gate' ? 'enter-outline' : 'location-outline'} 
          size={24} 
          color={colors.gray[600]} 
        />
      </View>
      <View style={styles.buildingInfo}>
        <Text style={styles.buildingName}>{item.name || 'Unknown Building'}</Text>
        <Text style={styles.buildingDistance}>
          {item.distance ? `${item.distance}m away` : 'Distance unknown'}
        </Text>
        {item.type && item.type !== 'building_entrance' && (
          <Text style={styles.buildingType}>{item.type}</Text>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" />
      
      {/* Search Header */}
      <View style={styles.header}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color={colors.gray[400]} />
          <TextInput
            style={styles.searchInput}
            placeholder="Find Building or Office"
            placeholderTextColor={colors.gray[400]}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoFocus={true}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color={colors.gray[400]} />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity 
          style={styles.closeButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.closeButtonText}>Cancel</Text>
        </TouchableOpacity>
      </View>

      {/* Results count */}
      <View style={styles.resultsInfo}>
        <Text style={styles.resultsText}>
          {sortedBuildings.length} building{sortedBuildings.length !== 1 ? 's' : ''} found
        </Text>
      </View>

      {/* Building List */}
      <FlatList
        data={sortedBuildings}
        renderItem={renderBuildingItem}
        keyExtractor={(item, index) => item.nodeId || item.id?.toString() || `building-${index}`}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="search-outline" size={48} color={colors.gray[300]} />
            <Text style={styles.emptyText}>No buildings found</Text>
          </View>
        }
      />
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
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.gray[100],
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginRight: spacing.md,
  },
  searchInput: {
    flex: 1,
    marginLeft: spacing.sm,
    fontSize: 16,
    color: colors.gray[900],
  },
  closeButton: {
    paddingVertical: spacing.sm,
  },
  closeButtonText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '500',
  },
  listContent: {
    paddingVertical: spacing.sm,
  },
  buildingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  iconContainer: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buildingInfo: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  buildingName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.gray[900],
  },
  buildingDistance: {
    fontSize: 13,
    color: colors.gray[500],
    marginTop: 2,
  },
  buildingType: {
    fontSize: 11,
    color: colors.gray[400],
    marginTop: 2,
    textTransform: 'capitalize',
  },
  resultsInfo: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: colors.gray[50],
  },
  resultsText: {
    fontSize: 12,
    color: colors.gray[500],
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing['2xl'],
  },
  emptyText: {
    fontSize: 16,
    color: colors.gray[400],
    marginTop: spacing.md,
  },
});

export default BuildingSearchScreen;
