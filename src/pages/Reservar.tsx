import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { reservasService } from '../services/reservas.service';
import { mesasService } from '../services/mesas.service';
import { clientesService } from '../services/clientes.service';
import type { Mesa, DisponibilidadMesa } from '../types';
import './Reservar.css';

interface FormData {
  nombre: string;
  apellido: string;
  telefono: string;
  email: string;
  fecha: string;
  hora: string;
  personas: number;
  observaciones: string;
  mesa_numero: number;
}

const Reservar = () => {
  const { register, handleSubmit, formState: { errors }, reset, watch } = useForm<FormData>();
  const [mesas, setMesas] = useState<Mesa[]>([]);
  const [mesasDisponibles, setMesasDisponibles] = useState<DisponibilidadMesa[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const fecha = watch('fecha');
  const hora = watch('hora');
  const personas = watch('personas');

  useEffect(() => {
    loadMesas();
  }, []);

  useEffect(() => {
    if (fecha && hora) {
      checkDisponibilidad();
    }
  }, [fecha, hora]);

  const loadMesas = async () => {
    try {
      // Cargar TODAS las mesas (activas e inactivas) para depuración
      const todasLasMesas = await mesasService.getAll();
      console.log('TODAS las mesas (activas e inactivas):', todasLasMesas);
      
      // Cargar solo mesas activas para uso normal
      const data = await mesasService.getAll(true);
      console.log('Mesas activas:', data);
      console.log('Número de mesas activas:', data.length);
      setMesas(data);
      
      // Si no hay fecha/hora seleccionadas, usar las mesas cargadas como disponibles
      if (!fecha || !hora) {
        setMesasDisponibles(data.map(m => ({ ...m, disponible: true })));
      }
    } catch (error) {
      console.error('Error al cargar mesas:', error);
      setMessage({ 
        type: 'error', 
        text: 'No se pudo conectar con el servidor. Verifique que el backend esté iniciado.' 
      });
    }
  };

  const checkDisponibilidad = async () => {
    if (!fecha || !hora) return;
    
    try {
      console.log('Fecha original:', fecha);
      console.log('Hora original:', hora);
      console.log('Llamando a getDisponibilidad con:', { fecha, hora });
      
      const disponibilidad = await reservasService.getDisponibilidad(fecha, hora);
      console.log('Disponibilidad recibida:', disponibilidad);
      
      // Transformar la respuesta para que tenga el formato correcto
      // La API devuelve: [{ mesa: {...}, disponible: true, reservaExistente: null }]
      // Necesitamos: [{ ...mesa, disponible: true }]
      const mesasTransformadas = disponibilidad.map((item: any) => ({
        ...item.mesa,
        disponible: item.disponible
      }));
      
      console.log('Mesas transformadas:', mesasTransformadas);
      setMesasDisponibles(mesasTransformadas);
    } catch (error) {
      console.error('Error al verificar disponibilidad:', error);
      // Si hay error, mostrar todas las mesas
      setMesasDisponibles(mesas.map(m => ({ ...m, disponible: true })));
    }
  };

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    setMessage(null);
    
    try {
      console.log('=== INICIANDO CREACIÓN DE RESERVA ===');
      console.log('Datos del formulario:', data);
      
      // Primero buscar o crear el cliente
      let clienteId: number;
      
      try {
        // Si no hay email, crear cliente directamente
        if (!data.email || data.email.trim() === '') {
          console.log('No hay email, creando cliente sin buscar...');
          const nuevoCliente = await clientesService.create({
            nombre: data.nombre,
            apellido: data.apellido,
            email: data.email || `cliente_${Date.now()}@restaurante.com`, // Email temporal si no hay
            telefono: data.telefono,
            activo: true,
          });
          clienteId = nuevoCliente.id;
          console.log('Cliente creado con ID:', clienteId);
        } else {
          // Si hay email, intentar buscar primero
          console.log('Buscando cliente con email:', data.email);
          const clienteExistente = await clientesService.getByEmail(data.email);
          clienteId = clienteExistente.id;
          console.log('Cliente encontrado con ID:', clienteId);
        }
      } catch (error) {
        console.log('Cliente no encontrado, creando nuevo...');
        // Si no existe, crear nuevo cliente
        const nuevoCliente = await clientesService.create({
          nombre: data.nombre,
          apellido: data.apellido,
          email: data.email || `cliente_${Date.now()}@restaurante.com`,
          telefono: data.telefono,
          activo: true,
        });
        clienteId = nuevoCliente.id;
        console.log('Cliente creado con ID:', clienteId);
      }

      // Crear la reserva
      // Asegurarse de que la hora tenga el formato correcto HH:mm
      let horaFormateada = data.hora;
      if (!horaFormateada.includes(':')) {
        console.error('Formato de hora inválido:', horaFormateada);
        throw new Error('Formato de hora inválido');
      }
      
      // Si la hora no tiene segundos, agregarlos
      if (horaFormateada.split(':').length === 2) {
        horaFormateada = `${horaFormateada}:00`;
      }
      
      const fechaHora = `${data.fecha}T${horaFormateada}`;
      console.log('Fecha original:', data.fecha);
      console.log('Hora original:', data.hora);
      console.log('Hora formateada:', horaFormateada);
      console.log('Fecha y hora combinada:', fechaHora);
      console.log('Creando reserva con:', {
        fecha_hora: fechaHora,
        numero_personas: Number(data.personas),
        mesa_numero: Number(data.mesa_numero),
        cliente_id: clienteId,
        observaciones: data.observaciones
      });
      
      const reservaCreada = await reservasService.create({
        fecha_hora: fechaHora,
        numero_personas: Number(data.personas),
        mesa_numero: Number(data.mesa_numero),
        cliente_id: clienteId,
        observaciones: data.observaciones || undefined,
      });

      console.log('Reserva creada exitosamente:', reservaCreada);

      // Desactivar la mesa después de crear la reserva
      try {
        console.log('Desactivando mesa número:', data.mesa_numero);
        await mesasService.update(Number(data.mesa_numero), { activa: false });
        console.log('Mesa desactivada exitosamente');
      } catch (mesaError) {
        console.error('Error al desactivar mesa:', mesaError);
        // No lanzamos el error para no afectar la confirmación de la reserva
      }

      setMessage({ type: 'success', text: '¡Reserva creada exitosamente! La mesa ha sido marcada como ocupada.' });
      reset();
      // Recargar las mesas para actualizar la lista
      loadMesas();
    } catch (error: any) {
      console.error('=== ERROR AL CREAR RESERVA ===');
      console.error('Error completo:', error);
      console.error('Response status:', error.response?.status);
      console.error('Response data:', error.response?.data);
      console.error('Response message:', error.response?.data?.message);
      
      let mensajeError = 'Error al crear la reserva. Por favor intente nuevamente.';
      
      if (error.response?.data?.message) {
        mensajeError = error.response.data.message;
      } else if (error.response?.data?.error) {
        mensajeError = error.response.data.error;
      } else if (error.message) {
        mensajeError = error.message;
      }
      
      setMessage({ 
        type: 'error', 
        text: mensajeError
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="reservar-page">
      <div className="reservar-hero">
        <div className="reservar-overlay">
          <h1>Realizar una Reserva</h1>
        </div>
      </div>
      
      <div className="reservar-container">
        <div style={{ 
          backgroundColor: '#d1ecf1', 
          color: '#0c5460', 
          padding: '12px 20px', 
          borderRadius: '4px', 
          marginBottom: '20px',
          border: '1px solid #bee5eb'
        }}>
          ℹ️ <strong>Horario de atención:</strong> Las reservas están disponibles de 8:00 AM a 10:00 PM
        </div>
        
        <form className="reservar-form" onSubmit={handleSubmit(onSubmit)}>
          {message && (
            <div className={`message ${message.type}`}>
              {message.text}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="nombre">Nombre completo *</label>
            <input
              type="text"
              id="nombre"
              placeholder="Nombre completo"
              {...register('nombre', { required: 'El nombre es requerido' })}
            />
            {errors.nombre && <span className="error">{errors.nombre.message}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="apellido">Apellido *</label>
            <input
              type="text"
              id="apellido"
              placeholder="Apellido"
              {...register('apellido', { required: 'El apellido es requerido' })}
            />
            {errors.apellido && <span className="error">{errors.apellido.message}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="telefono">Teléfono de contacto *</label>
            <input
              type="tel"
              id="telefono"
              placeholder="Teléfono de contacto"
              {...register('telefono', { required: 'El teléfono es requerido' })}
            />
            {errors.telefono && <span className="error">{errors.telefono.message}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="email">Correo electrónico (opcional)</label>
            <input
              type="email"
              id="email"
              placeholder="Correo electrónico (opcional)"
              {...register('email')}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="fecha">Fecha de reserva *</label>
              <input
                type="date"
                id="fecha"
                {...register('fecha', { required: 'La fecha es requerida' })}
              />
              {errors.fecha && <span className="error">{errors.fecha.message}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="hora">Hora de reserva *</label>
              <select
                id="hora"
                {...register('hora', { required: 'La hora es requerida' })}
              >
                <option value="">Seleccione hora</option>
                <option value="08:00">8:00 AM</option>
                <option value="08:30">8:30 AM</option>
                <option value="09:00">9:00 AM</option>
                <option value="09:30">9:30 AM</option>
                <option value="10:00">10:00 AM</option>
                <option value="10:30">10:30 AM</option>
                <option value="11:00">11:00 AM</option>
                <option value="11:30">11:30 AM</option>
                <option value="12:00">12:00 PM</option>
                <option value="12:30">12:30 PM</option>
                <option value="13:00">1:00 PM</option>
                <option value="13:30">1:30 PM</option>
                <option value="14:00">2:00 PM</option>
                <option value="14:30">2:30 PM</option>
                <option value="15:00">3:00 PM</option>
                <option value="15:30">3:30 PM</option>
                <option value="16:00">4:00 PM</option>
                <option value="16:30">4:30 PM</option>
                <option value="17:00">5:00 PM</option>
                <option value="17:30">5:30 PM</option>
                <option value="18:00">6:00 PM</option>
                <option value="18:30">6:30 PM</option>
                <option value="19:00">7:00 PM</option>
                <option value="19:30">7:30 PM</option>
                <option value="20:00">8:00 PM</option>
                <option value="20:30">8:30 PM</option>
                <option value="21:00">9:00 PM</option>
                <option value="21:30">9:30 PM</option>
                <option value="22:00">10:00 PM</option>
              </select>
              {errors.hora && <span className="error">{errors.hora.message}</span>}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="personas">Número de personas *</label>
            <select
              id="personas"
              {...register('personas', { required: 'Seleccione el número de personas', valueAsNumber: true })}
            >
              <option value="">Seleccione</option>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                <option key={num} value={num}>{num}</option>
              ))}
            </select>
            {errors.personas && <span className="error">{errors.personas.message}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="observaciones">Notas o comentarios adicionales</label>
            <textarea
              id="observaciones"
              rows={4}
              placeholder="Notas o comentarios adicionales"
              {...register('observaciones')}
            />
          </div>

          <div className="form-group">
            <label htmlFor="mesa_numero">Selecciona una mesa *</label>

            <select
              id="mesa_numero"
              {...register('mesa_numero', { 
                required: 'Por favor seleccione una mesa',
                validate: (value) => !isNaN(Number(value)) && Number(value) > 0 || 'Debe seleccionar una mesa válida'
              })}
            >
              <option value="">Seleccione una mesa</option>
              {(() => {
                // Usar mesas disponibles si hay fecha/hora, sino usar todas
                let mesasParaMostrar = (fecha && hora && mesasDisponibles.length > 0)
                  ? mesasDisponibles.filter(m => m.disponible === true)
                  : mesas;
                
                console.log('=== DEBUG SELECT ===');
                console.log('Fecha y hora:', fecha, hora);
                console.log('Mesas disponibles originales:', mesasDisponibles);
                console.log('Mesas para mostrar (antes de filtrar):', mesasParaMostrar);
                
                const mesasFiltradas = mesasParaMostrar.filter(mesa => !personas || mesa.capacidad >= Number(personas));
                
                console.log('Personas seleccionadas:', personas);
                console.log('Mesas filtradas por capacidad:', mesasFiltradas.length);
                console.log('Mesas filtradas completas:', mesasFiltradas);
                
                if (mesasFiltradas.length === 0) {
                  console.error('❌ NO HAY MESAS PARA MOSTRAR');
                } else {
                  console.log('✅ HAY', mesasFiltradas.length, 'MESAS PARA MOSTRAR');
                }
                
                return mesasFiltradas.map((mesa, index) => {
                  const key = `mesa-${mesa.numero}-${index}`;
                  return (
                    <option key={key} value={mesa.numero}>
                      Mesa #{mesa.numero} - Cap: {mesa.capacidad} personas - {mesa.ubicacion}
                    </option>
                  );
                });
              })()}
            </select>
            {errors.mesa_numero && <span className="error">{errors.mesa_numero.message}</span>}
            {mesas.length === 0 && (
              <small style={{ color: '#dc3545', marginTop: '0.5rem', display: 'block' }}>
                ⚠️ No hay mesas registradas. Por favor, cree mesas primero desde el menú "MESAS".
              </small>
            )}
            {personas && mesas.length > 0 && mesas.filter(m => m.capacidad >= Number(personas)).length === 0 && (
              <small style={{ color: '#dc3545', marginTop: '0.5rem', display: 'block' }}>
                ⚠️ No hay mesas con capacidad para {personas} personas
              </small>
            )}
            {!fecha || !hora ? (
              personas && mesas.length > 0 && mesas.filter(m => m.capacidad >= Number(personas)).length > 0 && (
                <small style={{ color: '#0d6efd', marginTop: '0.5rem', display: 'block' }}>
                  ℹ️ {mesas.filter(m => m.capacidad >= Number(personas)).length} mesas con capacidad para {personas} personas
                </small>
              )
            ) : (
              <>
                {mesasDisponibles.length > 0 && mesasDisponibles.filter(m => m.disponible && (!personas || m.capacidad >= Number(personas))).length === 0 && (
                  <small style={{ color: '#dc3545', marginTop: '0.5rem', display: 'block' }}>
                    ⚠️ No hay mesas disponibles para esta fecha, hora y número de personas
                  </small>
                )}
                {mesasDisponibles.length > 0 && mesasDisponibles.filter(m => m.disponible && (!personas || m.capacidad >= Number(personas))).length > 0 && (
                  <small style={{ color: '#28a745', marginTop: '0.5rem', display: 'block' }}>
                    ✓ {mesasDisponibles.filter(m => m.disponible && (!personas || m.capacidad >= Number(personas))).length} mesas disponibles para {personas ? `${personas} personas` : 'esta fecha y hora'}
                  </small>
                )}
              </>
            )}
          </div>

          <button type="submit" className="btn-submit" disabled={loading}>
            {loading ? 'PROCESANDO...' : 'CONFIRMAR RESERVA'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Reservar;
