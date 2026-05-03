/**
 * ดาวเทวา — FaceZoneSelector
 * Reusable component for selecting a feature within a face zone.
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors } from '../theme/colors';
import { FaceZone, FaceFeatureOption, ELEMENT_META } from '../engines/FaceReadingEngine';

interface FaceZoneSelectorProps {
  zone: FaceZone;
  selectedFeatureId: string | null;
  onSelect: (featureId: string) => void;
}

export function FaceZoneSelector({ zone, selectedFeatureId, onSelect }: FaceZoneSelectorProps) {
  const elementColor = ELEMENT_META[zone.element].color;

  return (
    <View style={S.container}>
      {/* Zone header */}
      <View style={[S.header, { borderLeftColor: elementColor }]}>
        <Text style={S.symbol}>{zone.symbol}</Text>
        <View style={S.headerText}>
          <Text style={[S.zoneName, { color: elementColor }]}>{zone.nameThai}</Text>
          <Text style={S.ageRange}>{zone.ageRange} · {zone.lifeAspectThai}</Text>
        </View>
      </View>

      {/* Feature options */}
      <View style={S.options}>
        {zone.features.map(feature => (
          <FeatureOption
            key={feature.id}
            feature={feature}
            isSelected={selectedFeatureId === feature.id}
            accentColor={elementColor}
            onPress={() => onSelect(feature.id)}
          />
        ))}
      </View>
    </View>
  );
}

// ─── Feature Option Card ──────────────────────────────────────────

interface FeatureOptionProps {
  feature: FaceFeatureOption;
  isSelected: boolean;
  accentColor: string;
  onPress: () => void;
}

function FeatureOption({ feature, isSelected, accentColor, onPress }: FeatureOptionProps) {
  const qualityDot: Record<string, string> = {
    auspicious:  '#4CAF50',
    neutral:     '#FFC107',
    challenging: '#EF5350',
  };

  return (
    <TouchableOpacity
      style={[
        S.option,
        isSelected && { borderColor: accentColor, backgroundColor: `${accentColor}14` },
      ]}
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityState={{ checked: isSelected }}
      hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
    >
      <View style={[S.qualityDot, { backgroundColor: qualityDot[feature.quality] }]} />
      <View style={S.optionBody}>
        <Text style={[S.optionLabel, isSelected && { color: accentColor }]}>
          {feature.labelThai}
        </Text>
        {isSelected && (
          <Text style={S.optionDesc}>{feature.descriptionThai}</Text>
        )}
      </View>
      {isSelected && (
        <Text style={[S.checkmark, { color: accentColor }]}>✓</Text>
      )}
    </TouchableOpacity>
  );
}

// ─── Styles ───────────────────────────────────────────────────────

const S = StyleSheet.create({
  container: {
    marginBottom: 16,
    backgroundColor: Colors.bg.dark,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderLeftWidth: 3,
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  symbol: { fontSize: 18 },
  headerText: { flex: 1 },
  zoneName: { fontSize: 14, fontWeight: '600', letterSpacing: 0.5 },
  ageRange: { fontSize: 10, color: Colors.text.muted, marginTop: 2 },
  options: { padding: 10, gap: 8 },
  option: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: 'rgba(255,255,255,0.02)',
  },
  qualityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 4,
    flexShrink: 0,
  },
  optionBody: { flex: 1 },
  optionLabel: { fontSize: 13, color: Colors.text.secondary },
  optionDesc: { fontSize: 11, color: Colors.text.muted, marginTop: 4, lineHeight: 16 },
  checkmark: { fontSize: 14, fontWeight: '700', alignSelf: 'center' },
});
