/**
 * ดาวเทวา — GoldDivider
 * Ornamental Thai-style horizontal divider with lotus motif
 */
import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {Colors} from '../theme/colors';

interface Props {
  symbol?: string;
}

export function GoldDivider({symbol = '✦'}: Props) {
  return (
    <View style={styles.row}>
      <View style={styles.line} />
      <Text style={styles.symbol}>{symbol}</Text>
      <View style={styles.line} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 12,
    paddingHorizontal: 16,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(212,160,23,0.25)',
  },
  symbol: {
    color: Colors.gold.warm,
    fontSize: 10,
    marginHorizontal: 10,
    opacity: 0.7,
  },
});
