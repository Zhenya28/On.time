import { DefaultTheme } from 'react-native-paper';

// Кольорова схема схожа на TickTick
const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#24A19C', // Основний колір (помаранчевий)
    accent: '#FF7043',  // Акцентний колір
    background: '#FFFFFF',
    surface: '#F5F5F5',
    text: '#212121',
    error: '#D32F2F',
    disabled: '#BDBDBD',
    placeholder: '#9E9E9E',
    backdrop: 'rgba(0, 0, 0, 0.5)',
    notification: '#E64A19',
    // Додаткові кольори для нашого додатку
    success: '#4CAF50',
    warning: '#FFC107',
    info: '#2196F3',
    lightGray: '#EEEEEE',
    darkGray: '#757575',
  },
  // Додаткові властивості теми
  spacing: {
    xs: 4,
    s: 8,
    m: 16,
    l: 24,
    xl: 32,
    xxl: 40,
  },
  roundness: 8,
  animation: {
    scale: 1.0,
  },
};

export default theme;