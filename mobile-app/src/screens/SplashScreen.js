import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  StatusBar,
  Dimensions,
} from 'react-native';
import { colors, typography } from '../constants/theme';

const { width, height } = Dimensions.get('window');

const SplashScreen = ({ navigation }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    // Animate the logo
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();

    // Navigate to Login screen after delay
    const timer = setTimeout(() => {
      navigation.replace('Login');
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      
      <Animated.View
        style={[
          styles.logoContainer,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <Text style={styles.logoTextAR}>ARound</Text>
        <Text style={styles.logoTextBulSU}>BulSU</Text>
      </Animated.View>
      
      <Animated.Text style={[styles.tagline, { opacity: fadeAnim }]}>
        Navigate Your Campus with AR
      </Animated.Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'flex-start',
  },
  logoTextAR: {
    fontSize: 56,
    fontWeight: '800',
    color: colors.white,
    letterSpacing: 2,
  },
  logoTextBulSU: {
    fontSize: 56,
    fontWeight: '800',
    color: colors.white,
    letterSpacing: 2,
    marginTop: -10,
  },
  tagline: {
    position: 'absolute',
    bottom: 100,
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default SplashScreen;
