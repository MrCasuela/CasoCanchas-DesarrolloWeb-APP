export interface User {
  id_usuario: number;
  nombre: string;
  email: string;
  telefono?: string;
}

export interface Cancha {
  id: number;
  codigo: string;
  nombre: string;
  deporte: string;
  imagen: string;
  color: string;
  precio: number;
}

export interface Reserva {
  id: number;
  canchaId: number;
  fecha: string;
  hora: string;
  estado?: string;
}

export interface TimeSlot {
  hora: string;
  disponible: boolean;
}
