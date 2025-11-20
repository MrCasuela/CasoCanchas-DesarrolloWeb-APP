import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { TimeSlot as TimeSlotType } from '../types';

interface TimeSlotProps {
  slot: TimeSlotType;
  onPress: () => void;
  selected?: boolean;
}

export const TimeSlot: React.FC<TimeSlotProps> = ({ slot, onPress, selected }) => {
  return (
    <TouchableOpacity
      style={[
        styles.slot,
        !slot.disponible && styles.slotDisabled,
        selected && styles.slotSelected,
      ]}
      onPress={onPress}
      disabled={!slot.disponible}
    >
      <Text
        style={[
          styles.text,
          !slot.disponible && styles.textDisabled,
          selected && styles.textSelected,
        ]}
      >
        {slot.hora}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  slot: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#007AFF',
    margin: 4,
    minWidth: 80,
    alignItems: 'center',
  },
  slotDisabled: {
    borderColor: '#CCC',
    backgroundColor: '#F5F5F5',
  },
  slotSelected: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  text: {
    color: '#007AFF',
    fontWeight: '600',
    fontSize: 14,
  },
  textDisabled: {
    color: '#999',
  },
  textSelected: {
    color: '#FFF',
  },
});
