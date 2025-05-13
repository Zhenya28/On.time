import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import Svg, { Path, Defs, LinearGradient, Stop, G } from 'react-native-svg';
import theme from '../styles/theme';

const Logo = ({ size = 180, showText = true }) => {
  return (
    <View style={styles.container}>
      <View style={[styles.iconContainer, { width: size, height: size }]}>
        <Svg width={size} height={size} viewBox="0 0 48 48">
          <Defs>
            <LinearGradient
              id="color-1"
              x1="14.572"
              y1="38.199"
              x2="43.188"
              y2="9.583"
              gradientUnits="userSpaceOnUse"
            >
              <Stop offset="0" stopColor="#1d7c78" />
              <Stop offset="1" stopColor="#24a49f" />
            </LinearGradient>
          </Defs>
          <G transform="scale(1,1)">
            <Path
              d="M24.48,29.316l-9.505,9.505l-13.387,-13.387c-0.784,-0.784 -0.784,-2.054 0,-2.838l6.667,-6.667c0.784,-0.784 2.054,-0.784 2.838,0z"
              fill="#25a8a3"
            />
            <Path
              d="M17.797,41.642l-6.667,-6.667c-0.784,-0.784 -0.784,-2.054 0,-2.838l25.777,-25.779c0.784,-0.784 2.054,-0.784 2.838,0l6.667,6.667c0.784,0.784 0.784,2.054 0,2.838l-25.778,25.779c-0.783,0.783 -2.054,0.783 -2.837,0z"
              fill="url(#color-1)"
            />
          </G>
        </Svg>
      </View>
      {showText && (
        <Text style={[styles.text, { fontSize: size * 0.25 }]}>
          On.Time
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 0,
  },
  text: {
    marginTop: 4,
    fontWeight: 'bold',
    color: theme.colors.primary,
    textAlign: 'center',
  },
});

export default Logo; 