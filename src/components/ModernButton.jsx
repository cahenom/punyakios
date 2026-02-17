import React, {useRef} from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  View,
  Animated,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {
  WHITE_COLOR,
  BOLD_FONT,
  GRADIENTS,
  BORDER_RADIUS,
  SPACING,
} from '../utils/const';

export default function ModernButton({
  label,
  onPress,
  isLoading = false,
  disabled = false,
  gradient = GRADIENTS.primary,
  style,
  textStyle,
}) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.97,
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
    <Animated.View style={[{transform: [{scale: scaleAnim}]}, style]}>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={isLoading || disabled}
        activeOpacity={0.9}
        style={styles.container}>
        <LinearGradient
          colors={disabled || isLoading ? ['#94a3b8', '#64748b'] : gradient}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 0}}
          style={styles.gradient}>
          {isLoading ? (
            <View style={styles.content}>
              <ActivityIndicator size="small" color={WHITE_COLOR} />
              <Text style={[styles.text, textStyle]}>Memuat...</Text>
            </View>
          ) : (
            <Text style={[styles.text, textStyle]}>{label}</Text>
          )}
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: BORDER_RADIUS.medium,
    overflow: 'hidden',
    height: 50,
  },
  gradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  text: {
    color: WHITE_COLOR,
    fontFamily: BOLD_FONT,
    fontSize: 16,
    textAlign: 'center',
  },
});
