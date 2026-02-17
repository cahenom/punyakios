import {
  StyleSheet,
  Text,
  View,
  Modal,
  TouchableWithoutFeedback,
  TouchableOpacity,
} from 'react-native';
import React from 'react';
import {BOLD_FONT, WHITE_BACKGROUND, windowWidth} from '../utils/const';
import {XClose} from '../assets';

export default function FullModal({visible, onDismis, title, children}) {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onDismis}
      transparent={true}>
      <TouchableWithoutFeedback onPress={onDismis}>
        <View
          style={{
            position: 'absolute',
            bottom: 0,
            top: 0,
            left: 0,
            right: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
          }}
        />
      </TouchableWithoutFeedback>
      <View
        style={{
          backgroundColor: WHITE_BACKGROUND,
          height: '100%',
          position: 'absolute',
          width: windowWidth,
          bottom: 0,
          borderTopLeftRadius: 25,
          borderTopRightRadius: 25,
          paddingTop: 15,
          paddingHorizontal: 15,
        }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <Text
            style={{
              fontFamily: BOLD_FONT,
              fontSize: 16,
            }}>
            {title}
          </Text>
          <TouchableOpacity
            style={{
              position: 'absolute',
              right: 10,
            }}
            onPress={onDismis}>
            <XClose width={20} height={20} />
          </TouchableOpacity>
        </View>
        {children}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({});
