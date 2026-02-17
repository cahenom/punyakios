import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

const ProductBadge = ({ item, isSelected, onPress }) => {
  return (
    <TouchableOpacity 
      style={[styles.productBadge, isSelected && styles.selectedProductBadge]} 
      onPress={onPress}
    >
      <Text style={[styles.productBadgeText, isSelected && styles.selectedProductText]}>
        {item.title}
      </Text>
      <Text style={[styles.productBadgePrice, isSelected && styles.selectedProductText]}>
        {item.price}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  productBadge: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    margin: 5,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  selectedProductBadge: {
    backgroundColor: '#3498db',
  },
  productBadgeText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 5,
  },
  selectedProductText: {
    color: '#fff',
  },
  productBadgePrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#e74c3c',
  },
});

export default ProductBadge;