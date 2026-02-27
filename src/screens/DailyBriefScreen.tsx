/**
 * ดาวเทวา — Daily Brief Screen (Placeholder)
 * Final implementation: AI-generated Thai readings
 * Agent 4 will replace with full UI.
 */

import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Colors} from '../theme/colors';

export default function DailyBriefScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.symbol}>✨</Text>
        <Text style={styles.title}>ทำนายรายวัน</Text>
        <Text style={styles.subtitle}>AI-Generated Thai Astrological Readings</Text>
        <Text style={styles.badge}>Agent 4 → UI Implementation</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg.deep,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  symbol: {
    fontSize: 64,
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    color: Colors.gold.bright,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.text.secondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  badge: {
    fontSize: 11,
    color: Colors.celestial.sky,
    backgroundColor: Colors.bg.subtle,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
});
