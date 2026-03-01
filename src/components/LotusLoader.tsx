/**
 * ดาวเทวา — LotusLoader
 * Animated loading state with rotating lotus
 */
import React, {useEffect, useRef} from 'react';
import {View, Text, Animated, Easing, StyleSheet} from 'react-native';
import {Colors} from '../theme/colors';

interface Props {
  size?: number;
  label?: string;
}

export function LotusLoader({size = 40, label = 'กำลังคำนวณ...'}: Props) {
  const spin = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(spin, {
        toValue: 1,
        duration: 3000,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    ).start();
  }, [spin]);

  const rotation = spin.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.container}>
      <Animated.Text
        style={[
          styles.lotus,
          {fontSize: size, transform: [{rotate: rotation}]},
        ]}>
        ✿
      </Animated.Text>
      {label ? <Text style={styles.label}>{label}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  lotus: {
    color: Colors.gold.bright,
    opacity: 0.8,
  },
  label: {
    fontSize: 12,
    color: Colors.text.muted,
    letterSpacing: 1,
  },
});
