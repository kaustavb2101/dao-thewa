/**
 * ดาวเทวา — IntensityBar
 * Shows astrological rule strength 1–5 as filled dots
 */
import React from 'react';
import {View, StyleSheet} from 'react-native';
import {Colors} from '../theme/colors';

interface Props {
  intensity: 1 | 2 | 3 | 4 | 5;
  color?: string;
}

export function IntensityBar({intensity, color = Colors.gold.bright}: Props) {
  return (
    <View style={styles.row}>
      {[1, 2, 3, 4, 5].map(i => (
        <View
          key={i}
          style={[
            styles.dot,
            {backgroundColor: i <= intensity ? color : Colors.bg.subtle},
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {flexDirection: 'row', gap: 4, alignItems: 'center'},
  dot: {width: 6, height: 6, borderRadius: 3},
});
