import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { reservasService } from '../services/reservas.service';
import { canchasService } from '../services/canchas.service';
import { authService } from '../services/auth.service';
import { Reserva } from '../types';
import { Loading } from '../components';
import { RootStackParamList } from '../navigation/types';

type NavigationProp = StackNavigationProp<RootStackParamList>;

export const ReservasScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadReservas = async () => {
    try {
      const user = await authService.getCurrentUser();
      if (user) {
        const data = await reservasService.getReservas(user.id_usuario);
        setReservas(data);
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudieron cargar las reservas');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadReservas();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadReservas();
  };

  const handleCancelReserva = (reserva: Reserva) => {
    Alert.alert(
      'Cancelar Reserva',
      '¿Estás seguro de que deseas cancelar esta reserva?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Sí, cancelar',
          style: 'destructive',
          onPress: async () => {
            try {
              await reservasService.cancelReserva(reserva.id);
              Alert.alert('Éxito', 'Reserva cancelada correctamente');
              loadReservas();
            } catch (error) {
              Alert.alert('Error', 'No se pudo cancelar la reserva');
            }
          },
        },
      ]
    );
  };

  const handleFeedback = async (reserva: Reserva) => {
    try {
      const cancha = await canchasService.getCanchaById(reserva.canchaId);
      navigation.navigate('FeedbackScreen', { 
        cancha, 
        reserva_id: reserva.id 
      });
    } catch (error) {
      Alert.alert('Error', 'No se pudo cargar la información de la cancha');
    }
  };

  const renderReserva = ({ item }: { item: Reserva }) => (
    <View style={styles.card}>
      <View style={styles.cardContent}>
        <Text style={styles.fecha}>{item.fecha}</Text>
        <Text style={styles.hora}>{item.hora}</Text>
        <Text style={styles.canchaId}>Cancha #{item.canchaId}</Text>
      </View>
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.feedbackButton}
          onPress={() => handleFeedback(item)}
        >
          <Text style={styles.feedbackButtonText}>Calificar</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => handleCancelReserva(item)}
        >
          <Text style={styles.cancelButtonText}>Cancelar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return <Loading />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Mis Reservas</Text>
        <Text style={styles.subtitle}>Gestiona tus reservas activas</Text>
      </View>

      <FlatList
        data={reservas}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderReserva}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No tienes reservas activas</Text>
            <Text style={styles.emptySubtext}>
              Ve a la pestaña de inicio para reservar una cancha
            </Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    backgroundColor: '#FFF',
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
  },
  list: {
    paddingVertical: 8,
  },
  card: {
    backgroundColor: '#FFF',
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardContent: {
    flex: 1,
    marginBottom: 8,
  },
  fecha: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  hora: {
    fontSize: 16,
    color: '#007AFF',
    marginBottom: 4,
  },
  canchaId: {
    fontSize: 14,
    color: '#666',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  feedbackButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  feedbackButtonText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: '#FF3B30',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  cancelButtonText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 14,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#999',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#BBB',
    textAlign: 'center',
  },
});
