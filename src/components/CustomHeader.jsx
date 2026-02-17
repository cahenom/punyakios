import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
  StatusBar,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {
  BOLD_FONT,
  REGULAR_FONT,
  WHITE_COLOR,
  BLUE_COLOR,
  DARK_COLOR,
  LIGHT_COLOR,
  BORDER_RADIUS,
  SPACING,
  HORIZONTAL_MARGIN,
  GRADIENTS,
} from '../utils/const';

export default function CustomHeader({
  title,
  gradient = GRADIENTS.primary,
  showBackButton = true,
  leftComponent = null,
  rightComponent = null,
}) {
  const navigation = useNavigation();
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={isDarkMode ? '#101622' : BLUE_COLOR}
        translucent={false}
      />
      <View style={[styles.header, {backgroundColor: isDarkMode ? '#101622' : BLUE_COLOR}]}>
        <View style={styles.leftContainer}>
          {showBackButton ? (
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backButton}
              activeOpacity={0.7}>
              <Text style={styles.backButtonText}>←</Text>
            </TouchableOpacity>
          ) : (
            leftComponent
          )}
        </View>

        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>

        <View style={styles.rightContainer}>
          {rightComponent || <View style={styles.spacer} />}
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 30,
    paddingBottom: SPACING.lg,
    paddingHorizontal: HORIZONTAL_MARGIN,
  },
  leftContainer: {
    minWidth: 44,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  rightContainer: {
    width: 44,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.medium,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 24,
    color: WHITE_COLOR,
    fontFamily: BOLD_FONT,
  },
  title: {
    fontFamily: BOLD_FONT,
    fontSize: 24,
    color: WHITE_COLOR,
    flex: 1,
    textAlign: 'center',
    marginHorizontal: SPACING.sm,
  },
  spacer: {
    width: 40,
  },
});
