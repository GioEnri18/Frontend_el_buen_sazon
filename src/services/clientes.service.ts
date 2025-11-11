import api from './api';
import type { Cliente } from '../types';

export const clientesService = {
  // Obtener todos los clientes
  getAll: async (activos?: boolean) => {
    const params = activos ? { activos: true } : {};
    const response = await api.get<Cliente[]>('/clientes', { params });
    return response.data;
  },

  // Obtener cliente por ID
  getById: async (id: number) => {
    const response = await api.get<Cliente>(`/clientes/${id}`);
    return response.data;
  },

  // Obtener historial de reservas del cliente
  getHistorial: async (id: number) => {
    const response = await api.get(`/clientes/${id}/historial`);
    return response.data;
  },

  // Buscar cliente por email
  getByEmail: async (email: string) => {
    const response = await api.get<Cliente>(`/clientes/email/${email}`);
    return response.data;
  },

  // Buscar clientes por nombre
  buscar: async (nombre: string) => {
    const response = await api.get<Cliente[]>('/clientes/buscar', {
      params: { nombre },
    });
    return response.data;
  },

  // Crear cliente
  create: async (cliente: Omit<Cliente, 'id' | 'createdAt' | 'updatedAt'>) => {
    const response = await api.post<Cliente>('/clientes', cliente);
    return response.data;
  },

  // Actualizar cliente
  update: async (id: number, cliente: Partial<Cliente>) => {
    const response = await api.patch<Cliente>(`/clientes/${id}`, cliente);
    return response.data;
  },

  // Eliminar cliente
  delete: async (id: number) => {
    const response = await api.delete(`/clientes/${id}`);
    return response.data;
  },
};
