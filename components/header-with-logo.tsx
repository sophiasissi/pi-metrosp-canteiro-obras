import React from 'react';
import { Image, StyleSheet, View } from 'react-native';

interface HeaderWithLogoProps {
  title?: string;
}

export default function HeaderWithLogo({ title }: HeaderWithLogoProps) {
  return (
    <View style={styles.headerContainer}>
      <View style={styles.logoContainer}>
        <Image 
          source={require('../assets/images/logo-metro.png')} 
          style={styles.logo}
          resizeMode="contain"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingRight: 15,
    height: 56,
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 40,
    height: 40,
  },
});