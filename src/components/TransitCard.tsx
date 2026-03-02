/**
 * ดาวเทวา — TransitCard
 * Individual transit/rule interpretation card
 * Color-coded: gold=auspicious, teal=neutral, red=caution
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  LayoutAnimation,
} from 'react-native';
import { Colors } from '../theme/colors';
import { IntensityBar } from './IntensityBar';
import type { InterpretationRule } from '../engines/ThaiRulesEngine';

interface Props {
  rule: InterpretationRule;
}

const CATEGORY_COLORS: Record<string, string> = {
  career: Colors.gold.bright,
  wealth: '#FFD700',
  love: '#FF69B4',
  health: '#81C784',
  travel: '#4FC3F7',
  family: '#FFB74D',
  spirituality: '#CE93D8',
  creativity: '#80CBC4',
  auspicious: Colors.gold.bright,
  inauspicious: Colors.danger,
  caution: Colors.warning,
};

export function TransitCard({ rule }: Props) {
  const [expanded, setExpanded] = useState(false);
  const accentColor = CATEGORY_COLORS[rule.category] ?? Colors.gold.warm;

  const toggleExpand = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(e => !e);
  };

  return (
    <TouchableOpacity
      onPress={toggleExpand}
      accessibilityRole="button"
      accessibilityState={{ expanded }}
      accessibilityLabel={`รายละเอียดคำทำนาย: ${rule.titleThai}`}
      style={[styles.card, { borderLeftColor: accentColor }]}
      activeOpacity={0.85}>
      {/* Header row */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: accentColor }]} numberOfLines={1}>
          {rule.titleThai}
        </Text>
        <IntensityBar intensity={rule.intensity} color={accentColor} />
      </View>

      <Text style={styles.subtitle} numberOfLines={expanded ? undefined : 2}>
        {rule.descriptionThai}
      </Text>

      {/* Expanded content */}
      {expanded && (
        <View style={styles.expanded}>
          <View style={styles.adviceRow}>
            <Text style={styles.adviceLabel}>คำแนะนำ</Text>
            <Text style={styles.adviceText}>{rule.adviceThai}</Text>
          </View>
          {rule.avoidThai && (
            <View style={[styles.adviceRow, styles.avoidRow]}>
              <Text style={[styles.adviceLabel, { color: Colors.danger }]}>หลีกเลี่ยง</Text>
              <Text style={[styles.adviceText, { color: Colors.danger }]}>{rule.avoidThai}</Text>
            </View>
          )}
          {rule.luckyColor && (
            <View style={styles.luckyRow}>
              <View style={[styles.colorDot, { backgroundColor: rule.luckyColor }]} />
              <Text style={styles.luckyText}>สีมงคล</Text>
              {rule.luckyNumber !== undefined && (
                <Text style={styles.luckyText}>  เลขมงคล {rule.luckyNumber}</Text>
              )}
            </View>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.bg.dark,
    borderRadius: 12,
    borderLeftWidth: 3,
    padding: 14,
    marginVertical: 6,
    marginHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  title: {
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
    marginRight: 8,
  },
  subtitle: {
    fontSize: 12,
    color: Colors.text.secondary,
    lineHeight: 18,
  },
  expanded: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.bg.subtle,
    gap: 8,
  },
  adviceRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'flex-start',
  },
  avoidRow: {
    backgroundColor: 'rgba(244,67,54,0.08)',
    borderRadius: 6,
    padding: 6,
  },
  adviceLabel: {
    fontSize: 10,
    color: Colors.gold.warm,
    fontWeight: '600',
    minWidth: 55,
    paddingTop: 1,
  },
  adviceText: {
    fontSize: 11,
    color: Colors.text.secondary,
    flex: 1,
    lineHeight: 16,
  },
  luckyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  colorDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  luckyText: {
    fontSize: 10,
    color: Colors.text.muted,
  },
});
