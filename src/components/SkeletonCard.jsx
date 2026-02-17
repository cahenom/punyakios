import React, {useEffect, useRef} from 'react';
import {View, StyleSheet, Animated, useColorScheme} from 'react-native';

const SkeletonCard = ({style}) => {
  const isDarkMode = useColorScheme() === 'dark';
  const animatedValue = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0.5,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, [animatedValue]);

  return (
    <Animated.View
      style={[
        styles.skeletonCard,
        {
          backgroundColor: isDarkMode ? '#2d3748' : '#e2e8f0',
          opacity: animatedValue,
        },
        style,
      ]}
    />
  );
};

const styles = StyleSheet.create({
  skeletonCard: {
    height: 60,
    borderRadius: 12,
    marginVertical: 4,
  },
});

export default SkeletonCard;