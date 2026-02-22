import {
  StyleSheet,
  Text,
  View,
  Modal,
  TouchableWithoutFeedback,
  TouchableOpacity,
  useColorScheme,
} from 'react-native';
import React from 'react';
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

  return (
    <Modal
      visible={visible}
      animationType="none"
      onRequestClose={onDismis}
      transparent={true}
      statusBarTranslucent={true}
      hardwareAccelerated={true}>
      <View style={styles.modalOverlay}>
        <TouchableWithoutFeedback onPress={onDismis}>
          <View style={styles.backdrop} />
        </TouchableWithoutFeedback>
        <View style={styles.modalContainer(isDarkMode)}>
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
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'transparent',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  modalContainer: isDarkMode => ({
    backgroundColor: isDarkMode ? DARK_BACKGROUND : WHITE_BACKGROUND,
    minHeight: '40%',
    maxHeight: '90%',
    width: windowWidth,
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
    // Removed flex: 1 to allow children to dictate height more naturally
  },
});
