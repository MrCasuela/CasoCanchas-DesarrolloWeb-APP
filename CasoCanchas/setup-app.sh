#!/bin/bash
# Script para crear la estructura de la app React Native

APP_DIR="/media/pablo/hdd-linux1/Github/CasoCanchas-DesarrolloWeb-APP/CasoCanchas"
cd $APP_DIR

echo "Creando archivos de servicios..."

# === src/constants/config.ts ===
cat > src/constants/config.ts << 'EOF'
export const API_CONFIG = {
  // Cambia esto a la IP de tu EC2 cuando esté lista
  BASE_URL: __DEV__ 
    ? 'http://127.0.0.1:8000'  // Desarrollo local
    : 'http://ec2-18-229-150-244.sa-east-1.compute.amazonaws.com:8000',  // Producción
  TIMEOUT: 10000,
};

export const STORAGE_KEYS = {
  AUTH_TOKEN: '@CasoCanchas:token',
  USER_DATA: '@CasoCanchas:user',
};
EOF

# === src/services/api.ts ===
cat > src/services/api.ts << 'EOF'
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG, STORAGE_KEYS } from '../constants/config';

const api = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para añadir token automáticamente
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token inválido o expirado
      await AsyncStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
      await AsyncStorage.removeItem(STORAGE_KEYS.USER_DATA);
    }
    return Promise.reject(error);
  }
);

export default api;
EOF

# === src/services/auth.service.ts ===
cat > src/services/auth.service.ts << 'EOF'
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
  telefono?: string;
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
    const formData = new URLSearchParams();
    formData.append('username', credentials.email);
    formData.append('password', credentials.password);

    const { data } = await api.post('/api/v1/auth/login', formData, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });

    await AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, data.access_token);
    await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(data.user));

    return data;
  },

  async register(userData: RegisterData): Promise<AuthResponse> {
    const { data } = await api.post('/api/v1/auth/register', userData);
    
    await AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, data.access_token);
    await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(data.user));

    return data;
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
EOF

# === src/services/canchas.service.ts ===
cat > src/services/canchas.service.ts << 'EOF'
import api from './api';

export interface Cancha {
  id: number;
  codigo: string;
  nombre: string;
  deporte: string;
  imagen: string;
  color: string;
  precio: number;
}

export const canchasService = {
  async getCanchas(): Promise<Cancha[]> {
    try {
      const [canchasRes, deportesRes] = await Promise.all([
        api.get('/api/v1/canchas/'),
        api.get('/api/v1/deportes/'),
      ]);

      const deportesMap = new Map(
        (deportesRes.data || []).map((d: any) => [d.id_deporte, d.nombre])
      );

      return (canchasRes.data || []).map((c: any) => ({
        id: c.id_cancha,
        codigo: c.codigo,
        nombre: c.nombre,
        deporte: deportesMap.get(c.id_deporte) || 'desconocido',
        imagen: c.imagen_url || '',
        color: c.color || '#000000',
        precio: Number(c.precio_hora),
      }));
    } catch (error) {
      console.error('Error cargando canchas:', error);
      return [];
    }
  },
};
EOF

# === src/services/reservas.service.ts ===
cat > src/services/reservas.service.ts << 'EOF'
import api from './api';

export interface Reserva {
  id: number;
  canchaId: number;
  fecha: string;
  hora: string;
}

export interface CreateReservaData {
  id_usuario: number;
  id_cancha: number;
  fecha: string;
  hora: string;
  duracion?: number;
  precio_total: number;
}

export const reservasService = {
  async getReservas(usuarioId?: number): Promise<Reserva[]> {
    try {
      const url = usuarioId
        ? `/api/v1/reservas/?usuario_id=${usuarioId}`
        : '/api/v1/reservas/';
      const { data } = await api.get(url);
      return (data || []).map((r: any) => ({
        id: r.id_reserva,
        canchaId: r.id_cancha,
        fecha: r.fecha,
        hora: r.hora,
      }));
    } catch (error) {
      console.error('Error cargando reservas:', error);
      return [];
    }
  },

  async createReserva(reservaData: CreateReservaData) {
    const payload = {
      ...reservaData,
      duracion: reservaData.duracion || 60,
      estado: 'Reservada',
    };
    const { data } = await api.post('/api/v1/reservas/', payload);
    return data;
  },

  async cancelReserva(id: number) {
    const { data } = await api.delete(`/api/v1/reservas/${id}`);
    return data;
  },
};
EOF

# === src/services/clima.service.ts ===
cat > src/services/clima.service.ts << 'EOF'
import api from './api';

export interface ClimaData {
  fecha: string;
  temperaturaMax: number;
  temperaturaMin: number;
  probabilidadPrecipitacion: number;
  codigoClima: number;
}

export interface ClimaResponse {
  success: boolean;
  data?: ClimaData;
  error?: string;
}

export const climaService = {
  async obtenerClima(fecha: string): Promise<ClimaResponse> {
    if (!fecha) {
      return {
        success: false,
        error: 'Fecha no válida',
      };
    }

    try {
      const { data } = await api.get(`/api/v1/clima?fecha=${fecha}`);
      return data;
    } catch (error: any) {
      console.error('Error obteniendo clima:', error);
      return {
        success: false,
        error: error?.response?.data?.error || 'Error al conectar con el servicio de clima',
      };
    }
  },

  obtenerDescripcionClima(codigo: number): string {
    const descripciones: Record<number, string> = {
      0: 'Despejado',
      1: 'Principalmente despejado',
      2: 'Parcialmente nublado',
      3: 'Nublado',
      45: 'Niebla',
      48: 'Niebla con escarcha',
      51: 'Llovizna ligera',
      53: 'Llovizna moderada',
      55: 'Llovizna intensa',
      61: 'Lluvia ligera',
      63: 'Lluvia moderada',
      65: 'Lluvia intensa',
      71: 'Nevada ligera',
      73: 'Nevada moderada',
      75: 'Nevada intensa',
      77: 'Granizo',
      80: 'Chubascos ligeros',
      81: 'Chubascos moderados',
      82: 'Chubascos intensos',
      85: 'Nevadas ligeras',
      86: 'Nevadas intensas',
      95: 'Tormenta',
      96: 'Tormenta con granizo ligero',
      99: 'Tormenta con granizo intenso',
    };
    return descripciones[codigo] || 'Desconocido';
  },

  obtenerIconoClima(codigo: number): string {
    if (codigo === 0 || codigo === 1) return '☀️';
    if (codigo === 2 || codigo === 3) return '⛅';
    if (codigo === 45 || codigo === 48) return '🌫️';
    if (codigo >= 51 && codigo <= 55) return '🌦️';
    if (codigo >= 61 && codigo <= 65) return '🌧️';
    if (codigo >= 71 && codigo <= 77) return '❄️';
    if (codigo >= 80 && codigo <= 82) return '🌧️';
    if (codigo >= 85 && codigo <= 86) return '❄️';
    if (codigo >= 95 && codigo <= 99) return '⛈️';
    return '🌤️';
  },
};
EOF

echo "✓ Servicios creados"
echo ""
echo "Ahora instala las dependencias con:"
echo "  cd $APP_DIR && npm install"
echo ""
echo "Luego inicia la app con:"
echo "  npm start"
