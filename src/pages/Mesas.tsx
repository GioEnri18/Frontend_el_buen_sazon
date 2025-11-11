import { useState, useEffect } from 'react';
import { mesasService } from '../services/mesas.service';
import type { Mesa } from '../types';
import './Mesas.css';

const Mesas = () => {
  const [mesas, setMesas] = useState<Mesa[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState<'todas' | 'activas' | 'inactivas'>('todas');
  const [capacidadMin, setCapacidadMin] = useState<string>('');
  const [showModal, setShowModal] = useState(false);
  const [mesaEditando, setMesaEditando] = useState<Mesa | null>(null);

  useEffect(() => {
    loadMesas();
  }, [filtro]);

  const loadMesas = async () => {
    setLoading(true);
    try {
      const activas = filtro === 'activas' ? true : filtro === 'inactivas' ? false : undefined;
      const data = await mesasService.getAll(activas);
      setMesas(data);
    } catch (error) {
      console.error('Error al cargar mesas:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (numero: number) => {
    if (window.confirm('¿Está seguro de eliminar esta mesa?')) {
      try {
        await mesasService.delete(numero);
        loadMesas();
      } catch (error) {
        console.error('Error al eliminar mesa:', error);
        alert('Error al eliminar la mesa');
      }
    }
  };

  const handleActivar = async (numero: number, activa: boolean) => {
    try {
      await mesasService.update(numero, { activa: !activa });
      loadMesas();
    } catch (error) {
      console.error('Error al actualizar mesa:', error);
    }
  };

  const handleDuplicar = async (mesa: Mesa) => {
    const ultimoNumero = Math.max(...mesas.map(m => m.numero));
    try {
      await mesasService.create({
        numero: ultimoNumero + 1,
        capacidad: mesa.capacidad,
        ubicacion: mesa.ubicacion,
        activa: true,
      });
      loadMesas();
    } catch (error) {
      console.error('Error al duplicar mesa:', error);
    }
  };

  const mesasFiltradas = mesas.filter(mesa => {
    if (capacidadMin && mesa.capacidad < parseInt(capacidadMin)) {
      return false;
    }
    return true;
  });

  const totalMesas = mesas.length;
  const mesasActivas = mesas.filter(m => m.activa).length;
  const mesasInactivas = mesas.filter(m => !m.activa).length;
  const capacidadPromedio = mesas.length > 0
    ? (mesas.reduce((sum, m) => sum + m.capacidad, 0) / mesas.length).toFixed(1)
    : 0;

  if (loading) {
    return <div className="loading">Cargando...</div>;
  }

  return (
    <div className="mesas-page">
      <div className="mesas-header">
        <h1>Mesas</h1>
        <button className="btn-nueva" onClick={() => { setMesaEditando(null); setShowModal(true); }}>
          Nueva Mesa
        </button>
      </div>

      <div className="stats-row">
        <div className="stat-box">
          <h3>Total Mesas</h3>
          <p>{totalMesas}</p>
        </div>
        <div className="stat-box">
          <h3>Activas</h3>
          <p>{mesasActivas}</p>
        </div>
        <div className="stat-box">
          <h3>Inactivas</h3>
          <p>{mesasInactivas}</p>
        </div>
        <div className="stat-box">
          <h3>Capacidad Promedio</h3>
          <p>{capacidadPromedio}</p>
        </div>
      </div>

      <div className="mesas-filters">
        <div className="filter-group">
          <label>Buscar por número o ubicación</label>
          <input type="text" placeholder="Buscar..." />
        </div>
        <div className="filter-group">
          <label>Todos los estados</label>
          <select value={filtro} onChange={(e) => setFiltro(e.target.value as any)}>
            <option value="todas">Todos los estados</option>
            <option value="activas">Activas</option>
            <option value="inactivas">Inactivas</option>
          </select>
        </div>
        <div className="filter-group">
          <label>Capacidad mínima</label>
          <input 
            type="number" 
            placeholder="Capacidad mínima"
            value={capacidadMin}
            onChange={(e) => setCapacidadMin(e.target.value)}
          />
        </div>
        <button className="btn-reset" onClick={() => { setFiltro('todas'); setCapacidadMin(''); }}>
          Reset
        </button>
      </div>

      <div className="mesas-table-container">
        <table className="mesas-table">
          <thead>
            <tr>
              <th># MESA ▲</th>
              <th>CAPACIDAD</th>
              <th>UBICACIÓN</th>
              <th>ESTADO</th>
              <th>CREADA</th>
              <th>ACCIONES</th>
            </tr>
          </thead>
          <tbody>
            {mesasFiltradas.map(mesa => (
              <tr key={mesa.numero}>
                <td>{mesa.numero}</td>
                <td>{mesa.capacidad}</td>
                <td>{mesa.ubicacion}</td>
                <td>
                  <span className={`status ${mesa.activa ? 'activo' : 'inactivo'}`}>
                    {mesa.activa ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td>{mesa.createdAt ? new Date(mesa.createdAt).toLocaleDateString() : '-'}</td>
                <td>
                  <button className="btn-edit" onClick={() => { setMesaEditando(mesa); setShowModal(true); }}>
                    Editar
                  </button>
                  <button 
                    className={`btn-toggle ${mesa.activa ? '' : 'activar'}`}
                    onClick={() => handleActivar(mesa.numero, mesa.activa)}
                  >
                    {mesa.activa ? 'Desactivar' : 'Activar'}
                  </button>
                  <button className="btn-delete" onClick={() => handleDelete(mesa.numero)}>
                    Eliminar
                  </button>
                  <button className="btn-duplicate" onClick={() => handleDuplicar(mesa)}>
                    Duplicar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {mesasFiltradas.length === 0 && (
          <p className="no-results">Sin resultados</p>
        )}
      </div>

      {showModal && (
        <ModalMesa
          mesa={mesaEditando}
          onClose={() => setShowModal(false)}
          onSave={() => { loadMesas(); setShowModal(false); }}
        />
      )}
    </div>
  );
};

interface ModalMesaProps {
  mesa: Mesa | null;
  onClose: () => void;
  onSave: () => void;
}

const ModalMesa = ({ mesa, onClose, onSave }: ModalMesaProps) => {
  const [formData, setFormData] = useState({
    numero: mesa?.numero || 0,
    capacidad: mesa?.capacidad || 2,
    ubicacion: mesa?.ubicacion || '',
    activa: mesa?.activa ?? true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (mesa) {
        await mesasService.update(mesa.numero, formData);
      } else {
        await mesasService.create(formData);
      }
      onSave();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error al guardar la mesa');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>{mesa ? 'Editar Mesa' : 'Nueva Mesa'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Número de Mesa</label>
            <input
              type="number"
              value={formData.numero}
              onChange={(e) => setFormData({ ...formData, numero: parseInt(e.target.value) })}
              required
              disabled={!!mesa}
            />
          </div>
          <div className="form-group">
            <label>Capacidad</label>
            <input
              type="number"
              value={formData.capacidad}
              onChange={(e) => setFormData({ ...formData, capacidad: parseInt(e.target.value) })}
              required
            />
          </div>
          <div className="form-group">
            <label>Ubicación</label>
            <input
              type="text"
              value={formData.ubicacion}
              onChange={(e) => setFormData({ ...formData, ubicacion: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>
              <input
                type="checkbox"
                checked={formData.activa}
                onChange={(e) => setFormData({ ...formData, activa: e.target.checked })}
              />
              {' '}Mesa activa
            </label>
          </div>
          <div className="modal-actions">
            <button type="button" className="btn-cancel" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn-save">
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Mesas;
