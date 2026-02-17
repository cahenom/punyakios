import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  Linking,
  StyleSheet,
  BackHandler,
} from 'react-native';

const ForceUpdateModal = ({ visible, minVersion, updateUrl, isMaintenance, maintenanceMessage }) => {
  const handleUpdate = () => {
    Linking.openURL(updateUrl).catch((err) =>
      console.error("Couldn't load page", err)
    );
  };

  // Prevent closing the modal via back button on Android
  React.useEffect(() => {
    if (visible) {
      const backAction = () => {
        return true; // Return true to prevent default back action
      };

      const backHandler = BackHandler.addEventListener(
        'hardwareBackPress',
        backAction
      );

      return () => backHandler.remove();
    }
  }, [visible]);

  return (
    <Modal
      transparent={true}
      visible={visible}
      animationType="fade"
      onShow={() => {}} // Optional: handle onShow
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.title}>
            {isMaintenance ? 'Pemeliharaan Sistem' : 'Pembaruan Tersedia'}
          </Text>
          <Text style={styles.message}>
            {isMaintenance 
              ? maintenanceMessage 
              : `Versi aplikasi Anda sudah terlalu lama. Silakan perbarui ke versi ${minVersion} atau yang lebih baru untuk melanjutkan.`}
          </Text>
          
          {!isMaintenance && (
            <TouchableOpacity style={styles.updateButton} onPress={handleUpdate}>
              <Text style={styles.updateButtonText}>Perbarui Sekarang</Text>
            </TouchableOpacity>
          )}

          {isMaintenance && (
             <View style={styles.maintenanceIconContainer}>
               <Text style={styles.maintenanceText}>Mohon tunggu beberapa saat...</Text>
             </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '85%',
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 25,
    alignItems: 'center',
    elevation: 5,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 25,
    lineHeight: 22,
  },
  updateButton: {
    backgroundColor: '#007AFF', // You can change this to match your app's theme
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 10,
    width: '100%',
  },
  updateButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  maintenanceIconContainer: {
    marginTop: 10,
  },
  maintenanceText: {
    color: '#999',
    fontSize: 14,
    fontStyle: 'italic',
  }
});

export default ForceUpdateModal;
