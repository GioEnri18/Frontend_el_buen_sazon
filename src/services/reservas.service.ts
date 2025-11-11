import api from './api';
import type { Reserva, DisponibilidadMesa } from '../types';

export const reservasService = {
  // Obtener todas las reservas
  getAll: async () => {
    const response = await api.get<Reserva[]>('/reservas');
    return response.data;
  },

  // Obtener reserva por ID
  getById: async (id: number) => {
    const response = await api.get<Reserva>(`/reservas/${id}`);
    return response.data;
  },

  // Obtener reservas del día
  getDelDia: async (fecha?: string) => {
    const params = fecha ? { fecha } : {};
    const response = await api.get<Reserva[]>('/reservas/dia', { params });
    return response.data;
  },

  // Consultar disponibilidad de mesas
  getDisponibilidad: async (fecha: string, hora: string) => {
    const response = await api.get<DisponibilidadMesa[]>(
      '/reservas/disponibilidad',
      {
        params: { fecha, hora },
      }
    );
    return response.data;
  },

  // Crear reserva
  create: async (reserva: {
    fecha_hora: string;
    numero_personas: number;
    mesa_numero: number;
    cliente_id: number;
    observaciones?: string;
  }) => {
    const response = await api.post<Reserva>('/reservas', reserva);
    return response.data;
  },

  // Actualizar reserva
  update: async (id: number, reserva: Partial<Reserva>) => {
    const response = await api.patch<Reserva>(`/reservas/${id}`, reserva);
    return response.data;
  },

  // Cancelar reserva
  cancelar: async (id: number) => {
    const response = await api.patch<Reserva>(`/reservas/${id}/cancelar`);
    return response.data;
  },

  // Eliminar reserva
  delete: async (id: number) => {
    const response = await api.delete(`/reservas/${id}`);
    return response.data;
  },
};
