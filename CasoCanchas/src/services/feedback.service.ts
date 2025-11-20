import api from './api';

export interface Feedback {
  id: number;
  reservaId: number;
  usuarioId: number;
  canchaId: number;
  calificacion: number;
  comentario?: string;
  fecha: string;
  nombreUsuario?: string;
}

export interface CreateFeedbackData {
  reserva_id: number;
  usuario_id: number;
  calificacion: number;
  comentario?: string;
}

export const feedbackService = {
  async getFeedbackPorCancha(canchaId: number): Promise<Feedback[]> {
    try {
      const { data } = await api.get(`/api/v1/feedbacks/cancha/${canchaId}`);
      return (data || []).map((f: any) => ({
        id: f.id_feedback,
        reservaId: f.id_reserva,
        usuarioId: f.id_usuario,
        canchaId: f.id_cancha,
        calificacion: Number(f.calificacion),
        comentario: f.comentario,
        fecha: f.fecha,
        nombreUsuario: f.usuario_nombre,
      }));
    } catch (error) {
      console.error('Error cargando feedback:', error);
      return [];
    }
  },

  async getPromedioCalificacion(canchaId: number): Promise<number> {
    try {
      const feedbacks = await this.getFeedbackPorCancha(canchaId);
      if (feedbacks.length === 0) return 0;
      
      const suma = feedbacks.reduce((acc, f) => acc + f.calificacion, 0);
      const promedio = suma / feedbacks.length;
      
      console.log(`Cancha ${canchaId}: ${feedbacks.length} feedbacks, suma=${suma}, promedio=${promedio}`);
      console.log('Calificaciones:', feedbacks.map(f => f.calificacion));
      
      return promedio;
    } catch (error) {
      return 0;
    }
  },

  async createFeedback(feedbackData: CreateFeedbackData) {
    const { reserva_id, usuario_id, calificacion, comentario } = feedbackData;
    const body = {
      calificacion,
      ...(comentario && { comentario }),
    };
    const { data } = await api.post(
      `/api/v1/feedbacks/reserva/${reserva_id}?usuario_id=${usuario_id}`,
      body
    );
    return data;
  },

  async deleteFeedback(id: number) {
    const { data } = await api.delete(`/api/v1/feedbacks/${id}`);
    return data;
  },
};
