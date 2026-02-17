import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  useColorScheme,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {CheckProduct} from '../assets';
import {
  DARK_BACKGROUND,
  DARK_COLOR,
  FONT_NORMAL,
  GREEN_COLOR,
  GREY_COLOR,
  LIGHT_COLOR,
  MEDIUM_FONT,
  REGULAR_FONT,
  SLATE_COLOR,
  WHITE_BACKGROUND,
  GRADIENTS,
  SHADOWS,
  BORDER_RADIUS,
  SPACING,
} from '../utils/const';
import {numberWithCommas} from '../utils/formatter';

const ProductCard = ({ 
  product, 
  isSelected = false, 
  onSelect,
  style 
}) => {
  const isDarkMode = useColorScheme() === 'dark';

  const CardWrapper = isSelected ? LinearGradient : View;
  const cardProps = isSelected
    ? {
        colors: GRADIENTS.primary,
        start: {x: 0, y: 0},
        end: {x: 1, y: 1},
      }
    : {};

  return (
    <TouchableOpacity
      style={[
        styles.container,
        style
      ]}
      onPress={() => onSelect && onSelect(product)}
      activeOpacity={0.7}>
      <CardWrapper
        {...cardProps}
        style={[
          styles.productWrapper(isDarkMode, isSelected),
          isSelected && styles.selectedCard,
        ]}>
        <View style={styles.contentContainer}>
          <Text style={styles.productLabel(isDarkMode, isSelected)}>
            {product.name || product.product_name || product.label}
          </Text>
          <Text style={styles.productPrice(isDarkMode, isSelected)}>
            Rp {numberWithCommas(product.price || product.product_seller_price)}
          </Text>
          {product.desc && (
            <Text style={styles.productDesc(isDarkMode, isSelected)}>
              {product.desc || product.product_desc}
            </Text>
          )}
        </View>
        {isSelected && (
          <View style={styles.checkIconContainer}>
            <CheckProduct
              width={20}
              height={20}
            />
          </View>
        )}
      </CardWrapper>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.xs,
  },
  productWrapper: (isDarkMode, isSelected) => ({
    borderWidth: isSelected ? 0 : 1,
    borderColor: isDarkMode ? SLATE_COLOR : GREY_COLOR,
    borderRadius: BORDER_RADIUS.large,
    padding: SPACING.lg,
    backgroundColor: isSelected 
      ? 'transparent' 
      : isDarkMode ? DARK_BACKGROUND : WHITE_BACKGROUND,
    minHeight: 100,
    position: 'relative',
    ...(isSelected ? SHADOWS.medium : SHADOWS.small),
  }),
  selectedCard: {
    ...SHADOWS.colored(GRADIENTS.primary[0]),
  },
  contentContainer: {
    flex: 1,
  },
  productLabel: (isDarkMode, isSelected) => ({
    fontFamily: MEDIUM_FONT,
    fontSize: FONT_NORMAL,
    color: isSelected 
      ? '#FFFFFF' 
      : isDarkMode ? DARK_COLOR : LIGHT_COLOR,
    marginBottom: SPACING.xs,
  }),
  productPrice: (isDarkMode, isSelected) => ({
    fontFamily: REGULAR_FONT,
    fontSize: FONT_NORMAL + 2,
    fontWeight: '600',
    color: isSelected 
      ? '#FFFFFF' 
      : isDarkMode ? DARK_COLOR : LIGHT_COLOR,
    marginBottom: SPACING.xs,
  }),
  productDesc: (isDarkMode, isSelected) => ({
    fontFamily: REGULAR_FONT,
    fontSize: 10,
    color: isSelected 
      ? 'rgba(255,255,255,0.9)' 
      : isDarkMode ? SLATE_COLOR : '#64748b',
    marginTop: SPACING.xs,
  }),
  checkIconContainer: {
    position: 'absolute',
    right: SPACING.md,
    top: SPACING.md,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: BORDER_RADIUS.full,
    padding: SPACING.xs,
  },
});

export default ProductCard;
