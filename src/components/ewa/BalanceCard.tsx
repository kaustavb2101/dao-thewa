import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Colors } from '../../theme/colors';
import { EWAAccount, PayPeriod } from '../../stores/ewaStore';

interface Props {
  account: EWAAccount;
  period: PayPeriod;
}

function fmt(n: number) {
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 });
}

export function BalanceCard({ account, period }: Props) {
  const drawPercent = period.netEarned > 0 ? (period.advancedAmount / period.netEarned) * 100 : 0;
  const earnedPercent =
    (period.grossEarned /
      (period.hoursWorked > 0
        ? (period.grossEarned / period.hoursWorked) * getExpectedHours(period)
        : period.grossEarned)) * 100;

  return (
    <LinearGradient colors={['#1A2A4A', '#0F1E38']} style={styles.card}>
      <Text style={styles.label}>Available to Withdraw</Text>
      <Text style={styles.balance}>{fmt(account.availableBalance)}</Text>

      <View style={styles.row}>
        <View style={styles.stat}>
          <Text style={styles.statLabel}>Earned this period</Text>
          <Text style={styles.statValue}>{fmt(period.netEarned)}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.stat}>
          <Text style={styles.statLabel}>Already drawn</Text>
          <Text style={[styles.statValue, { color: Colors.warning }]}>
            {fmt(period.advancedAmount)}
          </Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.stat}>
          <Text style={styles.statLabel}>Hours worked</Text>
          <Text style={styles.statValue}>{period.hoursWorked}h</Text>
        </View>
      </View>

      {/* Progress bar — how much of earned balance has been drawn */}
      <View style={styles.progressRow}>
        <Text style={styles.progressLabel}>Draw limit used</Text>
        <Text style={styles.progressLabel}>{Math.round(drawPercent)}%</Text>
      </View>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${Math.min(drawPercent, 100)}%` }]} />
      </View>
    </LinearGradient>
  );
}

function getExpectedHours(period: PayPeriod): number {
  const days =
    (new Date(period.endDate).getTime() - new Date(period.startDate).getTime()) /
    (1000 * 60 * 60 * 24);
  return (days / 7) * 40; // assume 40h/week
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    padding: 24,
    marginHorizontal: 16,
    marginTop: 16,
  },
  label: {
    color: Colors.text.secondary,
    fontSize: 13,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  balance: {
    color: Colors.gold.bright,
    fontSize: 42,
    fontWeight: '700',
    marginTop: 4,
    marginBottom: 20,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
  },
  statLabel: {
    color: Colors.text.muted,
    fontSize: 11,
    marginBottom: 4,
    textAlign: 'center',
  },
  statValue: {
    color: Colors.text.primary,
    fontSize: 15,
    fontWeight: '600',
  },
  divider: {
    width: 1,
    backgroundColor: Colors.bg.subtle,
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  progressLabel: {
    color: Colors.text.muted,
    fontSize: 11,
  },
  track: {
    height: 6,
    backgroundColor: Colors.bg.subtle,
    borderRadius: 3,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    backgroundColor: Colors.gold.warm,
    borderRadius: 3,
  },
});
