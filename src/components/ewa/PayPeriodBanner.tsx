import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../../theme/colors';
import { PayPeriod } from '../../stores/ewaStore';

interface Props {
  period: PayPeriod;
}

function fmtShort(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function PayPeriodBanner({ period }: Props) {
  const start = new Date(period.startDate);
  const end = new Date(period.endDate);
  const today = new Date();
  const totalDays = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
  const elapsed = Math.max(0, (today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  const pct = Math.min(100, (elapsed / totalDays) * 100);
  const daysLeft = Math.max(0, Math.ceil((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));

  return (
    <View style={styles.banner}>
      <View style={styles.headerRow}>
        <Text style={styles.label}>Pay Period</Text>
        <Text style={styles.range}>
          {fmtShort(period.startDate)} – {fmtShort(period.endDate)}
        </Text>
      </View>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${pct}%` }]} />
      </View>
      <Text style={styles.sub}>
        {daysLeft === 0 ? 'Payday today!' : `${daysLeft} day${daysLeft !== 1 ? 's' : ''} until payday`}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    marginHorizontal: 16,
    marginTop: 12,
    backgroundColor: Colors.bg.dark,
    borderRadius: 12,
    padding: 14,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  label: {
    color: Colors.text.muted,
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  range: {
    color: Colors.text.secondary,
    fontSize: 12,
    fontWeight: '600',
  },
  track: {
    height: 4,
    backgroundColor: Colors.bg.subtle,
    borderRadius: 2,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    backgroundColor: Colors.celestial.sky,
    borderRadius: 2,
  },
  sub: {
    color: Colors.text.muted,
    fontSize: 11,
    marginTop: 6,
    textAlign: 'right',
  },
});
