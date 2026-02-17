import {Dimensions} from 'react-native';
import {Colors} from 'react-native/Libraries/NewAppScreen';

export const windowWidth = Dimensions.get('window').width;
export const windowHeight = Dimensions.get('window').height;

export const FONT_NORMAL = 14;
export const FONT_SEDANG = 12;
export const FONT_KECIL = 10;

export const REGULAR_FONT = 'Inter-Regular';
export const BOLD_FONT = 'Inter-Bold';
export const MEDIUM_FONT = 'Inter-Medium';

export const HORIZONTAL_MARGIN = 20;

export const DARK_BACKGROUND = Colors.darker;
export const LIGHT_BACKGROUND = Colors.lighter;
export const WHITE_BACKGROUND = '#FFFFFF';
export const LIGHT_COLOR = '#000000';
export const DARK_COLOR = '#FFFFFF';
export const SLATE_COLOR = '#94A3B8';
export const BLUE_COLOR = '#1e0bff';
export const GREY_COLOR = '#d9d9d9';
export const GREEN_COLOR = '#01C1A2';
export const RED_COLOR = '#FF0000';
export const WHITE_COLOR = '#FFFFFF';

export const API_URL = 'https://v1.maktopup.com';

// Modern Design Tokens
export const GRADIENTS = {
  primary: ['#1e0bff', '#135bec'],
  secondary: ['#a855f7', '#135bec'],
  success: ['#10b981', '#059669'],
  warning: ['#f59e0b', '#d97706'],
  error: ['#ef4444', '#dc2626'],
  purple: ['#a855f7', '#7c3aed'],
  orange: ['#f97316', '#ef4444'],
};

export const SHADOWS = {
  small: {
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  large: {
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 8},
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  colored: color => ({
    shadowColor: color,
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  }),
};

export const BORDER_RADIUS = {
  small: 8,
  medium: 12,
  large: 16,
  xlarge: 20,
  full: 9999,
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const ANIMATION_DURATION = {
  fast: 200,
  normal: 300,
  slow: 500,
};

