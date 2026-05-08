import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '../../theme/colors';
import { useEWAStore } from '../../stores/ewaStore';
import { QuickAmountPad } from '../../components/ewa/QuickAmountPad';

function fmt(n: number) {
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 });
}

type ModalState = 'hidden' | 'confirm' | 'success' | 'error';

export function EWAWithdrawScreen() {
  const nav = useNavigation();
  const { account, employee, withdrawAmount, setWithdrawAmount, requestAdvance, isLoading } = useEWAStore();
  const [modal, setModal] = useState<ModalState>('hidden');
  const [txId, setTxId] = useState('');
  const [errMsg, setErrMsg] = useState('');

  const available = Math.floor(account?.availableBalance ?? 0);
  const fee = withdrawAmount > 0 ? parseFloat((withdrawAmount * (account?.feeRate ?? 0.015)).toFixed(2)) : 0;
  const total = withdrawAmount + fee;

  const handleConfirm = async () => {
    setModal('hidden');
    const result = await requestAdvance(withdrawAmount);
    if (result.success && result.txId) {
      setTxId(result.txId);
      setModal('success');
    } else {
      setErrMsg(result.error ?? 'Transaction failed.');
      setModal('error');
    }
  };

  const handleDone = () => {
    setWithdrawAmount(0);
    setModal('hidden');
    nav.goBack();
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">

        {/* Header */}
        <View style={styles.headerRow}>
          <TouchableOpacity style={styles.backBtn} onPress={() => nav.goBack()}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Withdraw Wages</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Amount display */}
        <View style={styles.amountDisplay}>
          <Text style={styles.currencySign}>$</Text>
          <Text style={styles.amountText}>
            {withdrawAmount > 0 ? withdrawAmount.toLocaleString() : '0'}
          </Text>
        </View>
        <Text style={styles.availableHint}>
          Up to {fmt(available)} available
        </Text>

        {/* Fee summary */}
        {withdrawAmount > 0 && (
          <View style={styles.feeCard}>
            <View style={styles.feeRow}>
              <Text style={styles.feeLabel}>Advance amount</Text>
              <Text style={styles.feeValue}>{fmt(withdrawAmount)}</Text>
            </View>
            <View style={styles.feeRow}>
              <Text style={styles.feeLabel}>
                Service fee ({((account?.feeRate ?? 0.015) * 100).toFixed(1)}%)
              </Text>
              <Text style={styles.feeValue}>{fmt(fee)}</Text>
            </View>
            <View style={[styles.feeRow, styles.feeTotal]}>
              <Text style={styles.feeTotalLabel}>Total deducted at payday</Text>
              <Text style={styles.feeTotalValue}>{fmt(total)}</Text>
            </View>
            <Text style={styles.bankNote}>
              Deposits to bank ••••{employee?.bankLast4}
            </Text>
          </View>
        )}

        {/* Amount pad */}
        <View style={styles.padWrap}>
          <QuickAmountPad
            maxAmount={available}
            amount={withdrawAmount}
            onAmountChange={setWithdrawAmount}
          />
        </View>

        {/* Submit */}
        <TouchableOpacity
          style={[styles.submitBtn, (withdrawAmount <= 0 || isLoading) && styles.submitDisabled]}
          disabled={withdrawAmount <= 0 || isLoading}
          onPress={() => setModal('confirm')}>
          {isLoading
            ? <ActivityIndicator color={Colors.bg.deep} />
            : <Text style={styles.submitText}>Get {withdrawAmount > 0 ? fmt(withdrawAmount) : 'My Money'}</Text>
          }
        </TouchableOpacity>

        <Text style={styles.disclaimer}>
          Funds typically arrive within 2 minutes. The advance plus fee will be automatically
          repaid from your next paycheck.
        </Text>
      </ScrollView>

      {/* Confirm modal */}
      <Modal visible={modal === 'confirm'} transparent animationType="slide">
        <View style={styles.overlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Confirm Advance</Text>
            <Text style={styles.modalBody}>
              You're requesting {fmt(withdrawAmount)} with a {fmt(fee)} service fee. {'\n\n'}
              Total {fmt(total)} will be deducted from your next paycheck.
            </Text>
            <View style={styles.modalBtns}>
              <TouchableOpacity style={styles.modalCancel} onPress={() => setModal('hidden')}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalConfirm} onPress={handleConfirm}>
                <Text style={styles.modalConfirmText}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Success modal */}
      <Modal visible={modal === 'success'} transparent animationType="fade">
        <View style={styles.overlay}>
          <View style={styles.modalCard}>
            <Text style={styles.successIcon}>✓</Text>
            <Text style={styles.modalTitle}>Money on the Way!</Text>
            <Text style={styles.modalBody}>
              {fmt(withdrawAmount)} is being transferred to your bank. It should arrive in ~2 minutes.
            </Text>
            <Text style={styles.txRef}>Ref: {txId}</Text>
            <TouchableOpacity style={styles.modalConfirm} onPress={handleDone}>
              <Text style={styles.modalConfirmText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Error modal */}
      <Modal visible={modal === 'error'} transparent animationType="fade">
        <View style={styles.overlay}>
          <View style={styles.modalCard}>
            <Text style={styles.errorIcon}>✕</Text>
            <Text style={styles.modalTitle}>Transfer Failed</Text>
            <Text style={styles.modalBody}>{errMsg}</Text>
            <TouchableOpacity style={styles.modalConfirm} onPress={() => setModal('hidden')}>
              <Text style={styles.modalConfirmText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg.deep },
  scroll: { flexGrow: 1, paddingBottom: 24 },

  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: { color: Colors.text.primary, fontSize: 22 },
  title: { color: Colors.text.primary, fontSize: 18, fontWeight: '700' },

  amountDisplay: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    marginTop: 24,
    marginBottom: 4,
  },
  currencySign: {
    color: Colors.gold.bright,
    fontSize: 32,
    fontWeight: '300',
    marginBottom: 8,
    marginRight: 4,
  },
  amountText: {
    color: Colors.gold.bright,
    fontSize: 72,
    fontWeight: '700',
    lineHeight: 80,
  },
  availableHint: {
    color: Colors.text.muted,
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 16,
  },

  feeCard: {
    marginHorizontal: 16,
    backgroundColor: Colors.bg.dark,
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
  },
  feeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  feeLabel: { color: Colors.text.secondary, fontSize: 13 },
  feeValue: { color: Colors.text.primary, fontSize: 13, fontWeight: '600' },
  feeTotal: {
    borderTopWidth: 1,
    borderTopColor: Colors.bg.subtle,
    marginTop: 6,
    paddingTop: 10,
  },
  feeTotalLabel: { color: Colors.text.primary, fontSize: 14, fontWeight: '600' },
  feeTotalValue: { color: Colors.gold.bright, fontSize: 14, fontWeight: '700' },
  bankNote: {
    color: Colors.text.muted,
    fontSize: 11,
    marginTop: 8,
    textAlign: 'right',
  },

  padWrap: { paddingHorizontal: 16, marginBottom: 24 },

  submitBtn: {
    marginHorizontal: 16,
    height: 56,
    backgroundColor: Colors.gold.bright,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  submitDisabled: { opacity: 0.4 },
  submitText: {
    color: Colors.bg.deep,
    fontSize: 18,
    fontWeight: '700',
  },
  disclaimer: {
    color: Colors.text.muted,
    fontSize: 11,
    textAlign: 'center',
    paddingHorizontal: 24,
    lineHeight: 16,
  },

  // Modals
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: Colors.bg.dark,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },
  modalTitle: {
    color: Colors.text.primary,
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 12,
  },
  modalBody: {
    color: Colors.text.secondary,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  modalBtns: { flexDirection: 'row', gap: 10 },
  modalCancel: {
    flex: 1,
    height: 52,
    backgroundColor: Colors.bg.surface,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCancelText: { color: Colors.text.secondary, fontSize: 16, fontWeight: '600' },
  modalConfirm: {
    flex: 1,
    height: 52,
    backgroundColor: Colors.gold.bright,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalConfirmText: { color: Colors.bg.deep, fontSize: 16, fontWeight: '700' },

  successIcon: {
    fontSize: 48,
    color: Colors.success,
    textAlign: 'center',
    marginBottom: 8,
  },
  errorIcon: {
    fontSize: 48,
    color: Colors.danger,
    textAlign: 'center',
    marginBottom: 8,
  },
  txRef: {
    color: Colors.text.muted,
    fontSize: 11,
    textAlign: 'center',
    marginBottom: 20,
    fontFamily: 'monospace',
  },
});
