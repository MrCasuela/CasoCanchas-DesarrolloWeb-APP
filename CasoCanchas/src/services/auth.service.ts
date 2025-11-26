import api from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../constants/config';
import { auth } from '../constants/firebaseConfig';
import { GoogleAuthProvider, signInWithCredential } from 'firebase/auth';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  nombre: string;
  email: string;
  password: string;
  telefono: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user_id?: number;
  user?: {
    id_usuario: number;
    nombre: string;
    email: string;
    telefono?: string;
    firebase_uid?: string;
  };
}

export const authService = {
  // Login con JWT (email/password)
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    console.log('Intentando login JWT con:', credentials.email);
    try {
      // Intentar con JSON primero
      const { data } = await api.post('/api/v1/auth/login', {
        email: credentials.email,
        password: credentials.password,
      });

      console.log('Login JWT exitoso');

      if (!data.access_token) {
        throw new Error('No se recibió token de acceso');
      }

      // Guardar token
      await AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, data.access_token);

      // Guardar datos del usuario
      if (data.user) {
        await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(data.user));
      } else if (data.user_id) {
        const basicUser = {
          id_usuario: data.user_id,
          email: credentials.email,
          nombre: credentials.email.split('@')[0],
        };
        await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(basicUser));
      }

      return data;
    } catch (error: any) {
      console.error('Error en login JSON:', error.response?.data || error.message);
      
      // Reintentar con form-urlencoded si falla JSON (compatibilidad con OAuth2)
      if (error.response?.status === 422 || error.response?.status === 400) {
        console.log('Reintentando con form-urlencoded...');
        try {
          const formData = new URLSearchParams();
          formData.append('username', credentials.email);
          formData.append('password', credentials.password);

          const { data } = await api.post('/api/v1/auth/login', formData, {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          });

          if (!data.access_token) {
            throw new Error('No se recibió token de acceso');
          }

          await AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, data.access_token);
          
          if (data.user) {
            await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(data.user));
          } else if (data.user_id) {
            const basicUser = {
              id_usuario: data.user_id,
              email: credentials.email,
              nombre: credentials.email.split('@')[0],
            };
            await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(basicUser));
          }

          return data;
        } catch (retryError: any) {
          console.error('Error en retry:', retryError.response?.data || retryError.message);
          throw retryError;
        }
      }
      throw error;
    }
  },

  // Registro con JWT
  async register(userData: RegisterData): Promise<AuthResponse> {
    try {
      console.log('Enviando datos de registro...');
      const payload = {
        ...userData,
        telefono: userData.telefono || '',
      };
      
      const { data } = await api.post('/api/v1/auth/register', payload);
      console.log('Registro exitoso');

      // Si el registro no devuelve token, hacer login automático
      if (!data.access_token) {
        console.log('Haciendo login automático...');
        return await this.login({
          email: userData.email,
          password: userData.password,
        });
      }

      // Guardar token y datos
      await AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, data.access_token);
      if (data.user) {
        await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(data.user));
      }

      return data;
    } catch (error: any) {
      console.error('Error en registro:', error.response?.data || error.message);
      throw error;
    }
  },

  // Login con Firebase (usando el token de Firebase)
  // Login con Google (usando tokens de expo-auth-session)
  async loginWithGoogle(idToken: string, accessToken?: string): Promise<AuthResponse> {
    try {
      console.log('Procesando login con Google...');
      
      // Crear credencial de Google para Firebase
      const credential = GoogleAuthProvider.credential(idToken, accessToken);
      
      // Autenticar con Firebase
      const userCredential = await signInWithCredential(auth, credential);
      const firebaseUser = userCredential.user;
      
      // Obtener el ID token de Firebase
      const firebaseIdToken = await firebaseUser.getIdToken();
      
      console.log('Token de Firebase obtenido, enviando al backend...');
      
      // Enviar el token de Firebase al backend
      return await this.loginWithFirebase(firebaseIdToken);
    } catch (error: any) {
      console.error('Error en login con Google:', error);
      throw error;
    }
  },

  // Login con Firebase (usando el token de Firebase ID)
  async loginWithFirebase(firebaseIdToken: string): Promise<AuthResponse> {
    try {
      console.log('Iniciando login con Firebase...');
      
      const { data } = await api.post('/api/v1/auth/firebase/login', {
        id_token: firebaseIdToken,
      });

      console.log('Login Firebase exitoso');

      if (!data.access_token) {
        throw new Error('No se recibió token de acceso del backend');
      }

      // Guardar token JWT del backend
      await AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, data.access_token);
      
      if (data.user) {
        await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(data.user));
      }

      return data;
    } catch (error: any) {
      console.error('Error en login Firebase:', error.response?.data || error.message);
      throw error;
    }
  },

  async logout(): Promise<void> {
    console.log('Cerrando sesión...');
    try {
      // Intentar cerrar sesión de Firebase si está autenticado
      if (auth.currentUser) {
        await auth.signOut();
      }
    } catch (error) {
      console.log('Error cerrando sesión Firebase:', error);
    }
    await AsyncStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    await AsyncStorage.removeItem(STORAGE_KEYS.USER_DATA);
    console.log('Sesión cerrada');
  },

  async getCurrentUser() {
    try {
      const userJson = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);
      return userJson ? JSON.parse(userJson) : null;
    } catch (error) {
      console.error('Error obteniendo usuario actual:', error);
      return null;
    }
  },

  async isAuthenticated(): Promise<boolean> {
    try {
      const token = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
      return !!token;
    } catch (error) {
      console.error('Error verificando autenticación:', error);
      return false;
    }
  },
};
