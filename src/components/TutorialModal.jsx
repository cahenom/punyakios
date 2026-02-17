import React, {useState} from 'react';
import {
  StyleSheet,
  Text,
  View,
  Modal,
  TouchableOpacity,
  Dimensions,
  SafeAreaView,
  useColorScheme,
} from 'react-native';
import {
  BOLD_FONT,
  REGULAR_FONT,
  MEDIUM_FONT,
  BLUE_COLOR,
  WHITE_COLOR,
  DARK_BACKGROUND,
  HORIZONTAL_MARGIN,
  BORDER_RADIUS,
  SPACING,
} from '../utils/const';

const {width, height} = Dimensions.get('window');

const TUTORIAL_STEPS = [
  {
    id: 1,
    title: 'Selamat Datang di Punya Kios!',
    description: 'Solusi lengkap untuk kebutuhan digital Anda. Mari kita mulai tur singkatnya!',
    emoji: '🏪',
  },
  {
    id: 2,
    title: 'Cek Saldo & Deposit',
    description: 'Di sini Anda bisa memantau saldo dan melakukan pengisian ulang dengan mudah.',
    emoji: '💳',
  },
  {
    id: 3,
    title: 'Layanan Lengkap',
    description: 'Mulai dari Pulsa, Paket Data, hingga Tagihan Listrik, semua tersedia dalam satu genggaman.',
    emoji: '⚡',
  },
  {
    id: 4,
    title: 'Promo Spesial',
    description: 'Jangan lewatkan penawaran menarik dan diskon khusus setiap harinya!',
    emoji: '🎁',
  },
];

export default function TutorialModal({visible, onComplete}) {
  const isDarkMode = useColorScheme() === 'dark';
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < TUTORIAL_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const step = TUTORIAL_STEPS[currentStep];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <SafeAreaView style={styles.container}>
          <View style={styles.card(isDarkMode)}>
            {/* Progress Bar */}
            <View style={styles.progressContainer}>
              {TUTORIAL_STEPS.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.progressBar,
                    {
                      backgroundColor: index <= currentStep ? BLUE_COLOR : (isDarkMode ? '#334155' : '#e2e8f0'),
                      flex: 1,
                    },
                    index > 0 && {marginLeft: 4},
                  ]}
                />
              ))}
            </View>

            <Text style={styles.emoji}>{step.emoji}</Text>
            <Text style={styles.title(isDarkMode)}>{step.title}</Text>
            <Text style={styles.description(isDarkMode)}>{step.description}</Text>

            <View style={styles.footer}>
              <TouchableOpacity 
                style={styles.skipButton}
                onPress={onComplete}
              >
                <Text style={styles.skipText(isDarkMode)}>Lewati</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.nextButton}
                onPress={handleNext}
              >
                <Text style={styles.nextText}>
                  {currentStep === TUTORIAL_STEPS.length - 1 ? 'Mulai Sekarang' : 'Lanjut'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: '90%',
    maxWidth: 400,
  },
  card: isDarkMode => ({
    backgroundColor: isDarkMode ? '#1e293b' : '#ffffff',
    borderRadius: 24,
    padding: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 10},
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  }),
  progressContainer: {
    flexDirection: 'row',
    width: '100%',
    marginBottom: 30,
  },
  progressBar: {
    height: 4,
    borderRadius: 2,
  },
  emoji: {
    fontSize: 80,
    marginBottom: 20,
  },
  title: isDarkMode => ({
    fontFamily: BOLD_FONT,
    fontSize: 22,
    color: isDarkMode ? WHITE_COLOR : '#1e293b',
    textAlign: 'center',
    marginBottom: 12,
  }),
  description: isDarkMode => ({
    fontFamily: REGULAR_FONT,
    fontSize: 16,
    color: isDarkMode ? '#94a3b8' : '#64748b',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 40,
  }),
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    justifyContent: 'space-between',
  },
  skipButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  skipText: isDarkMode => ({
    fontFamily: MEDIUM_FONT,
    fontSize: 15,
    color: isDarkMode ? '#94a3b8' : '#64748b',
  }),
  nextButton: {
    backgroundColor: BLUE_COLOR,
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 14,
  },
  nextText: {
    fontFamily: BOLD_FONT,
    fontSize: 15,
    color: WHITE_COLOR,
  },
});
