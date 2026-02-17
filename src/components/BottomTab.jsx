import {View, Text, TouchableOpacity, useColorScheme, Animated} from 'react-native';
import React, {useRef, useEffect} from 'react';
import LinearGradient from 'react-native-linear-gradient';
import {
  BLUE_COLOR,
  DARK_BACKGROUND,
  LIGHT_COLOR,
  DARK_COLOR,
  BORDER_RADIUS,
  SPACING,
  SHADOWS,
  GRADIENTS,
} from '../utils/const';
import {
  HomeActive,
  HomeDefault,
  PromoActive,
  PromoDefault,
  ScanIcon,
  TransaksiActive,
  TransaksiDefault,
  UserActive,
  UserDefault,
} from '../assets';

// ===== Extracted component so hooks work properly =====
function TabItem({route, index, isFocused, options, onPress, onLongPress, isDarkMode}) {
  const label =
    options.tabBarLabel !== undefined
      ? options.tabBarLabel
      : options.title !== undefined
      ? options.title
      : route.name;

  const animatedScale = useRef(new Animated.Value(0.95)).current;

  useEffect(() => {
    if (isFocused) {
      Animated.spring(animatedScale, {
        toValue: 1,
        friction: 4,
        useNativeDriver: true,
      }).start();
    } else {
      animatedScale.setValue(0.95);
    }
  }, [isFocused]);

  const IkonMenu = ({active}) => {
    if (label === 'Home') return active ? <HomeActive /> : <HomeDefault />;
    if (label === 'Promo') return active ? <PromoActive /> : <PromoDefault />;
    if (label === 'Transaksi')
      return active ? <TransaksiActive /> : <TransaksiDefault />;
    if (label === 'Profil') return active ? <UserActive /> : <UserDefault />;
    return <HomeDefault />;
  };

  // ========== SCAN CENTER BUTTON ==========
  if (label === 'Scan') {
    return (
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'flex-end',
          paddingBottom: SPACING.xs,
        }}>
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Scan"
          onPress={onPress}
          onLongPress={onLongPress}
          activeOpacity={0.8}
          style={{
            marginTop: -34,
          }}>
          <LinearGradient
            colors={GRADIENTS.primary}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 0}}
            style={{
              width: 78,
              height: 78,
              borderRadius: 39,
              alignItems: 'center',
              justifyContent: 'center',
              ...SHADOWS.colored('#1e0bff'),
              borderWidth: 4,
              borderColor: isDarkMode ? '#1a2332' : '#ffffff',
            }}>
            <ScanIcon width={30} height={30} />
          </LinearGradient>
        </TouchableOpacity>
        <Text
          style={{
            color: isFocused ? BLUE_COLOR : isDarkMode ? '#94a3b8' : '#64748b',
            fontSize: 11,
            fontWeight: isFocused ? '600' : '400',
            marginTop: 2,
          }}>
          Scan
        </Text>
      </View>
    );
  }

  // ========== REGULAR TAB ==========
  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityState={isFocused ? {selected: true} : {}}
      accessibilityLabel={options.tabBarAccessibilityLabel}
      testID={options.tabBarTestID}
      onPress={onPress}
      onLongPress={onLongPress}
      style={{
        flex: 1,
        alignItems: 'center',
        paddingVertical: SPACING.md,
        borderRadius: BORDER_RADIUS.large,
      }}
      activeOpacity={0.7}>
      <Animated.View
        style={{
          transform: [{scale: animatedScale}],
          width: '100%',
          alignItems: 'center',
        }}>
        {isFocused ? (
          <LinearGradient
            colors={isDarkMode ? ['#1e3a8a', '#1e1b4b'] : ['#eff6ff', '#dbeafe']}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 0}}
            style={{
              position: 'absolute',
              top: -SPACING.md,
              bottom: -SPACING.md,
              left: SPACING.xs,
              right: SPACING.xs,
              borderRadius: BORDER_RADIUS.large,
              opacity: 0.8,
            }}
          />
        ) : null}
        <View style={{marginBottom: SPACING.xs}}>
          <IkonMenu active={isFocused} />
        </View>
        <Text
          style={{
            color: isFocused ? BLUE_COLOR : isDarkMode ? '#94a3b8' : '#64748b',
            fontSize: 11,
            fontWeight: isFocused ? '600' : '400',
          }}>
          {label}
        </Text>
      </Animated.View>
      {isFocused && (
        <View
          style={{
            position: 'absolute',
            bottom: 0,
            width: 32,
            height: 3,
            borderRadius: BORDER_RADIUS.full,
            backgroundColor: BLUE_COLOR,
          }}
        />
      )}
    </TouchableOpacity>
  );
}

// ===== Main Tab Bar =====
function MyTabBar({state, descriptors, navigation}) {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <View style={{
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      paddingBottom: SPACING.md,
      paddingHorizontal: SPACING.lg,
    }}>
      <View
        style={{
          flexDirection: 'row',
          backgroundColor: isDarkMode ? '#1a2332' : '#ffffff',
          borderRadius: BORDER_RADIUS.xlarge,
          paddingVertical: SPACING.sm,
          paddingHorizontal: SPACING.xs,
          ...SHADOWS.large,
        }}>
        {state.routes.map((route, index) => {
          const {options} = descriptors[route.key];
          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });
            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate({name: route.name, merge: true});
            }
          };

          const onLongPress = () => {
            navigation.emit({
              type: 'tabLongPress',
              target: route.key,
            });
          };

          return (
            <TabItem
              key={index}
              route={route}
              index={index}
              isFocused={isFocused}
              options={options}
              onPress={onPress}
              onLongPress={onLongPress}
              isDarkMode={isDarkMode}
            />
          );
        })}
      </View>
    </View>
  );
}

export default MyTabBar;
