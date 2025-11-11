import api from './api';
import type { Mesa } from '../types';

export const mesasService = {
  // Obtener todas las mesas
  getAll: async (activas?: boolean) => {
    const params = activas ? { activas: true } : {};
    const response = await api.get<Mesa[]>('/mesas', { params });
    return response.data;
  },

  // Obtener mesa por número
  getByNumero: async (numero: number) => {
    const response = await api.get<Mesa>(`/mesas/${numero}`);
    return response.data;
  },

  // Obtener mesas por capacidad
  getByCapacidad: async (capacidad: number) => {
    const response = await api.get<Mesa[]>(`/mesas/capacidad/${capacidad}`);
    return response.data;
  },

  // Crear mesa
  create: async (mesa: Omit<Mesa, 'createdAt' | 'updatedAt'>) => {
    const response = await api.post<Mesa>('/mesas', mesa);
    return response.data;
  },

  // Actualizar mesa
  update: async (numero: number, mesa: Partial<Mesa>) => {
    const response = await api.patch<Mesa>(`/mesas/${numero}`, mesa);
    return response.data;
  },

  // Eliminar mesa
  delete: async (numero: number) => {
    const response = await api.delete(`/mesas/${numero}`);
    return response.data;
  },
};
