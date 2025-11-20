import { Cancha } from '../types';
import { NavigatorScreenParams } from '@react-navigation/native';

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Reservas: undefined;
  Perfil: undefined;
};

export type RootStackParamList = {
  MainTabs: NavigatorScreenParams<MainTabParamList>;
  ReservaDetail: { cancha: Cancha };
  FeedbackScreen: { cancha: Cancha; reserva_id?: number };
};
