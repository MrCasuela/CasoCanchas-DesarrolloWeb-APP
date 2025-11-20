import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  FlatList,
} from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { feedbackService, Feedback } from '../services/feedback.service';
import { authService } from '../services/auth.service';
import { StarRating } from '../components';
import { Cancha } from '../types';

type FeedbackScreenRouteProp = RouteProp<any, 'FeedbackScreen'>;
type FeedbackScreenNavigationProp = StackNavigationProp<any, 'FeedbackScreen'>;

interface Props {
  route: FeedbackScreenRouteProp;
  navigation: FeedbackScreenNavigationProp;
}

export const FeedbackScreen: React.FC<Props> = ({ route, navigation }) => {
  const { cancha, reserva_id } = route.params as { cancha: Cancha; reserva_id?: number };
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [calificacion, setCalificacion] = useState(0);
  const [comentario, setComentario] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Solo mostrar formulario de creación si hay reserva_id
  const canCreateFeedback = reserva_id !== undefined && reserva_id > 0;

  useEffect(() => {
    loadFeedbacks();
  }, []);

  const loadFeedbacks = async () => {
    try {
      const data = await feedbackService.getFeedbackPorCancha(cancha.id);
      setFeedbacks(data);
    } catch (error) {
      Alert.alert('Error', 'No se pudieron cargar los comentarios');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!canCreateFeedback) {
      Alert.alert('Error', 'No se puede crear feedback sin una reserva válida');
      return;
    }

    if (calificacion === 0) {
      Alert.alert('Error', 'Por favor selecciona una calificación');
      return;
    }

    setSubmitting(true);
    try {
      const user = await authService.getCurrentUser();
      if (!user) {
        Alert.alert('Error', 'Debes iniciar sesión');
        return;
      }

      await feedbackService.createFeedback({
        reserva_id: reserva_id!,
        usuario_id: user.id_usuario,
        calificacion,
        comentario: comentario || undefined,
      });

      Alert.alert('¡Éxito!', 'Gracias por tu valoración');
      setCalificacion(0);
      setComentario('');
      loadFeedbacks();
    } catch (error: any) {
      Alert.alert(
        'Error',
        error.response?.data?.detail || 'No se pudo enviar tu valoración'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const renderFeedback = ({ item }: { item: Feedback }) => (
    <View style={styles.feedbackCard}>
      <View style={styles.feedbackHeader}>
        <Text style={styles.feedbackUser}>{item.nombreUsuario || 'Usuario'}</Text>
        <StarRating rating={item.calificacion} size={14} />
      </View>
      {item.comentario && (
        <Text style={styles.feedbackComentario}>{item.comentario}</Text>
      )}
      <Text style={styles.feedbackFecha}>
        {new Date(item.fecha).toLocaleDateString('es-CL')}
      </Text>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.canchaInfo}>
        <Text style={styles.nombre}>{cancha.nombre}</Text>
        <Text style={styles.deporte}>{cancha.deporte}</Text>
      </View>

      {canCreateFeedback && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Deja tu valoración</Text>
          
          <View style={styles.starsContainer}>
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity
                key={star}
                onPress={() => setCalificacion(star)}
                style={styles.starButton}
              >
                <Ionicons
                  name={star <= calificacion ? 'star' : 'star-outline'}
                  size={40}
                  color="#FFB800"
                />
              </TouchableOpacity>
            ))}
          </View>

          <TextInput
            style={styles.textInput}
            placeholder="Escribe tu comentario (opcional)"
            value={comentario}
            onChangeText={setComentario}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />

          <TouchableOpacity
            style={[styles.button, submitting && styles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={submitting}
          >
            <Text style={styles.buttonText}>
              {submitting ? 'Enviando...' : 'Enviar valoración'}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          Valoraciones ({feedbacks.length})
        </Text>
        {feedbacks.length > 0 ? (
          <FlatList
            data={feedbacks}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderFeedback}
            scrollEnabled={false}
          />
        ) : (
          <Text style={styles.emptyText}>
            Aún no hay valoraciones. ¡Sé el primero!
          </Text>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  canchaInfo: {
    backgroundColor: '#FFF',
    padding: 20,
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
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
    marginBottom: 16,
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 16,
  },
  starButton: {
    marginHorizontal: 4,
  },
  textInput: {
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginBottom: 16,
    minHeight: 100,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  feedbackCard: {
    backgroundColor: '#F8F9FA',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  feedbackHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  feedbackUser: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  feedbackComentario: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  feedbackFecha: {
    fontSize: 12,
    color: '#999',
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    padding: 20,
  },
});
