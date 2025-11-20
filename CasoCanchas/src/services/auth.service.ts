import api from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../constants/config';

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
  user: {
    id_usuario: number;
    nombre: string;
    email: string;
    telefono?: string;
  };
}

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    console.log('Intentando login con:', credentials.email);
    // Intentar primero con JSON (formato nuevo)
    try {
      const { data } = await api.post('/api/v1/auth/login', {
        email: credentials.email,
        password: credentials.password,
      });

      console.log('Login exitoso, datos recibidos:', data);
      
      if (!data.access_token) {
        throw new Error('No se recibió token de acceso');
      }

      await AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, data.access_token);
      
      // Si viene el objeto user completo, guardarlo, si no, crear uno básico
      if (data.user) {
        await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(data.user));
      } else if (data.user_id) {
        // Crear objeto user básico con la información disponible
        const basicUser = {
          id_usuario: data.user_id,
          email: credentials.email,
          nombre: credentials.email.split('@')[0],
        };
        await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(basicUser));
      }
      
      console.log('Token y usuario guardados exitosamente');

      return data;
    } catch (error: any) {
      console.error('Error en login (JSON):', error.response?.data);
      // Si falla, intentar con form-urlencoded (formato antiguo)
      if (error.response?.status === 422) {
        console.log('Intentando con form-urlencoded...');
        const formData = new URLSearchParams();
        formData.append('username', credentials.email);
        formData.append('password', credentials.password);

        const { data } = await api.post('/api/v1/auth/login', formData, {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        });

        console.log('Login exitoso (form), datos recibidos:', data);
        
        if (!data.access_token) {
          throw new Error('No se recibió token de acceso');
        }

        await AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, data.access_token);
        
        // Si viene el objeto user completo, guardarlo, si no, crear uno básico
        if (data.user) {
          await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(data.user));
        } else if (data.user_id) {
          // Crear objeto user básico con la información disponible
          const basicUser = {
            id_usuario: data.user_id,
            email: credentials.email,
            nombre: credentials.email.split('@')[0],
          };
          await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(basicUser));
        }
        
        console.log('Token y usuario guardados exitosamente');

        return data;
      }
      throw error;
    }
  },

  async register(userData: RegisterData): Promise<AuthResponse> {
    try {
      console.log('Enviando datos de registro:', userData);
      // Asegurar que telefono sea string vacío si no se proporciona
      const payload = {
        ...userData,
        telefono: userData.telefono || '',
      };
      const { data } = await api.post('/api/v1/auth/register', payload);
      console.log('Respuesta del servidor:', data);
      
      // El backend solo devuelve el usuario, no el token
      // Necesitamos hacer login después del registro
      if (!data.access_token) {
        console.log('No se recibió token, haciendo login automático...');
        return await this.login({
          email: userData.email,
          password: userData.password,
        });
      }
      
      await AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, data.access_token);
      await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(data.user));

      return data;
    } catch (error: any) {
      console.error('Error en authService.register:', error);
      console.error('Error response:', error.response);
      throw error;
    }
  },

  async logout(): Promise<void> {
    await AsyncStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    await AsyncStorage.removeItem(STORAGE_KEYS.USER_DATA);
  },

  async getCurrentUser() {
    const userJson = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);
    return userJson ? JSON.parse(userJson) : null;
  },

  async isAuthenticated(): Promise<boolean> {
    const token = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    return !!token;
  },
};
