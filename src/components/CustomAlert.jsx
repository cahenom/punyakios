import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  Modal,
  TouchableOpacity,
  useColorScheme,
  Animated,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {
  BOLD_FONT,
  REGULAR_FONT,
  DARK_BACKGROUND,
  WHITE_BACKGROUND,
  DARK_COLOR,
  LIGHT_COLOR,
  WHITE_COLOR,
  GRADIENTS,
  BORDER_RADIUS,
  SPACING,
  SHADOWS,
} from '../utils/const';

export default function CustomAlert({
  visible,
  title,
  message,
  type = 'info', // 'success', 'error', 'warning', 'info'
  buttons = [],
  onDismiss,
}) {
  const isDarkMode = useColorScheme() === 'dark';
  const scaleAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (visible) {
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 50,
        friction: 7,
      }).start();
    } else {
      scaleAnim.setValue(0);
    }
  }, [visible]);

  const getGradient = () => {
    return GRADIENTS.primary;
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return '✓';
      case 'error':
        return '✕';
      case 'warning':
        return '⚠';
      default:
        return 'ℹ';
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onDismiss}>
      <View style={styles.overlay}>
        <Animated.View
          style={[
            styles.container(isDarkMode),
            {
              transform: [{scale: scaleAnim}],
            },
          ]}>
          {/* Icon with Gradient */}
          <LinearGradient
            colors={getGradient()}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 1}}
            style={styles.iconContainer}>
            <Text style={styles.icon}>{getIcon()}</Text>
          </LinearGradient>

          {/* Title */}
          {title && <Text style={styles.title(isDarkMode)}>{title}</Text>}

          {/* Message */}
          {message && <Text style={styles.message(isDarkMode)}>{message}</Text>}

          {/* Buttons */}
          <View style={styles.buttonContainer}>
            {buttons.length > 0 ? (
              buttons.map((button, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => {
                    button.onPress?.();
                    onDismiss?.();
                  }}
                  style={styles.buttonWrapper}
                  activeOpacity={0.8}>
                  {button.style === 'primary' ? (
                    <LinearGradient
                      colors={getGradient()}
                      start={{x: 0, y: 0}}
                      end={{x: 1, y: 0}}
                      style={styles.button}>
                      <Text style={styles.buttonTextPrimary}>
                        {button.text}
                      </Text>
                    </LinearGradient>
                  ) : (
                    <View style={styles.buttonSecondary(isDarkMode)}>
                      <Text style={styles.buttonTextSecondary(isDarkMode)}>
                        {button.text}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))
            ) : (
              <TouchableOpacity
                onPress={onDismiss}
                style={styles.buttonWrapper}
                activeOpacity={0.8}>
                <LinearGradient
                  colors={getGradient()}
                  start={{x: 0, y: 0}}
                  end={{x: 1, y: 0}}
                  style={styles.button}>
                  <Text style={styles.buttonTextPrimary}>OK</Text>
                </LinearGradient>
              </TouchableOpacity>
            )}
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  container: isDarkMode => ({
    backgroundColor: isDarkMode ? DARK_BACKGROUND : WHITE_BACKGROUND,
    borderRadius: BORDER_RADIUS.xlarge,
    padding: SPACING.xxxl,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    ...SHADOWS.large,
  }),
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  icon: {
    fontSize: 32,
    color: WHITE_COLOR,
    fontFamily: BOLD_FONT,
  },
  title: isDarkMode => ({
    fontFamily: BOLD_FONT,
    fontSize: 20,
    color: isDarkMode ? DARK_COLOR : LIGHT_COLOR,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  }),
  message: isDarkMode => ({
    fontFamily: REGULAR_FONT,
    fontSize: 14,
    color: isDarkMode ? DARK_COLOR : LIGHT_COLOR,
    marginBottom: SPACING.xl,
    textAlign: 'center',
    lineHeight: 20,
  }),
  buttonContainer: {
    flexDirection: 'row',
    gap: SPACING.md,
    width: '100%',
  },
  buttonWrapper: {
    flex: 1,
  },
  button: {
    paddingVertical: SPACING.lg,
    borderRadius: BORDER_RADIUS.medium,
    alignItems: 'center',
  },
  buttonTextPrimary: {
    fontFamily: BOLD_FONT,
    fontSize: 16,
    color: WHITE_COLOR,
  },
  buttonSecondary: isDarkMode => ({
    paddingVertical: SPACING.lg,
    borderRadius: BORDER_RADIUS.medium,
    alignItems: 'center',
    backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
  }),
  buttonTextSecondary: isDarkMode => ({
    fontFamily: BOLD_FONT,
    fontSize: 16,
    color: isDarkMode ? DARK_COLOR : LIGHT_COLOR,
  }),
});
