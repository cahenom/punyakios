import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  useColorScheme,
  StatusBar,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import CustomHeader from '../../components/CustomHeader';
import {
  BOLD_FONT,
  REGULAR_FONT,
  MEDIUM_FONT,
  DARK_BACKGROUND,
  WHITE_COLOR,
  DARK_COLOR,
  LIGHT_COLOR,
  SLATE_COLOR,
  BLUE_COLOR,
  WHITE_BACKGROUND,
  BORDER_RADIUS,
  SPACING,
  SHADOWS,
  HORIZONTAL_MARGIN,
} from '../../utils/const';

export default function PromoScreen() {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <SafeAreaView style={styles.container(isDarkMode)}>
      <CustomHeader
        title="PROMO"
        showBackButton={false}
      />

      <View style={styles.content}>
        <View style={styles.emptyCard(isDarkMode)}>
          <Text style={styles.emptyEmoji}>🎁</Text>
          <Text style={styles.emptyTitle(isDarkMode)}>Segera Hadir!</Text>
          <Text style={styles.emptyDesc(isDarkMode)}>
            Promo menarik sedang disiapkan untuk Anda. Nantikan penawaran
            spesial kami!
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: isDarkMode => ({
    flex: 1,
    backgroundColor: isDarkMode ? '#101622' : '#f6f6f8',
  }),
  bellButton: {
    position: 'relative',
    padding: 6,
  },
  bellBadge: {
    position: 'absolute',
    top: 2,
    right: 0,
    backgroundColor: '#ef4444',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  bellBadgeText: {
    fontFamily: BOLD_FONT,
    fontSize: 10,
    color: WHITE_COLOR,
  },
  content: {
    flex: 1,
    paddingHorizontal: HORIZONTAL_MARGIN,
    paddingTop: SPACING.xl,
    paddingBottom: 100,
  },
  emptyCard: isDarkMode => ({
    backgroundColor: isDarkMode ? '#1a2332' : '#ffffff',
    borderRadius: BORDER_RADIUS.large,
    padding: SPACING.xxxl,
    alignItems: 'center',
    ...SHADOWS.medium,
  }),
  emptyEmoji: {
    fontSize: 64,
    marginBottom: SPACING.xl,
  },
  emptyTitle: isDarkMode => ({
    fontFamily: BOLD_FONT,
    fontSize: 20,
    color: isDarkMode ? DARK_COLOR : LIGHT_COLOR,
    marginBottom: SPACING.md,
  }),
  emptyDesc: isDarkMode => ({
    fontFamily: REGULAR_FONT,
    fontSize: 14,
    color: isDarkMode ? SLATE_COLOR : '#64748b',
    textAlign: 'center',
    lineHeight: 22,
  }),
});
