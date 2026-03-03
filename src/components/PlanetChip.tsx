/**
 * ดาวเทวา — PlanetChip
 * Tappable planet filter chip with symbol + Thai name
 */
import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { Colors } from '../theme/colors';
import { NAVA_GRAHA } from '../../config/constants';

type GrahaKey = keyof typeof NAVA_GRAHA;

interface Props {
  grahaKey: GrahaKey;
  selected?: boolean;
  onPress?: () => void;
}

export function PlanetChip({ grahaKey, selected = false, onPress }: Props) {
  const graha = NAVA_GRAHA[grahaKey];
  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityState={{ selected: selected }}
      accessibilityLabel={'ดาว ' + graha.nameThai}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      onPress={onPress}
      style={[
        styles.chip,
        selected && {
          backgroundColor: graha.color + '33',
          borderColor: graha.color,
        },
      ]}
      activeOpacity={0.7}>
      <Text style={styles.symbol}>{graha.symbol}</Text>
      <Text style={[styles.name, selected && { color: graha.color }]}>
        {graha.nameThai}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(212,160,23,0.2)',
    backgroundColor: Colors.bg.surface,
  },
  symbol: { fontSize: 12 },
  name: { fontSize: 10, color: Colors.text.secondary },
});
