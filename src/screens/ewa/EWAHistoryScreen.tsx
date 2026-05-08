import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '../../theme/colors';
import { useEWAStore, TransactionType, EWATransaction } from '../../stores/ewaStore';
import { TransactionRow } from '../../components/ewa/TransactionRow';

type Filter = 'all' | TransactionType;

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'advance', label: 'Advances' },
  { key: 'repayment', label: 'Repayments' },
  { key: 'fee', label: 'Fees' },
];

function fmt(n: number) {
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 });
}

export function EWAHistoryScreen() {
  const nav = useNavigation();
  const { transactions, isLoading, account } = useEWAStore();
  const [filter, setFilter] = useState<Filter>('all');

  const filtered = filter === 'all' ? transactions : transactions.filter(t => t.type === filter);

  const totalAdvanced = transactions
    .filter(t => t.type === 'advance' && t.status === 'completed')
    .reduce((s, t) => s + t.amount, 0);
  const totalFees = transactions
    .filter(t => t.type === 'advance' && t.status === 'completed')
    .reduce((s, t) => s + t.fee, 0);

  const renderItem = ({ item }: { item: EWATransaction }) => (
    <TransactionRow tx={item} />
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.headerRow}>
        <TouchableOpacity style={styles.backBtn} onPress={() => nav.goBack()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Transaction History</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Summary strip */}
      <View style={styles.summaryRow}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryValue}>{fmt(account?.lifetimeAdvanced ?? totalAdvanced)}</Text>
          <Text style={styles.summaryLabel}>Lifetime advanced</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Text style={styles.summaryValue}>{fmt(totalFees)}</Text>
          <Text style={styles.summaryLabel}>Total fees paid</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Text style={styles.summaryValue}>{transactions.filter(t => t.type === 'advance').length}</Text>
          <Text style={styles.summaryLabel}>Advances taken</Text>
        </View>
      </View>

      {/* Filter pills */}
      <View style={styles.filterRow}>
        {FILTERS.map(f => (
          <TouchableOpacity
            key={f.key}
            style={[styles.pill, filter === f.key && styles.pillActive]}
            onPress={() => setFilter(f.key)}>
            <Text style={[styles.pillText, filter === f.key && styles.pillTextActive]}>
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* List */}
      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator color={Colors.gold.bright} />
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.center}>
              <Text style={styles.emptyText}>No transactions found.</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg.deep },

  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  backIcon: { color: Colors.text.primary, fontSize: 22 },
  title: { color: Colors.text.primary, fontSize: 18, fontWeight: '700' },

  summaryRow: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 4,
    backgroundColor: Colors.bg.dark,
    borderRadius: 12,
    padding: 14,
    justifyContent: 'space-around',
  },
  summaryItem: { alignItems: 'center', flex: 1 },
  summaryValue: { color: Colors.text.primary, fontSize: 16, fontWeight: '700' },
  summaryLabel: { color: Colors.text.muted, fontSize: 11, marginTop: 3, textAlign: 'center' },
  summaryDivider: { width: 1, backgroundColor: Colors.bg.subtle },

  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: Colors.bg.dark,
    borderWidth: 1,
    borderColor: Colors.bg.subtle,
  },
  pillActive: {
    backgroundColor: Colors.gold.faint,
    borderColor: Colors.gold.bright,
  },
  pillText: {
    color: Colors.text.muted,
    fontSize: 13,
    fontWeight: '600',
  },
  pillTextActive: {
    color: Colors.gold.bright,
  },

  listContent: { paddingBottom: 24 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 60 },
  emptyText: { color: Colors.text.muted, fontSize: 14 },
});
