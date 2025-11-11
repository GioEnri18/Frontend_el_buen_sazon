export interface Mesa {
  numero: number;
  capacidad: number;
  ubicacion: string;
  activa: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Cliente {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  direccion?: string;
  activo: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Reserva {
  id: number;
  fecha_hora: string;
  numero_personas: number;
  estado: 'pendiente' | 'confirmada' | 'cancelada' | 'completada';
  observaciones?: string;
  mesa_numero: number;
  cliente_id: number;
  mesa?: Mesa;
  cliente?: Cliente;
  createdAt?: string;
  updatedAt?: string;
}

export interface DisponibilidadMesa extends Mesa {
  disponible: boolean;
}

export interface EstadisticasDashboard {
  totalReservasHoy: number;
  ocupacionActual: number;
  reservasCanceladas: number;
  capacidadPromedio: number;
}
