import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Calendar } from 'react-native-calendars';
import { Cancha, TimeSlot as TimeSlotType } from '../types';
import { TimeSlot } from '../components';
import { reservasService } from '../services/reservas.service';
import { authService } from '../services/auth.service';
import { climaService, ClimaData } from '../services/clima.service';

type ReservaDetailRouteProp = RouteProp<any, 'ReservaDetail'>;
type ReservaDetailNavigationProp = StackNavigationProp<any, 'ReservaDetail'>;

interface Props {
  route: ReservaDetailRouteProp;
  navigation: ReservaDetailNavigationProp;
}

const HORARIOS = [
  '08:00', '09:00', '10:00', '11:00', '12:00',
  '13:00', '14:00', '15:00', '16:00', '17:00',
  '18:00', '19:00', '20:00', '21:00', '22:00',
];

export const ReservaDetailScreen: React.FC<Props> = ({ route, navigation }) => {
  const { cancha } = route.params as { cancha: Cancha };
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [loading, setLoading] = useState(false);
  const [clima, setClima] = useState<ClimaData | null>(null);
  const [loadingClima, setLoadingClima] = useState(false);
  const [horariosOcupados, setHorariosOcupados] = useState<string[]>([]);
  const [loadingHorarios, setLoadingHorarios] = useState(false);

  useEffect(() => {
    if (selectedDate) {
      cargarClima(selectedDate);
      cargarDisponibilidad(selectedDate);
    }
  }, [selectedDate]);

  const cargarClima = async (fecha: string) => {
    setLoadingClima(true);
    try {
      const response = await climaService.obtenerClima(fecha);
      if (response.success && response.data) {
        setClima(response.data);
      } else {
        setClima(null);
      }
    } catch (error) {
      console.error('Error cargando clima:', error);
      setClima(null);
    } finally {
      setLoadingClima(false);
    }
  };

  const cargarDisponibilidad = async (fecha: string) => {
    setLoadingHorarios(true);
    try {
      const reservas = await reservasService.getReservasPorCanchaYFecha(cancha.id, fecha);
      const ocupados = reservas.map(r => r.hora);
      setHorariosOcupados(ocupados);
      console.log('Horarios ocupados:', ocupados);
    } catch (error) {
      console.error('Error cargando disponibilidad:', error);
      setHorariosOcupados([]);
    } finally {
      setLoadingHorarios(false);
    }
  };

  const timeSlots: TimeSlotType[] = HORARIOS.map((hora) => ({
    hora,
    disponible: !horariosOcupados.includes(hora),
  }));

  const handleReserva = async () => {
    if (!selectedDate || !selectedTime) {
      Alert.alert('Error', 'Por favor selecciona fecha y hora');
      return;
    }

    Alert.alert(
      'Confirmar Reserva',
      `¿Deseas reservar ${cancha.nombre} el ${selectedDate} a las ${selectedTime}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar',
          onPress: async () => {
            setLoading(true);
            try {
              const user = await authService.getCurrentUser();
              if (!user) {
                Alert.alert('Error', 'Debes iniciar sesión');
                return;
              }

              await reservasService.createReserva({
                id_usuario: user.id_usuario,
                id_cancha: cancha.id,
                fecha: selectedDate,
                hora: selectedTime,
                precio_total: cancha.precio,
              });

              // Recargar disponibilidad después de crear la reserva
              await cargarDisponibilidad(selectedDate);
              setSelectedTime(''); // Limpiar selección de hora

              Alert.alert('¡Éxito!', 'Reserva realizada correctamente', [
                {
                  text: 'Ver mis reservas',
                  onPress: () => {
                    // Volver al inicio y luego navegar a Reservas
                    navigation.navigate('MainTabs', { screen: 'Reservas' });
                  },
                },
                {
                  text: 'Hacer otra reserva',
                  style: 'cancel',
                },
              ]);
            } catch (error: any) {
              Alert.alert(
                'Error',
                error.response?.data?.detail || 'No se pudo realizar la reserva'
              );
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.canchaInfo}>
        <View style={[styles.colorBar, { backgroundColor: cancha.color }]} />
        <View style={styles.infoContent}>
          <Text style={styles.nombre}>{cancha.nombre}</Text>
          <Text style={styles.deporte}>{cancha.deporte}</Text>
          <Text style={styles.precio}>${cancha.precio}/hora</Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.feedbackButton}
        onPress={() => navigation.navigate('FeedbackScreen', { cancha })}
      >
        <Text style={styles.feedbackButtonText}>⭐ Ver valoraciones y opiniones</Text>
      </TouchableOpacity>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Selecciona una fecha</Text>
        <Calendar
          onDayPress={(day) => setSelectedDate(day.dateString)}
          markedDates={{
            [selectedDate]: {
              selected: true,
              selectedColor: '#007AFF',
            },
          }}
          minDate={new Date().toISOString().split('T')[0]}
          theme={{
            selectedDayBackgroundColor: '#007AFF',
            todayTextColor: '#007AFF',
            arrowColor: '#007AFF',
          }}
        />
      </View>

      {selectedDate && (
        <View style={styles.climaSection}>
          <Text style={styles.sectionTitle}>Clima para {selectedDate}</Text>
          {loadingClima ? (
            <ActivityIndicator size="small" color="#007AFF" />
          ) : clima ? (
            <View style={styles.climaCard}>
              <Text style={styles.climaIcono}>
                {climaService.obtenerIconoClima(clima.codigoClima)}
              </Text>
              <View style={styles.climaInfo}>
                <Text style={styles.climaDescripcion}>
                  {climaService.obtenerDescripcionClima(clima.codigoClima)}
                </Text>
                <Text style={styles.climaTemp}>
                  🌡️ {clima.temperaturaMin}°C - {clima.temperaturaMax}°C
                </Text>
                <Text style={styles.climaPrecip}>
                  💧 Probabilidad de lluvia: {clima.probabilidadPrecipitacion}%
                </Text>
              </View>
            </View>
          ) : (
            <Text style={styles.climaError}>
              No se pudo obtener información del clima
            </Text>
          )}
        </View>
      )}

      {selectedDate && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Selecciona una hora</Text>
          {loadingHorarios ? (
            <ActivityIndicator size="small" color="#007AFF" style={styles.loadingHorarios} />
          ) : (
            <View style={styles.timeSlotsContainer}>
              {timeSlots.map((slot) => (
                <TimeSlot
                  key={slot.hora}
                  slot={slot}
                  selected={selectedTime === slot.hora}
                  onPress={() => setSelectedTime(slot.hora)}
                />
              ))}
            </View>
          )}
        </View>
      )}

      {selectedDate && selectedTime && (
        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleReserva}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Procesando...' : 'Confirmar Reserva'}
          </Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  canchaInfo: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    marginBottom: 16,
    overflow: 'hidden',
  },
  colorBar: {
    width: 8,
  },
  infoContent: {
    flex: 1,
    padding: 20,
  },
  nombre: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  deporte: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  precio: {
    fontSize: 20,
    fontWeight: '600',
    color: '#007AFF',
  },
  feedbackButton: {
    backgroundColor: '#FFF',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FFB800',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  feedbackButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFB800',
  },
  section: {
    backgroundColor: '#FFF',
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  climaSection: {
    backgroundColor: '#FFF',
    padding: 16,
    marginBottom: 16,
  },
  climaCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  climaIcono: {
    fontSize: 48,
    marginRight: 16,
  },
  climaInfo: {
    flex: 1,
  },
  climaDescripcion: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  climaTemp: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  climaPrecip: {
    fontSize: 14,
    color: '#666',
  },
  climaError: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    padding: 16,
  },
  timeSlotsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },
  loadingHorarios: {
    marginVertical: 20,
  },
  button: {
    backgroundColor: '#007AFF',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '600',
  },
});
