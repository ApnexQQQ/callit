import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface AccuracyBadgeProps {
  accuracy: number;
  size?: 'small' | 'medium' | 'large';
}

export function AccuracyBadge({ accuracy, size = 'medium' }: AccuracyBadgeProps) {
  const getColor = (acc: number) => {
    if (acc >= 80) return '#22c55e';
    if (acc >= 60) return '#eab308';
    if (acc >= 40) return '#f97316';
    return '#ef4444';
  };

  const sizeStyles = {
    small: { width: 40, height: 40, fontSize: 12 },
    medium: { width: 60, height: 60, fontSize: 16 },
    large: { width: 80, height: 80, fontSize: 20 },
  };

  const s = sizeStyles[size];

  return (
    <View style={[styles.container, { width: s.width, height: s.height, borderColor: getColor(accuracy) }]}>
      <Text style={[styles.percentage, { color: getColor(accuracy), fontSize: s.fontSize }]}>
        {accuracy}%
      </Text>
      <Text style={[styles.label, { fontSize: s.fontSize * 0.5 }]}>ACCURACY</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 100,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1a1a1a',
  },
  percentage: {
    fontWeight: 'bold',
  },
  label: {
    color: '#666',
    fontWeight: '600',
    marginTop: 2,
  },
});
