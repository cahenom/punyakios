import {
  StyleSheet,
  Text,
  View,
  useColorScheme,
  TouchableOpacity,
} from 'react-native';
import React from 'react';
import {
  DARK_BACKGROUND,
  DARK_COLOR,
  FONT_NORMAL,
  GREEN_COLOR,
  GREY_COLOR,
  LIGHT_COLOR,
  MEDIUM_FONT,
  REGULAR_FONT,
  WHITE_BACKGROUND,
} from '../utils/const';
import {CheckProduct} from '../assets';

export default function ProductList({action, selectItem, data}) {
  const isDarkMode = useColorScheme() === 'dark';
  return (
    <TouchableOpacity
      style={[
        styles.productWrapper(isDarkMode),
        selectItem === data.id
          ? {
              borderColor: GREEN_COLOR,
            }
          : '',
      ]}
      onPress={action}>
      <Text style={styles.productLabel(isDarkMode)}>{data.label}</Text>
      <Text style={styles.productPrice(isDarkMode)}>Rp. {data.price}</Text>
      {selectItem === data.id && (
        <CheckProduct
          width={20}
          style={{
            position: 'absolute',
            right: 7,
            top: 2,
          }}
        />
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  productWrapper: isDarkMode => ({
    borderWidth: 1,
    borderColor: GREY_COLOR,
    borderRadius: 10,
    padding: 15, // Reduced padding to prevent overflow
    width: '100%', // Let parent handle width to prevent cutting
    backgroundColor: isDarkMode ? DARK_BACKGROUND : WHITE_BACKGROUND,
    minHeight: 80, // Ensure minimum height to prevent text overlap
  }),
  productLabel: isDarkMode => ({
    fontFamily: MEDIUM_FONT,
    fontSize: FONT_NORMAL,
    color: isDarkMode ? DARK_COLOR : LIGHT_COLOR,
    marginBottom: 5,
    flexWrap: 'wrap',
  }),
  productPrice: isDarkMode => ({
    fontFamily: REGULAR_FONT,
    color: isDarkMode ? DARK_COLOR : LIGHT_COLOR,
    flexWrap: 'wrap',
  }),
});
