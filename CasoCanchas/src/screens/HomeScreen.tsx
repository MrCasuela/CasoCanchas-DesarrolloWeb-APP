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
import { canchasService } from '../services/canchas.service';
import { feedbackService } from '../services/feedback.service';
import { Cancha } from '../types';
import { CanchaCard, Loading } from '../components';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { MainTabParamList } from '../navigation/types';
import { CompositeNavigationProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

type HomeScreenNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, 'Home'>,
  StackNavigationProp<any>
>;

interface Props {
  navigation: HomeScreenNavigationProp;
}

export const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const [canchas, setCanchas] = useState<Cancha[]>([]);
  const [ratings, setRatings] = useState<Record<number, number>>({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadCanchas = async () => {
    try {
      const data = await canchasService.getCanchas();
      setCanchas(data);
      
      // Cargar calificaciones para cada cancha
      const ratingsMap: Record<number, number> = {};
      await Promise.all(
        data.map(async (cancha) => {
          const promedio = await feedbackService.getPromedioCalificacion(cancha.id);
          ratingsMap[cancha.id] = promedio;
        })
      );
      setRatings(ratingsMap);
    } catch (error) {
      Alert.alert('Error', 'No se pudieron cargar las canchas');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadCanchas();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadCanchas();
  };

  const handleCanchaPress = (cancha: Cancha) => {
    navigation.navigate('ReservaDetail', { cancha });
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Canchas Disponibles</Text>
        <Text style={styles.subtitle}>Selecciona una cancha para reservar</Text>
      </View>

      <FlatList
        data={canchas}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <CanchaCard 
            cancha={item} 
            onPress={() => handleCanchaPress(item)}
            rating={ratings[item.id]}
          />
        )}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No hay canchas disponibles</Text>
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
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
  },
});
