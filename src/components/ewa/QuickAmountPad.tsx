import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors } from '../../theme/colors';

interface Props {
  maxAmount: number;
  amount: number;
  onAmountChange: (n: number) => void;
}

export function QuickAmountPad({ maxAmount, amount, onAmountChange }: Props) {
  const presets = [50, 100, 200, 500].filter(v => v <= maxAmount);

  const handleDigit = (digit: string) => {
    if (digit === 'DEL') {
      const next = Math.floor(amount / 10);
      onAmountChange(next);
      return;
    }
    const next = amount * 10 + parseInt(digit, 10);
    if (next <= maxAmount) onAmountChange(next);
  };

  const KEYS = ['1','2','3','4','5','6','7','8','9','DEL','0','MAX'];

  return (
    <View style={styles.container}>
      {/* Preset chips */}
      <View style={styles.presets}>
        {presets.map(v => (
          <TouchableOpacity
            key={v}
            style={[styles.chip, amount === v && styles.chipActive]}
            onPress={() => onAmountChange(v)}>
            <Text style={[styles.chipText, amount === v && styles.chipTextActive]}>
              ${v}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Numpad */}
      <View style={styles.pad}>
        {KEYS.map(k => (
          <TouchableOpacity
            key={k}
            style={[styles.key, k === 'DEL' || k === 'MAX' ? styles.keyAlt : null]}
            onPress={() => k === 'MAX' ? onAmountChange(Math.floor(maxAmount)) : handleDigit(k)}>
            <Text style={[styles.keyText, k === 'DEL' || k === 'MAX' ? styles.keyAltText : null]}>
              {k}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 16 },
  presets: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    flexWrap: 'wrap',
  },
  chip: {
    borderWidth: 1,
    borderColor: Colors.bg.subtle,
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 8,
    backgroundColor: Colors.bg.dark,
  },
  chipActive: {
    borderColor: Colors.gold.bright,
    backgroundColor: Colors.gold.faint,
  },
  chipText: {
    color: Colors.text.secondary,
    fontSize: 14,
    fontWeight: '600',
  },
  chipTextActive: {
    color: Colors.gold.bright,
  },
  pad: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
  },
  key: {
    width: 88,
    height: 56,
    backgroundColor: Colors.bg.dark,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  keyAlt: {
    backgroundColor: Colors.bg.surface,
  },
  keyText: {
    color: Colors.text.primary,
    fontSize: 20,
    fontWeight: '500',
  },
  keyAltText: {
    color: Colors.gold.warm,
    fontSize: 14,
    fontWeight: '700',
  },
});
