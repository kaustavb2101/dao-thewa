import React, { useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors } from '../../theme/colors';
import { useEWAStore } from '../../stores/ewaStore';
import { BalanceCard } from '../../components/ewa/BalanceCard';
import { PayPeriodBanner } from '../../components/ewa/PayPeriodBanner';
import { TransactionRow } from '../../components/ewa/TransactionRow';
import type { EWAStackParamList } from '../../navigation/EWANavigator';

type Nav = NativeStackNavigationProp<EWAStackParamList, 'EWADashboard'>;

export function EWADashboardScreen() {
  const nav = useNavigation<Nav>();
  const { employee, account, currentPeriod, transactions, isLoading, loadData } = useEWAStore();

  useEffect(() => {
    loadData();
  }, []);

  const onRefresh = useCallback(() => { loadData(); }, []);

  if (!account || !currentPeriod || !employee) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          {isLoading
            ? <ActivityIndicator size="large" color={Colors.gold.bright} />
            : <Text style={styles.errorText}>Failed to load. Pull to refresh.</Text>
          }
        </View>
      </SafeAreaView>
    );
  }

  const recentTx = transactions.slice(0, 3);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={onRefresh}
            tintColor={Colors.gold.bright}
          />
        }>

        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Hello, {employee.name.split(' ')[0]} 👋</Text>
            <Text style={styles.employer}>{employee.employerName}</Text>
          </View>
          <TouchableOpacity
            style={styles.avatarCircle}
            onPress={() => nav.navigate('EWAProfile')}>
            <Text style={styles.avatarText}>{employee.avatarInitials}</Text>
          </TouchableOpacity>
        </View>

        {/* Balance card */}
        <BalanceCard account={account} period={currentPeriod} />

        {/* Pay period timeline */}
        <PayPeriodBanner period={currentPeriod} />

        {/* CTA */}
        <View style={styles.ctaRow}>
          <TouchableOpacity
            style={[styles.ctaBtn, styles.ctaPrimary, account.availableBalance <= 0 && styles.ctaDisabled]}
            disabled={account.availableBalance <= 0}
            onPress={() => nav.navigate('EWAWithdraw')}>
            <Text style={styles.ctaPrimaryText}>Get My Money</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.ctaBtn, styles.ctaSecondary]}
            onPress={() => nav.navigate('EWAHistory')}>
            <Text style={styles.ctaSecondaryText}>History</Text>
          </TouchableOpacity>
        </View>

        {/* Info strip */}
        <View style={styles.infoStrip}>
          <View style={styles.infoItem}>
            <Text style={styles.infoValue}>
              {(account.feeRate * 100).toFixed(1)}%
            </Text>
            <Text style={styles.infoLabel}>Fee per advance</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoValue}>
              {(account.maxAdvancePercent * 100).toFixed(0)}%
            </Text>
            <Text style={styles.infoLabel}>Max of earned</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoValue}>~2 min</Text>
            <Text style={styles.infoLabel}>Transfer time</Text>
          </View>
        </View>

        {/* Recent transactions */}
        {recentTx.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recent Activity</Text>
              <TouchableOpacity onPress={() => nav.navigate('EWAHistory')}>
                <Text style={styles.sectionLink}>See all</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.txList}>
              {recentTx.map(tx => <TransactionRow key={tx.id} tx={tx} />)}
            </View>
          </View>
        )}

        <View style={styles.footer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg.deep },
  scroll: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  errorText: { color: Colors.text.muted, fontSize: 14 },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 4,
  },
  greeting: {
    color: Colors.text.primary,
    fontSize: 22,
    fontWeight: '700',
  },
  employer: {
    color: Colors.text.muted,
    fontSize: 13,
    marginTop: 2,
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.gold.faint,
    borderWidth: 1,
    borderColor: Colors.gold.warm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: Colors.gold.bright,
    fontSize: 14,
    fontWeight: '700',
  },

  ctaRow: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 16,
    marginTop: 16,
  },
  ctaBtn: {
    flex: 1,
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaPrimary: {
    backgroundColor: Colors.gold.bright,
  },
  ctaSecondary: {
    backgroundColor: Colors.bg.dark,
    borderWidth: 1,
    borderColor: Colors.bg.subtle,
  },
  ctaDisabled: {
    opacity: 0.4,
  },
  ctaPrimaryText: {
    color: Colors.bg.deep,
    fontSize: 16,
    fontWeight: '700',
  },
  ctaSecondaryText: {
    color: Colors.text.secondary,
    fontSize: 16,
    fontWeight: '600',
  },

  infoStrip: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 16,
    backgroundColor: Colors.bg.dark,
    borderRadius: 12,
    padding: 14,
    justifyContent: 'space-around',
  },
  infoItem: { alignItems: 'center' },
  infoValue: {
    color: Colors.text.primary,
    fontSize: 16,
    fontWeight: '700',
  },
  infoLabel: {
    color: Colors.text.muted,
    fontSize: 11,
    marginTop: 3,
    textAlign: 'center',
  },

  section: { marginTop: 24 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  sectionTitle: {
    color: Colors.text.primary,
    fontSize: 16,
    fontWeight: '700',
  },
  sectionLink: {
    color: Colors.gold.bright,
    fontSize: 13,
  },
  txList: {
    backgroundColor: Colors.bg.dark,
    marginHorizontal: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },

  footer: { height: 32 },
});
