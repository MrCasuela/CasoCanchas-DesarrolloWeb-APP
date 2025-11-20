import api from './api';

export interface Reserva {
  id: number;
  usuarioId?: number;
  canchaId: number;
  fecha: string;
  hora: string;
  duracion?: number;
  precioTotal?: number;
  estado?: string;
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
      return (data || [])
        .filter((r: any) => r.estado !== 'Cancelada')
        .map((r: any) => ({
          id: r.id_reserva,
          usuarioId: r.id_usuario,
          canchaId: r.id_cancha,
          fecha: r.fecha,
          hora: r.hora,
          duracion: r.duracion,
          precioTotal: r.precio_total,
          estado: r.estado,
        }));
    } catch (error) {
      console.error('Error cargando reservas:', error);
      return [];
    }
  },

  async getReservasPorCanchaYFecha(canchaId: number, fecha: string): Promise<Reserva[]> {
    try {
      const { data } = await api.get(`/api/v1/reservas/?cancha_id=${canchaId}&fecha=${fecha}`);
      return (data || [])
        .filter((r: any) => r.estado !== 'Cancelada')
        .map((r: any) => ({
          id: r.id_reserva,
          usuarioId: r.id_usuario,
          canchaId: r.id_cancha,
          fecha: r.fecha,
          hora: r.hora,
          duracion: r.duracion,
          precioTotal: r.precio_total,
          estado: r.estado,
        }));
    } catch (error) {
      console.error('Error cargando reservas por cancha y fecha:', error);
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
