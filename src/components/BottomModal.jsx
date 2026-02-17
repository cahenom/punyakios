import {
  StyleSheet,
  Text,
  View,
  Modal,
  TouchableWithoutFeedback,
  TouchableOpacity,
  useColorScheme,
  Animated,
} from 'react-native';
import React, {useEffect, useRef} from 'react';
import {
  BOLD_FONT,
  WHITE_BACKGROUND,
  DARK_BACKGROUND,
  DARK_COLOR,
  LIGHT_COLOR,
  windowWidth,
  BORDER_RADIUS,
  SPACING,
  SHADOWS,
} from '../utils/const';
import {XClose} from '../assets';

export default function BottomModal({visible, onDismis, title, children}) {
  const isDarkMode = useColorScheme() === 'dark';
  const slideAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 1,
          useNativeDriver: true,
          tension: 65,
          friction: 11,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const translateY = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [600, 0],
  });

  return (
    <Modal
      visible={visible}
      animationType="none"
      onRequestClose={onDismis}
      transparent={true}>
      <TouchableWithoutFeedback onPress={onDismis}>
        <Animated.View
          style={[
            styles.backdrop,
            {
              opacity: fadeAnim,
            },
          ]}
        />
      </TouchableWithoutFeedback>
      <Animated.View
        style={[
          styles.modalContainer(isDarkMode),
          {
            transform: [{translateY}],
          },
        ]}>
        <View style={styles.dragIndicatorContainer}>
          <View style={styles.dragIndicator(isDarkMode)} />
        </View>
        <View style={styles.header}>
          <Text style={styles.title(isDarkMode)}>{title}</Text>
          <TouchableOpacity style={styles.closeButton} onPress={onDismis}>
            <XClose width={20} height={20} />
          </TouchableOpacity>
        </View>
        <View style={styles.content}>{children}</View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    position: 'absolute',
    bottom: 0,
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  modalContainer: isDarkMode => ({
    backgroundColor: isDarkMode ? DARK_BACKGROUND : WHITE_BACKGROUND,
    minHeight: '50%',
    maxHeight: '90%',
    position: 'absolute',
    width: windowWidth,
    bottom: 0,
    borderTopLeftRadius: BORDER_RADIUS.xlarge,
    borderTopRightRadius: BORDER_RADIUS.xlarge,
    paddingTop: SPACING.sm,
    paddingHorizontal: SPACING.xl,
    paddingBottom: SPACING.xl,
    ...SHADOWS.large,
  }),
  dragIndicatorContainer: {
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  dragIndicator: isDarkMode => ({
    width: 40,
    height: 4,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: isDarkMode ? '#4a5568' : '#cbd5e0',
  }),
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
    paddingTop: SPACING.sm,
  },
  title: isDarkMode => ({
    fontFamily: BOLD_FONT,
    fontSize: 18,
    color: isDarkMode ? DARK_COLOR : LIGHT_COLOR,
  }),
  closeButton: {
    position: 'absolute',
    right: 0,
    padding: SPACING.sm,
  },
  content: {
    flex: 1,
  },
});

