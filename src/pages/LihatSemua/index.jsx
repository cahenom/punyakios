import {
  StyleSheet,
  Text,
  View,
  useColorScheme,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import CustomHeader from '../../components/CustomHeader';
import React from 'react';
import {
  BOLD_FONT,
  MEDIUM_FONT,
  REGULAR_FONT,
  DARK_BACKGROUND,
  DARK_COLOR,
  HORIZONTAL_MARGIN,
  LIGHT_COLOR,
  SLATE_COLOR,
  WHITE_COLOR,
  BLUE_COLOR,
  WHITE_BACKGROUND,
  BORDER_RADIUS,
  SPACING,
  SHADOWS,
} from '../../utils/const';
import {mainmenus} from '../../data/mainmenu';
import {Alert} from '../../utils/alert';

export default function LihatSemuaScreen({navigation}) {
  const isDarkMode = useColorScheme() === 'dark';

  const services = mainmenus.map((item, index) => ({
    ...item,
    id: index,
  }));

  const pascabayarLabels = ['bpjs kesehatan', 'pdam', 'internet'];

  const prabayarServices = services.filter(
    item => !pascabayarLabels.includes(item.label.toLowerCase()),
  );
  const pascabayarServices = services.filter(item =>
    pascabayarLabels.includes(item.label.toLowerCase()),
  );

  const comingSoonServices = ['PDAM', 'Internet'];

  const handleServicePress = item => {
    if (comingSoonServices.includes(item.label)) {
      Alert.alert('Segera Hadir', `Fitur ${item.label} akan segera hadir!`);
    } else {
      navigation.navigate(item.path);
    }
  };

  const renderGrid = (data) => (
    <View style={styles.grid}>
      {data.map((item, index) => {
        const isComingSoon = comingSoonServices.includes(item.label);
        return (
          <TouchableOpacity
            key={item.id}
            style={styles.serviceItem}
            onPress={() => handleServicePress(item)}
            activeOpacity={0.7}>
            <View
              style={[
                styles.serviceIconBox,
                {
                  backgroundColor: isDarkMode ? '#1e293b' : '#f0f3f7',
                  opacity: isComingSoon ? 0.6 : 1,
                },
              ]}>
              {React.createElement(item.ikon, {width: 24, height: 24})}
            </View>
            <Text
              style={styles.serviceLabel(isDarkMode)}
              numberOfLines={2}>
              {item.label}
            </Text>
            {isComingSoon && (
              <View style={styles.comingSoonBadge}>
                <Text style={styles.comingSoonText}>Segera</Text>
              </View>
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );

  return (
    <SafeAreaView style={styles.container(isDarkMode)}>
      <CustomHeader title="Semua Layanan" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{paddingBottom: 40}}>

        {/* Prabayar Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle(isDarkMode)}>Layanan Prabayar</Text>
          <View style={styles.card(isDarkMode)}>
            {renderGrid(prabayarServices)}
          </View>
        </View>

        {/* Pascabayar Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle(isDarkMode)}>Layanan Pascabayar</Text>
          <View style={styles.card(isDarkMode)}>
            {renderGrid(pascabayarServices)}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: isDarkMode => ({
    flex: 1,
    backgroundColor: isDarkMode ? '#101622' : '#f6f6f8',
  }),
  section: {
    marginTop: SPACING.lg,
    paddingHorizontal: HORIZONTAL_MARGIN,
  },
  sectionTitle: isDarkMode => ({
    fontFamily: BOLD_FONT,
    fontSize: 16,
    color: isDarkMode ? DARK_COLOR : LIGHT_COLOR,
    marginBottom: SPACING.md,
  }),
  card: isDarkMode => ({
    backgroundColor: isDarkMode ? '#1a2332' : WHITE_BACKGROUND,
    borderRadius: BORDER_RADIUS.large,
    padding: SPACING.md,
    ...SHADOWS.small,
  }),
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  serviceItem: {
    width: '25%',
    alignItems: 'center',
    paddingVertical: SPACING.md,
  },
  serviceIconBox: {
    width: 52,
    height: 52,
    borderRadius: BORDER_RADIUS.medium,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xs + 2,
  },
  serviceIcon: {
    width: 26,
    height: 26,
  },
  serviceLabel: isDarkMode => ({
    fontFamily: MEDIUM_FONT,
    fontSize: 11,
    color: isDarkMode ? '#cbd5e1' : '#334155',
    textAlign: 'center',
    lineHeight: 14,
  }),
  comingSoonBadge: {
    backgroundColor: '#fef3c7',
    borderRadius: BORDER_RADIUS.small,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginTop: 3,
  },
  comingSoonText: {
    fontFamily: MEDIUM_FONT,
    fontSize: 9,
    color: '#d97706',
  },
});
