import React, {useState, useRef, useCallback} from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  useColorScheme,
  Animated,
  StatusBar,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  BOLD_FONT,
  MEDIUM_FONT,
  REGULAR_FONT,
  DARK_BACKGROUND,
  WHITE_BACKGROUND,
  WHITE_COLOR,
  BLUE_COLOR,
  DARK_COLOR,
  LIGHT_COLOR,
  SLATE_COLOR,
  GRADIENTS,
  BORDER_RADIUS,
  SPACING,
  SHADOWS,
  windowWidth,
  windowHeight,
} from '../../utils/const';

const SLIDES = [
  {
    id: '1',
    emoji: '💳',
    gradient: GRADIENTS.primary,
    title: 'Pembayaran Mudah',
    description:
      'Bayar tagihan PLN, PDAM, BPJS, internet, dan lainnya dalam satu aplikasi.',
  },
  {
    id: '2',
    emoji: '⚡',
    gradient: GRADIENTS.secondary,
    title: 'Isi Ulang Cepat',
    description:
      'Top-up pulsa, paket data, game, dan e-wallet kapan saja dengan harga terbaik.',
  },
  {
    id: '3',
    emoji: '🔒',
    gradient: GRADIENTS.purple,
    title: 'Aman & Terpercaya',
    description:
      'Setiap transaksi dijamin aman dan tercatat rapi di riwayat Anda.',
  },
];

export default function OnboardingScreen({navigation}) {
  const isDarkMode = useColorScheme() === 'dark';
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  const onViewableItemsChanged = useCallback(({viewableItems}) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index || 0);
    }
  }, []);

  const viewConfig = useRef({viewAreaCoveragePercentThreshold: 50}).current;

  const finishOnboarding = async () => {
    await AsyncStorage.setItem('@onboarding_seen', 'true');
    navigation.replace('Login');
  };

  const handleNext = () => {
    if (currentIndex < SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({
        index: currentIndex + 1,
        animated: true,
      });
    } else {
      finishOnboarding();
    }
  };

  const renderSlide = ({item, index}) => {
    const inputRange = [
      (index - 1) * windowWidth,
      index * windowWidth,
      (index + 1) * windowWidth,
    ];

    const emojiScale = scrollX.interpolate({
      inputRange,
      outputRange: [0.6, 1, 0.6],
      extrapolate: 'clamp',
    });

    const emojiOpacity = scrollX.interpolate({
      inputRange,
      outputRange: [0.3, 1, 0.3],
      extrapolate: 'clamp',
    });

    const textTranslateY = scrollX.interpolate({
      inputRange,
      outputRange: [30, 0, 30],
      extrapolate: 'clamp',
    });

    const textOpacity = scrollX.interpolate({
      inputRange,
      outputRange: [0, 1, 0],
      extrapolate: 'clamp',
    });

    return (
      <View style={styles.slide}>
        {/* Gradient Circle Background */}
        <LinearGradient
          colors={item.gradient}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 1}}
          style={styles.emojiCircle}>
          <Animated.Text
            style={[
              styles.emoji,
              {
                transform: [{scale: emojiScale}],
                opacity: emojiOpacity,
              },
            ]}>
            {item.emoji}
          </Animated.Text>
        </LinearGradient>

        {/* Decorative floating dots */}
        <View style={styles.decorContainer}>
          <LinearGradient
            colors={item.gradient}
            style={[styles.decorDot, styles.decorDot1]}
          />
          <LinearGradient
            colors={item.gradient}
            style={[styles.decorDot, styles.decorDot2]}
          />
          <LinearGradient
            colors={item.gradient}
            style={[styles.decorDot, styles.decorDot3]}
          />
        </View>

        {/* Text Content */}
        <Animated.View
          style={[
            styles.textContainer,
            {
              transform: [{translateY: textTranslateY}],
              opacity: textOpacity,
            },
          ]}>
          <Text style={styles.title(isDarkMode)}>{item.title}</Text>
          <Text style={styles.description(isDarkMode)}>
            {item.description}
          </Text>
        </Animated.View>
      </View>
    );
  };

  const renderDots = () => {
    return (
      <View style={styles.dotsContainer}>
        {SLIDES.map((_, index) => {
          const inputRange = [
            (index - 1) * windowWidth,
            index * windowWidth,
            (index + 1) * windowWidth,
          ];

          const dotWidth = scrollX.interpolate({
            inputRange,
            outputRange: [8, 28, 8],
            extrapolate: 'clamp',
          });

          const dotOpacity = scrollX.interpolate({
            inputRange,
            outputRange: [0.3, 1, 0.3],
            extrapolate: 'clamp',
          });

          return (
            <Animated.View
              key={index}
              style={[
                styles.dot,
                {
                  width: dotWidth,
                  opacity: dotOpacity,
                  backgroundColor: BLUE_COLOR,
                },
              ]}
            />
          );
        })}
      </View>
    );
  };

  const isLastSlide = currentIndex === SLIDES.length - 1;

  return (
    <View style={styles.container(isDarkMode)}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor="transparent"
        translucent
      />

      {/* Skip Button */}
      {!isLastSlide && (
        <TouchableOpacity
          style={styles.skipButton}
          onPress={finishOnboarding}
          activeOpacity={0.7}>
          <Text style={styles.skipText(isDarkMode)}>Lewati</Text>
        </TouchableOpacity>
      )}

      {/* Slides */}
      <FlatList
        ref={flatListRef}
        data={SLIDES}
        renderItem={renderSlide}
        keyExtractor={item => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        bounces={false}
        onScroll={Animated.event(
          [{nativeEvent: {contentOffset: {x: scrollX}}}],
          {useNativeDriver: false},
        )}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewConfig}
        scrollEventThrottle={16}
      />

      {/* Bottom Section */}
      <View style={styles.bottomContainer(isDarkMode)}>
        {renderDots()}

        {/* Action Button */}
        <TouchableOpacity
          onPress={handleNext}
          activeOpacity={0.85}
          style={styles.buttonWrapper}>
          <LinearGradient
            colors={GRADIENTS.primary}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 0}}
            style={styles.nextButton}>
            <Text style={styles.nextButtonText}>
              {isLastSlide ? 'Mulai Sekarang' : 'Lanjut'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: isDarkMode => ({
    flex: 1,
    backgroundColor: isDarkMode ? DARK_BACKGROUND : '#f8f9ff',
  }),
  skipButton: {
    position: 'absolute',
    top: StatusBar.currentHeight ? StatusBar.currentHeight + SPACING.lg : 56,
    right: SPACING.xl,
    zIndex: 10,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  skipText: isDarkMode => ({
    fontFamily: MEDIUM_FONT,
    fontSize: 14,
    color: isDarkMode ? SLATE_COLOR : '#64748b',
  }),
  slide: {
    width: windowWidth,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.xxxl,
  },
  emojiCircle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xxxl * 1.5,
    ...SHADOWS.colored('#1e0bff'),
  },
  emoji: {
    fontSize: 72,
  },
  decorContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  decorDot: {
    position: 'absolute',
    borderRadius: BORDER_RADIUS.full,
    opacity: 0.12,
  },
  decorDot1: {
    width: 60,
    height: 60,
    top: '15%',
    left: '10%',
  },
  decorDot2: {
    width: 40,
    height: 40,
    top: '25%',
    right: '8%',
  },
  decorDot3: {
    width: 24,
    height: 24,
    bottom: '35%',
    left: '18%',
  },
  textContainer: {
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
  },
  title: isDarkMode => ({
    fontFamily: BOLD_FONT,
    fontSize: 28,
    color: isDarkMode ? DARK_COLOR : LIGHT_COLOR,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  }),
  description: isDarkMode => ({
    fontFamily: REGULAR_FONT,
    fontSize: 16,
    color: isDarkMode ? SLATE_COLOR : '#64748b',
    textAlign: 'center',
    lineHeight: 24,
  }),
  bottomContainer: isDarkMode => ({
    paddingHorizontal: SPACING.xxxl,
    paddingBottom: SPACING.xxxl * 1.5,
    paddingTop: SPACING.xl,
    backgroundColor: isDarkMode ? DARK_BACKGROUND : '#f8f9ff',
  }),
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.xxl,
  },
  dot: {
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  buttonWrapper: {
    borderRadius: BORDER_RADIUS.medium,
    overflow: 'hidden',
    ...SHADOWS.colored('#1e0bff'),
  },
  nextButton: {
    paddingVertical: SPACING.lg + 2,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BORDER_RADIUS.medium,
  },
  nextButtonText: {
    fontFamily: BOLD_FONT,
    fontSize: 16,
    color: WHITE_COLOR,
  },
});
