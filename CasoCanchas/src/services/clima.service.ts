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
