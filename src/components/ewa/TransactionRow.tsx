import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../../theme/colors';
import { EWATransaction } from '../../stores/ewaStore';

interface Props {
  tx: EWATransaction;
}

const TYPE_META: Record<string, { label: string; icon: string; color: string }> = {
  advance: { label: 'Advance', icon: '↑', color: Colors.gold.bright },
  repayment: { label: 'Repayment', icon: '↓', color: Colors.success },
  fee: { label: 'Fee', icon: '•', color: Colors.text.muted },
};

const STATUS_COLOR: Record<string, string> = {
  pending: Colors.warning,
  completed: Colors.success,
  failed: Colors.danger,
};

function fmt(n: number) {
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 });
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function TransactionRow({ tx }: Props) {
  const meta = TYPE_META[tx.type] ?? TYPE_META.fee;
  const isAdvance = tx.type === 'advance';

  return (
    <View style={styles.row}>
      <View style={[styles.iconCircle, { borderColor: meta.color }]}>
        <Text style={[styles.icon, { color: meta.color }]}>{meta.icon}</Text>
      </View>
      <View style={styles.body}>
        <View style={styles.topLine}>
          <Text style={styles.type}>{meta.label}</Text>
          <Text style={[styles.amount, { color: meta.color }]}>
            {isAdvance ? '+' : '-'}{fmt(tx.amount)}
          </Text>
        </View>
        <View style={styles.bottomLine}>
          <Text style={styles.note} numberOfLines={1}>{tx.note}</Text>
          <View style={styles.rightMeta}>
            {isAdvance && tx.fee > 0 && (
              <Text style={styles.fee}>Fee {fmt(tx.fee)}</Text>
            )}
            <View style={[styles.badge, { backgroundColor: STATUS_COLOR[tx.status] + '33' }]}>
              <Text style={[styles.badgeText, { color: STATUS_COLOR[tx.status] }]}>
                {tx.status}
              </Text>
            </View>
          </View>
        </View>
        <Text style={styles.date}>{fmtDate(tx.requestedAt)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.bg.subtle,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  icon: {
    fontSize: 18,
    fontWeight: '700',
  },
  body: {
    flex: 1,
  },
  topLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  type: {
    color: Colors.text.primary,
    fontSize: 15,
    fontWeight: '600',
  },
  amount: {
    fontSize: 15,
    fontWeight: '700',
  },
  bottomLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 3,
  },
  note: {
    color: Colors.text.secondary,
    fontSize: 12,
    flex: 1,
    marginRight: 8,
  },
  rightMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  fee: {
    color: Colors.text.muted,
    fontSize: 11,
  },
  badge: {
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  date: {
    color: Colors.text.muted,
    fontSize: 11,
    marginTop: 3,
  },
});
