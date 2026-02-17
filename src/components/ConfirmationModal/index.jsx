import {StyleSheet, Text, View, Modal, TouchableOpacity} from 'react-native';
import React from 'react';
import {
  BLUE_COLOR,
  DARK_BACKGROUND,
  DARK_COLOR,
  FONT_NORMAL,
  LIGHT_COLOR,
  MEDIUM_FONT,
  REGULAR_FONT,
  WHITE_BACKGROUND,
  WHITE_COLOR,
} from '../../utils/const';

const ConfirmationModal = ({
  isVisible,
  onClose,
  onConfirm,
  destination,
  product,
  price,
  description,
  isDarkMode = false,
  title = 'Konfirmasi Pesanan',
  confirmText = 'Lanjutkan',
  cancelText = 'Batal',
}) => {
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}>
      <View style={styles.centeredView}>
        <View
          style={[
            styles.modalView,
            {backgroundColor: isDarkMode ? DARK_BACKGROUND : WHITE_BACKGROUND},
          ]}>
          <Text
            style={[
              styles.modalTitle,
              {color: isDarkMode ? DARK_COLOR : LIGHT_COLOR},
            ]}>
            {title}
          </Text>

          <View style={styles.modalContent}>
            <View style={styles.modalRow}>
              <Text
                style={[
                  styles.modalLabel,
                  {color: isDarkMode ? DARK_COLOR : LIGHT_COLOR},
                ]}>
                Tujuan:
              </Text>
              <Text
                style={[
                  styles.modalValue,
                  {color: isDarkMode ? DARK_COLOR : LIGHT_COLOR},
                ]}>
                {destination}
              </Text>
            </View>

            <View style={styles.modalRow}>
              <Text
                style={[
                  styles.modalLabel,
                  {color: isDarkMode ? DARK_COLOR : LIGHT_COLOR},
                ]}>
                Produk:
              </Text>
              <Text
                style={[
                  styles.modalValue,
                  {color: isDarkMode ? DARK_COLOR : LIGHT_COLOR},
                ]}>
                {product}
              </Text>
            </View>

            {description && (
              <View style={styles.modalRow}>
                <Text
                  style={[
                    styles.modalLabel,
                    {color: isDarkMode ? DARK_COLOR : LIGHT_COLOR},
                  ]}>
                  Deskripsi:
                </Text>
                <Text
                  style={[
                    styles.modalValue,
                    {color: isDarkMode ? DARK_COLOR : LIGHT_COLOR},
                  ]}>
                  {description}
                </Text>
              </View>
            )}

            <View style={styles.modalRow}>
              <Text
                style={[
                  styles.modalLabel,
                  {color: isDarkMode ? DARK_COLOR : LIGHT_COLOR},
                ]}>
                Harga:
              </Text>
              <Text
                style={[
                  styles.modalValue,
                  {color: isDarkMode ? DARK_COLOR : LIGHT_COLOR},
                ]}>
                Rp. {price?.toLocaleString()}
              </Text>
            </View>
          </View>

          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton]}
              onPress={onClose}>
              <Text style={styles.modalButtonText}>{cancelText}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.modalButton, styles.confirmButton]}
              onPress={onConfirm}>
              <Text style={styles.modalButtonText}>{confirmText}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalView: {
    margin: 20,
    backgroundColor: WHITE_BACKGROUND,
    borderRadius: 10,
    padding: 20,
    width: '90%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: FONT_NORMAL + 2,
    fontFamily: MEDIUM_FONT,
    marginBottom: 15,
    textAlign: 'center',
  },
  modalContent: {
    marginBottom: 20,
  },
  modalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  modalLabel: {
    fontFamily: REGULAR_FONT,
    fontSize: FONT_NORMAL,
    flex: 1,
  },
  modalValue: {
    fontFamily: REGULAR_FONT,
    fontSize: FONT_NORMAL,
    textAlign: 'right',
    flex: 1.5,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: '#ccc',
  },
  confirmButton: {
    backgroundColor: BLUE_COLOR,
  },
  modalButtonText: {
    color: WHITE_COLOR,
    fontFamily: REGULAR_FONT,
    fontSize: FONT_NORMAL,
  },
});

export default ConfirmationModal;
