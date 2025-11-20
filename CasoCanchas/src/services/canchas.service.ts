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

  async getCanchaById(id: number): Promise<Cancha> {
    try {
      const [canchaRes, deportesRes] = await Promise.all([
        api.get(`/api/v1/canchas/${id}`),
        api.get('/api/v1/deportes/'),
      ]);

      const deportesMap = new Map(
        (deportesRes.data || []).map((d: any) => [d.id_deporte, d.nombre])
      );

      const c = canchaRes.data;
      return {
        id: c.id_cancha,
        codigo: c.codigo,
        nombre: c.nombre,
        deporte: deportesMap.get(c.id_deporte) || 'desconocido',
        imagen: c.imagen_url || '',
        color: c.color || '#000000',
        precio: Number(c.precio_hora),
      };
    } catch (error) {
      console.error('Error cargando cancha:', error);
      throw error;
    }
  },
};
