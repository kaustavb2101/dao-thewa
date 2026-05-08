import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '../../theme/colors';
import { useEWAStore, PayCycle } from '../../stores/ewaStore';

const CYCLE_LABELS: Record<PayCycle, string> = {
  weekly: 'Weekly',
  biweekly: 'Bi-weekly',
  semimonthly: 'Semi-monthly',
  monthly: 'Monthly',
};

function fmt(n: number) {
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 });
}

function Row({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={[styles.rowValue, accent && { color: Colors.gold.bright }]}>{value}</Text>
    </View>
  );
}

export function EWAProfileScreen() {
  const nav = useNavigation();
  const { employee, account, currentPeriod } = useEWAStore();

  if (!employee || !account || !currentPeriod) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <Text style={styles.muted}>Loading profile…</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.headerRow}>
          <TouchableOpacity style={styles.backBtn} onPress={() => nav.goBack()}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.title}>My Profile</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Avatar block */}
        <View style={styles.avatarBlock}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarInitials}>{employee.avatarInitials}</Text>
          </View>
          <Text style={styles.name}>{employee.name}</Text>
          <Text style={styles.position}>{employee.position}</Text>
          <Text style={styles.employer}>{employee.employerName}</Text>
        </View>

        {/* Employment details */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Employment Details</Text>
          <Row label="Hourly rate" value={`${fmt(employee.hourlyRate)} / hr`} />
          <Row label="Pay cycle" value={CYCLE_LABELS[employee.payCycle]} />
          <Row label="Hours this period" value={`${currentPeriod.hoursWorked}h`} />
          <Row
            label="Gross earned"
            value={fmt(currentPeriod.grossEarned)}
          />
          <Row
            label="Net earned (est.)"
            value={fmt(currentPeriod.netEarned)}
            accent
          />
        </View>

        {/* Bank / payout */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Payout Account</Text>
          <Row label="Bank account" value={`••••${employee.bankLast4}`} />
          <Row label="Transfer speed" value="~2 minutes" />
          <Row label="Service fee" value={`${(account.feeRate * 100).toFixed(1)}%`} />
          <Row label="Max advance" value={`${(account.maxAdvancePercent * 100).toFixed(0)}% of net earned`} />
        </View>

        {/* Lifetime stats */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Lifetime Stats</Text>
          <Row label="Total advanced" value={fmt(account.lifetimeAdvanced)} />
          <Row label="Current repayment" value={fmt(account.pendingRepayment)} />
        </View>

        <View style={styles.footer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg.deep },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  muted: { color: Colors.text.muted, fontSize: 14 },

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

  avatarBlock: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.gold.faint,
    borderWidth: 2,
    borderColor: Colors.gold.warm,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarInitials: {
    color: Colors.gold.bright,
    fontSize: 28,
    fontWeight: '700',
  },
  name: {
    color: Colors.text.primary,
    fontSize: 22,
    fontWeight: '700',
  },
  position: {
    color: Colors.text.secondary,
    fontSize: 14,
    marginTop: 4,
  },
  employer: {
    color: Colors.text.muted,
    fontSize: 13,
    marginTop: 2,
  },

  card: {
    marginHorizontal: 16,
    marginBottom: 12,
    backgroundColor: Colors.bg.dark,
    borderRadius: 16,
    padding: 16,
  },
  cardTitle: {
    color: Colors.text.muted,
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.bg.subtle,
  },
  rowLabel: { color: Colors.text.secondary, fontSize: 14 },
  rowValue: { color: Colors.text.primary, fontSize: 14, fontWeight: '600' },

  footer: { height: 40 },
});
