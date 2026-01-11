import React from 'react';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';
import { colors, spacing } from '../constants/theme';

const LoadingIndicator = ({ message = 'Loading...', size = 'large', color = colors.primary }) => {
  return (
    <View style={styles.container}>
      <ActivityIndicator size={size} color={color} />
      {message && <Text style={styles.message}>{message}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.white,
  },
  message: {
    marginTop: spacing.lg,
    fontSize: 14,
    color: colors.gray[600],
  },
});

export default LoadingIndicator;
