import {
  StyleSheet,
  Text,
  View,
  TextInput,
  useColorScheme,
  TouchableOpacity,
  Animated,
} from 'react-native';
import React, {useRef, useEffect} from 'react';
import {
  DARK_BACKGROUND,
  GREY_COLOR,
  RED_COLOR,
  REGULAR_FONT,
  SLATE_COLOR,
  DARK_COLOR,
  LIGHT_COLOR,
  WHITE_BACKGROUND,
  BLUE_COLOR,
  BORDER_RADIUS,
  SPACING,
  SHADOWS,
} from '../../utils/const';
import {XClose} from '../../assets';

export default function Input({
  value,
  placeholder,
  onchange,
  type,
  ondelete,
  lebar,
  hasError = false,
  rightIcon,
  onRightAction,
  disabledRightAction = false,
}) {
  const isDarkMode = useColorScheme() === 'dark';
  const [isFocused, setIsFocused] = React.useState(false);
  const labelAnimation = useRef(new Animated.Value(value ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(labelAnimation, {
      toValue: isFocused || value ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [isFocused, value]);

  const labelStyle = {
    top: labelAnimation.interpolate({
      inputRange: [0, 1],
      outputRange: [16, -8],
    }),
    fontSize: labelAnimation.interpolate({
      inputRange: [0, 1],
      outputRange: [14, 12],
    }),
  };

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.inputWrapper(isDarkMode, isFocused),
          hasError && styles.errorBorder,
          lebar && {width: lebar},
        ]}>
        <Animated.Text
          style={[
            styles.label(isDarkMode, isFocused, hasError),
            labelStyle,
          ]}>
          {placeholder}
        </Animated.Text>
        <TextInput
          placeholder={isFocused ? '' : placeholder}
          placeholderTextColor={isDarkMode ? SLATE_COLOR : GREY_COLOR}
          keyboardType={type ? type : 'default'}
          value={value}
          onChangeText={onchange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          style={styles.input(isDarkMode, !!rightIcon)}
        />
        {value && !rightIcon && (
          <TouchableOpacity
            style={styles.clearButton}
            onPress={ondelete}>
            <XClose width={15} height={15} />
          </TouchableOpacity>
        )}
        {rightIcon && (
          <TouchableOpacity
            style={[styles.rightActionButton, disabledRightAction && {opacity: 0.4}]}
            onPress={onRightAction}
            disabled={disabledRightAction}>
            {rightIcon}
          </TouchableOpacity>
        )}
        {hasError && (
          <View style={styles.errorIndicator}>
            <Text style={styles.errorIcon}>!</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.sm,
  },
  inputWrapper: (isDarkMode, isFocused) => ({
    borderWidth: isFocused ? 2 : 1,
    borderRadius: BORDER_RADIUS.medium,
    borderColor: isFocused
      ? BLUE_COLOR
      : isDarkMode
      ? SLATE_COLOR
      : GREY_COLOR,
    backgroundColor: isDarkMode ? DARK_BACKGROUND : WHITE_BACKGROUND,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.sm,
    position: 'relative',
    minHeight: 56,
    ...(isFocused ? SHADOWS.small : {}),
  }),
  errorBorder: {
    borderColor: RED_COLOR,
    borderWidth: 2,
  },
  label: (isDarkMode, isFocused, hasError) => ({
    position: 'absolute',
    left: SPACING.lg,
    backgroundColor: isDarkMode ? DARK_BACKGROUND : WHITE_BACKGROUND,
    paddingHorizontal: SPACING.xs,
    color: hasError
      ? RED_COLOR
      : isFocused
      ? BLUE_COLOR
      : isDarkMode
      ? SLATE_COLOR
      : GREY_COLOR,
    fontFamily: REGULAR_FONT,
    zIndex: 1,
  }),
  input: (isDarkMode, hasRightIcon) => ({
    fontFamily: REGULAR_FONT,
    fontSize: 14,
    color: isDarkMode ? DARK_COLOR : LIGHT_COLOR,
    padding: 0,
    margin: 0,
    paddingRight: hasRightIcon ? 45 : 40,
  }),
  clearButton: {
    position: 'absolute',
    right: SPACING.md,
    top: '50%',
    transform: [{translateY: -7.5}],
    padding: SPACING.xs,
  },
  rightActionButton: {
    position: 'absolute',
    right: SPACING.md,
    top: '50%',
    transform: [{translateY: -12}], // Centering the icon
    padding: SPACING.xs,
  },
  errorIndicator: {
    position: 'absolute',
    right: 40,
    top: '50%',
    transform: [{translateY: -10}],
  },
  errorIcon: {
    color: RED_COLOR,
    fontWeight: 'bold',
    fontSize: 16,
  },
});

