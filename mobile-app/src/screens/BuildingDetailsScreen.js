import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Image,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useApp } from '../context/AppContext';
import { colors, spacing, borderRadius, shadows } from '../constants/theme';

const { width } = Dimensions.get('window');

const BuildingDetailsScreen = ({ navigation, route }) => {
  const insets = useSafeAreaInsets();
  const { startNavigation } = useApp();
  const { building } = route.params;

  const handleNavigate = () => {
    startNavigation(building);
    navigation.navigate('ARNavigation');
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={28} color={colors.gray[700]} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{building.name}</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Building Image */}
        <View style={styles.imageContainer}>
          {building.image ? (
            <Image source={building.image} style={styles.buildingImage} />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Ionicons name="business" size={64} color={colors.gray[400]} />
              <Text style={styles.imagePlaceholderText}>{building.name}</Text>
            </View>
          )}
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.description}>{building.description}</Text>
        </View>

        {/* Offices/Departments */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>In this building:</Text>
          <View style={styles.officesContainer}>
            {building.offices.map((office, index) => (
              <View key={index} style={styles.officeTag}>
                <Text style={styles.officeTagText}>{office}</Text>
              </View>
            ))}
            {building.offices.length > 4 && (
              <TouchableOpacity style={styles.seeMoreTag}>
                <Text style={styles.seeMoreText}>see more...</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Evacuation Map */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Evacuation Map</Text>
          <View style={styles.evacuationMapContainer}>
            <View style={styles.evacuationMapPlaceholder}>
              <Ionicons name="map" size={48} color={colors.gray[400]} />
              <Text style={styles.evacuationMapText}>EVACUATION PLAN</Text>
              <Text style={styles.evacuationMapSubtext}>{building.name}</Text>
            </View>
          </View>
        </View>

        {/* Evacuation Area */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>EVACUATION AREA</Text>
          <View style={styles.evacuationAreaCard}>
            <Ionicons name="location" size={24} color={colors.primary} />
            <Text style={styles.evacuationAreaText}>{building.evacuationArea}</Text>
          </View>
        </View>

        {/* Building Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Building Information</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Floors:</Text>
            <Text style={styles.infoValue}>{building.floorCount}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Distance:</Text>
            <Text style={styles.infoValue}>{building.distance}m away</Text>
          </View>
        </View>
      </ScrollView>

      {/* Navigate Button */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 100 }]}>
        <TouchableOpacity style={styles.navigateButton} onPress={handleNavigate}>
          <Ionicons name="navigate" size={20} color={colors.white} />
          <Text style={styles.navigateButtonText}>Navigate to {building.name}</Text>
        </TouchableOpacity>
      </View>
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
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.gray[900],
    flex: 1,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 44,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing['3xl'],
  },
  imageContainer: {
    width: width,
    height: 200,
    backgroundColor: colors.gray[100],
  },
  buildingImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imagePlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.gray[200],
  },
  imagePlaceholderText: {
    marginTop: spacing.md,
    fontSize: 18,
    fontWeight: '600',
    color: colors.gray[500],
  },
  section: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.gray[500],
    marginBottom: spacing.md,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  description: {
    fontSize: 15,
    color: colors.gray[700],
    lineHeight: 22,
  },
  officesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  officeTag: {
    backgroundColor: colors.gray[100],
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginRight: spacing.sm,
    marginBottom: spacing.sm,
  },
  officeTagText: {
    fontSize: 13,
    color: colors.gray[700],
  },
  seeMoreTag: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
  },
  seeMoreText: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: '500',
  },
  evacuationMapContainer: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  evacuationMapPlaceholder: {
    height: 150,
    backgroundColor: colors.gray[50],
    justifyContent: 'center',
    alignItems: 'center',
  },
  evacuationMapText: {
    marginTop: spacing.sm,
    fontSize: 14,
    fontWeight: '700',
    color: colors.gray[500],
  },
  evacuationMapSubtext: {
    fontSize: 12,
    color: colors.gray[400],
  },
  evacuationAreaCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.gray[50],
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
  },
  evacuationAreaText: {
    marginLeft: spacing.md,
    fontSize: 16,
    fontWeight: '600',
    color: colors.gray[800],
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
  },
  infoLabel: {
    fontSize: 14,
    color: colors.gray[500],
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.gray[800],
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.white,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.gray[100],
    ...shadows.lg,
  },
  navigateButton: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.xl,
  },
  navigateButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: spacing.sm,
  },
});

export default BuildingDetailsScreen;
