import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  useColorScheme,
  ActivityIndicator,
  Animated,
} from 'react-native';
import React, {useRef} from 'react';
import LinearGradient from 'react-native-linear-gradient';
import {
  DARK_BACKGROUND,
  REGULAR_FONT,
  WHITE_BACKGROUND,
  WHITE_COLOR,
  GRADIENTS,
  BORDER_RADIUS,
  SPACING,
  SHADOWS,
} from '../utils/const';

export default function BottomButton({label, action, isLoading, disabled}) {
  const isDarkMode = useColorScheme() === 'dark';
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.98,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 3,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };
  
  return (
    <View style={styles.bottom(isDarkMode)}>
      <Animated.View style={{transform: [{scale: scaleAnim}]}}>
        <TouchableOpacity
          style={styles.buttonContainer}
          onPress={action}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          disabled={isLoading || disabled}
          activeOpacity={0.9}>
          <LinearGradient
            colors={disabled || isLoading ? ['#94a3b8', '#64748b'] : GRADIENTS.primary}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 0}}
            style={styles.gradientButton}>
            {isLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color="#ffffff" />
                <Text style={styles.buttonText}>Memuat...</Text>
              </View>
            ) : (
              <Text style={styles.buttonText}>{label}</Text>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  bottom: isDarkMode => ({
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: isDarkMode ? DARK_BACKGROUND : WHITE_BACKGROUND,
    padding: SPACING.lg,
    paddingBottom: Platform.OS === 'ios' ? 34 : SPACING.xl,
    ...SHADOWS.medium,
  }),
  buttonContainer: {
    borderRadius: BORDER_RADIUS.medium,
    overflow: 'hidden',
  },
  gradientButton: {
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.xl,
    borderRadius: BORDER_RADIUS.medium,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.md,
  },
  buttonText: {
    color: WHITE_COLOR,
    fontFamily: REGULAR_FONT,
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
});

