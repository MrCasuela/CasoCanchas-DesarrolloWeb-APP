import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Cancha } from '../types';
import { StarRating } from './StarRating';

interface CanchaCardProps {
  cancha: Cancha;
  onPress: () => void;
  rating?: number;
}

export const CanchaCard: React.FC<CanchaCardProps> = ({ cancha, onPress, rating }) => {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={[styles.colorBar, { backgroundColor: cancha.color }]} />
      <View style={styles.content}>
        <Text style={styles.nombre}>{cancha.nombre}</Text>
        <Text style={styles.deporte}>{cancha.deporte}</Text>
        {rating !== undefined && rating > 0 && (
          <StarRating rating={rating} size={14} showNumber />
        )}
        <Text style={styles.codigo}>Código: {cancha.codigo}</Text>
        <Text style={styles.precio}>${cancha.precio}/hora</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  colorBar: {
    width: 6,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  nombre: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  deporte: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  codigo: {
    fontSize: 12,
    color: '#999',
    marginBottom: 8,
  },
  precio: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
  },
});
