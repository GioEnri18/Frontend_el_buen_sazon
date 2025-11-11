import { useState, useEffect } from 'react';
import { clientesService } from '../services/clientes.service';
import { reservasService } from '../services/reservas.service';
import type { Cliente, Reserva } from '../types';
import './Clientes.css';

interface ClienteConReserva extends Cliente {
  reservaActiva?: Reserva;
}

const Clientes = () => {
  const [clientes, setClientes] = useState<ClienteConReserva[]>([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');

  useEffect(() => {
    loadClientes();
  }, []);

  const loadClientes = async () => {
    setLoading(true);
    try {
      const data = await clientesService.getAll();
      
      // Obtener todas las reservas del día
      const reservasHoy = await reservasService.getDelDia();
      
      // Crear un mapa de clientes con sus reservas activas
      const clientesConReservas: ClienteConReserva[] = data.map(cliente => {
        // Buscar si el cliente tiene una reserva activa hoy
        const reservaActiva = reservasHoy.find(
          reserva => reserva.cliente_id === cliente.id && 
                     (reserva.estado === 'pendiente' || reserva.estado === 'confirmada')
        );
        
        return {
          ...cliente,
          reservaActiva
        };
      });
      
      setClientes(clientesConReservas);
    } catch (error) {
      console.error('Error al cargar clientes:', error);
    } finally {
      setLoading(false);
    }
  };

  const clientesFiltrados = clientes.filter(cliente => {
    const nombreCompleto = `${cliente.nombre} ${cliente.apellido}`.toLowerCase();
    const search = busqueda.toLowerCase();
    return nombreCompleto.includes(search) || 
           cliente.email.toLowerCase().includes(search) ||
           cliente.telefono.includes(search);
  });

  if (loading) {
    return <div className="loading">Cargando...</div>;
  }

  return (
    <div className="clientes-page">
      <div className="clientes-header">
        <h1>Clientes</h1>
      </div>

      <div className="clientes-filters">
        <input
          type="text"
          placeholder="Buscar"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="search-input"
        />
        <button className="btn-refrescar" onClick={loadClientes}>
          🔄
        </button>
      </div>

      <div className="clientes-table-container">
        <table className="clientes-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Teléfono</th>
              <th>Email</th>
              <th>Reservación</th>
              <th>Creado</th>
            </tr>
          </thead>
          <tbody>
            {clientesFiltrados.map(cliente => (
              <tr key={cliente.id}>
                <td>{cliente.nombre} {cliente.apellido}</td>
                <td>{cliente.telefono}</td>
                <td>{cliente.email || '-'}</td>
                <td>
                  {cliente.reservaActiva ? (
                    <span style={{ 
                      backgroundColor: '#28a745', 
                      color: 'white', 
                      padding: '4px 12px', 
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: 'bold'
                    }}>
                      ✓ Mesa {cliente.reservaActiva.mesa_numero}
                    </span>
                  ) : (
                    <span style={{ color: '#6c757d' }}>-</span>
                  )}
                </td>
                <td>{cliente.createdAt ? new Date(cliente.createdAt).toLocaleDateString() : '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {clientesFiltrados.length === 0 && (
          <p className="no-results">Sin resultados</p>
        )}
        <div className="pagination">
          <span>Rows per page: 5</span>
          <span>0-0 of 0</span>
          <button disabled>←</button>
          <button disabled>→</button>
        </div>
      </div>
    </div>
  );
};

export default Clientes;
