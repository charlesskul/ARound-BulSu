import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, shadows } from '../constants/theme';

// Custom Button Component
export const Button = ({ 
  title, 
  onPress, 
  variant = 'primary', 
  icon, 
  style,
  textStyle,
  disabled = false 
}) => {
  const getButtonStyle = () => {
    switch (variant) {
      case 'secondary':
        return styles.secondaryButton;
      case 'outline':
        return styles.outlineButton;
      case 'danger':
        return styles.dangerButton;
      default:
        return styles.primaryButton;
    }
  };

  const getTextStyle = () => {
    switch (variant) {
      case 'outline':
        return styles.outlineButtonText;
      default:
        return styles.buttonText;
    }
  };

  return (
    <TouchableOpacity
      style={[getButtonStyle(), disabled && styles.disabledButton, style]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
    >
      {icon && <Ionicons name={icon} size={20} color={colors.white} style={styles.buttonIcon} />}
      <Text style={[getTextStyle(), textStyle]}>{title}</Text>
    </TouchableOpacity>
  );
};

// Card Component
export const Card = ({ children, style }) => (
  <View style={[styles.card, style]}>
    {children}
  </View>
);

// Section Header
export const SectionHeader = ({ title, rightElement }) => (
  <View style={styles.sectionHeader}>
    <Text style={styles.sectionTitle}>{title}</Text>
    {rightElement}
  </View>
);

// List Item
export const ListItem = ({ icon, title, subtitle, onPress, rightElement }) => (
  <TouchableOpacity style={styles.listItem} onPress={onPress} activeOpacity={0.7}>
    {icon && (
      <View style={styles.listItemIcon}>
        <Ionicons name={icon} size={24} color={colors.gray[600]} />
      </View>
    )}
    <View style={styles.listItemContent}>
      <Text style={styles.listItemTitle}>{title}</Text>
      {subtitle && <Text style={styles.listItemSubtitle}>{subtitle}</Text>}
    </View>
    {rightElement || <Ionicons name="chevron-forward" size={20} color={colors.gray[400]} />}
  </TouchableOpacity>
);

// Badge Component
export const Badge = ({ text, variant = 'default' }) => {
  const getBadgeStyle = () => {
    switch (variant) {
      case 'success':
        return styles.successBadge;
      case 'warning':
        return styles.warningBadge;
      case 'danger':
        return styles.dangerBadge;
      default:
        return styles.defaultBadge;
    }
  };

  return (
    <View style={[styles.badge, getBadgeStyle()]}>
      <Text style={styles.badgeText}>{text}</Text>
    </View>
  );
};

// Chip/Tag Component
export const Chip = ({ label, onPress, selected = false }) => (
  <TouchableOpacity
    style={[styles.chip, selected && styles.chipSelected]}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{label}</Text>
  </TouchableOpacity>
);

// Divider
export const Divider = ({ style }) => <View style={[styles.divider, style]} />;

// Empty State
export const EmptyState = ({ icon, title, description }) => (
  <View style={styles.emptyState}>
    <Ionicons name={icon} size={64} color={colors.gray[300]} />
    <Text style={styles.emptyStateTitle}>{title}</Text>
    <Text style={styles.emptyStateDescription}>{description}</Text>
  </View>
);

const styles = StyleSheet.create({
  // Button Styles
  primaryButton: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.lg,
    ...shadows.sm,
  },
  secondaryButton: {
    backgroundColor: colors.gray[200],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.lg,
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.lg,
  },
  dangerButton: {
    backgroundColor: colors.emergencyRed,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.lg,
  },
  disabledButton: {
    opacity: 0.5,
  },
  buttonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  outlineButtonText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  buttonIcon: {
    marginRight: spacing.sm,
  },

  // Card Styles
  card: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    ...shadows.md,
  },

  // Section Header
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.gray[900],
  },

  // List Item
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  listItemIcon: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  listItemContent: {
    flex: 1,
  },
  listItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.gray[900],
  },
  listItemSubtitle: {
    fontSize: 13,
    color: colors.gray[500],
    marginTop: 2,
  },

  // Badge
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  defaultBadge: {
    backgroundColor: colors.gray[200],
  },
  successBadge: {
    backgroundColor: colors.success,
  },
  warningBadge: {
    backgroundColor: colors.warning,
  },
  dangerBadge: {
    backgroundColor: colors.emergencyRed,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.white,
  },

  // Chip
  chip: {
    backgroundColor: colors.gray[100],
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginRight: spacing.sm,
    marginBottom: spacing.sm,
  },
  chipSelected: {
    backgroundColor: colors.primary,
  },
  chipText: {
    fontSize: 13,
    color: colors.gray[700],
  },
  chipTextSelected: {
    color: colors.white,
  },

  // Divider
  divider: {
    height: 1,
    backgroundColor: colors.gray[200],
    marginVertical: spacing.md,
  },

  // Empty State
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing['2xl'],
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.gray[700],
    marginTop: spacing.lg,
  },
  emptyStateDescription: {
    fontSize: 14,
    color: colors.gray[500],
    textAlign: 'center',
    marginTop: spacing.sm,
  },
});
