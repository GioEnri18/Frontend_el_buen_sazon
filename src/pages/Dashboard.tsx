import { useState, useEffect } from 'react';
import { format, startOfWeek, addDays, isSameDay, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { reservasService } from '../services/reservas.service';
import { mesasService } from '../services/mesas.service';
import type { Reserva, Mesa } from '../types';
import './Dashboard.css';

const Dashboard = () => {
    const [fecha, setFecha] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [reservas, setReservas] = useState<Reserva[]>([]);
    const [reservasHoy, setReservasHoy] = useState<Reserva[]>([]);
    const [mesas, setMesas] = useState<Mesa[]>([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('week');

    useEffect(() => {
        loadData();
    }, [fecha]);

    const loadData = async () => {
        setLoading(true);
        try {
            const [reservasData, mesasData, reservasHoyData] = await Promise.all([
                reservasService.getAll(),
                mesasService.getAll(),
                reservasService.getDelDia(fecha),
            ]);
            setReservas(reservasData);
            setMesas(mesasData);
            setReservasHoy(reservasHoyData);
        } catch (error) {
            console.error('Error al cargar datos:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCancelar = async (id: number) => {
        if (window.confirm('¿Está seguro de cancelar esta reserva?')) {
            try {
                await reservasService.cancelar(id);
                loadData();
            } catch (error) {
                console.error('Error al cancelar reserva:', error);
            }
        }
    };

    const handleCompletar = async (id: number) => {
        try {
            await reservasService.update(id, { estado: 'completada' });
            loadData();
        } catch (error) {
            console.error('Error al completar reserva:', error);
        }
    };

  // Estadísticas
  const totalReservasHoy = reservasHoy.length;
  const mesasDisponibles = mesas.filter(m => m.activa).length;
    const mesasOcupadas = reservasHoy.filter(r => r.estado !== 'cancelada').length;
    const ocupacionPorcentaje = mesasDisponibles > 0
        ? ((mesasOcupadas / mesasDisponibles) * 100).toFixed(1)
        : 0;
    const capacidadPromedio = mesas.length > 0
        ? (mesas.reduce((sum, m) => sum + m.capacidad, 0) / mesas.length).toFixed(1)
        : 0;

    // Datos para gráfico de pie
    const pieData = [
        { name: 'Ocupadas', value: mesasOcupadas },
        { name: 'Disponibles', value: mesasDisponibles - mesasOcupadas },
    ];

    const COLORS = ['#dc3545', '#28a745'];

    // Datos para gráfico de barras (reservas por hora)
    const horariosData = Array.from({ length: 16 }, (_, i) => {
        const hora = i + 8; // 8:00 a 23:00
        const reservasEnHora = reservasHoy.filter(r => {
            const horaReserva = new Date(r.fecha_hora).getHours();
            return horaReserva === hora;
        }).length;
        return {
            hora: `${hora}:00`,
            reservas: reservasEnHora,
        };
    });

    // Calendario semanal
    const weekStart = startOfWeek(new Date(fecha), { weekStartsOn: 0 });
    const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

    if (loading) {
        return <div className="dashboard-loading">Cargando...</div>;
    }

    return (
        <div className="dashboard">
            <div className="dashboard-header">
                <h1>Dashboard</h1>
                <div className="dashboard-controls">
                    <button
                        className={viewMode === 'month' ? 'active' : ''}
                        onClick={() => setViewMode('month')}
                    >
                        Actualizar
                    </button>
                    <input
                        type="date"
                        value={fecha}
                        onChange={(e) => setFecha(e.target.value)}
                        className="date-input"
                    />
                    <button className="btn-refresh" onClick={loadData}>
                        Refrescar
                    </button>
                </div>
            </div>

            <div className="stats-grid">
                <div className="stat-card">
                    <h3>Total Reservas Hoy</h3>
                    <p className="stat-value">{totalReservasHoy}</p>
                </div>
                <div className="stat-card">
                    <h3>Ocupación Actual</h3>
                    <p className="stat-value">{ocupacionPorcentaje}%</p>
                </div>
                <div className="stat-card">
                    <h3>Mesas Disponibles</h3>
                    <p className="stat-value">{mesasDisponibles - mesasOcupadas}</p>
                </div>
                <div className="stat-card">
                    <h3>Capacidad Promedio</h3>
                    <p className="stat-value">{capacidadPromedio}</p>
                </div>
            </div>

            <div className="dashboard-content">
                <div className="calendar-section">
                    <h2>Calendario de Reservas</h2>
                    <div className="calendar-header">
                        <button onClick={() => setViewMode('month')}>month</button>
                        <button onClick={() => setViewMode('week')}>week</button>
                        <button onClick={() => setViewMode('day')}>day</button>
                    </div>
                    <div className="week-calendar">
                        {weekDays.map((day, index) => {
                            const dayReservas = reservas.filter(r =>
                                isSameDay(parseISO(r.fecha_hora), day)
                            );
                            return (
                                <div key={index} className="calendar-day">
                                    <div className="day-header">
                                        <div>{format(day, 'EEE', { locale: es })}</div>
                                        <div>{format(day, 'dd/MM')}</div>
                                    </div>
                                    <div className="day-content">
                                        {dayReservas.slice(0, 3).map(reserva => (
                                            <div
                                                key={reserva.id}
                                                className={`reserva-item ${reserva.estado}`}
                                            >
                                                <div>{format(parseISO(reserva.fecha_hora), 'HH:mm')}</div>
                                                <div>Mesa {reserva.mesa_numero}</div>
                                            </div>
                                        ))}
                                        {dayReservas.length > 3 && (
                                            <div className="more-reservas">+{dayReservas.length - 3} más</div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="charts-section">
                    <div className="chart-card">
                        <h3>Disponibilidad de Mesas</h3>
                        <ResponsiveContainer width="100%" height={250}>
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, percent }) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {pieData.map((_entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="chart-legend">
                            <div><span className="legend-color ocupadas"></span> Ocupadas</div>
                            <div><span className="legend-color disponibles"></span> Disponibles</div>
                        </div>
                    </div>

                    <div className="chart-card">
                        <h3>Reservas por Hora</h3>
                        <ResponsiveContainer width="100%" height={250}>
                            <BarChart data={horariosData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="hora" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="reservas" fill="#007bff" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            <div className="reservas-section">
                <h2>Reservas del Día</h2>
                <table className="reservas-table">
                    <thead>
                        <tr>
                            <th>HORA</th>
                            <th>MESA</th>
                            <th>CLIENTE</th>
                            <th>PERSONAS</th>
                            <th>ESTADO</th>
                            <th>ACCIONES</th>
                        </tr>
                    </thead>
                    <tbody>
                        {reservasHoy.map(reserva => (
                            <tr key={reserva.id}>
                                <td>{format(parseISO(reserva.fecha_hora), 'HH:mm')}</td>
                                <td>{reserva.mesa_numero}</td>
                                <td>
                                    {reserva.cliente ?
                                        `${reserva.cliente.nombre} ${reserva.cliente.apellido}` :
                                        'Cliente Demo 1'}
                                </td>
                                <td>{reserva.numero_personas}</td>
                                <td>
                                    <span className={`badge ${reserva.estado}`}>
                                        {reserva.estado.toUpperCase()}
                                    </span>
                                </td>
                                <td>
                                    {reserva.estado === 'pendiente' && (
                                        <>
                                            <button
                                                className="btn-action completar"
                                                onClick={() => handleCompletar(reserva.id)}
                                            >
                                                Completar
                                            </button>
                                            <button
                                                className="btn-action cancelar"
                                                onClick={() => handleCancelar(reserva.id)}
                                            >
                                                Cancelar
                                            </button>
                                        </>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {reservasHoy.length === 0 && (
                    <p className="no-data">No hay reservas para este día</p>
                )}
            </div>
        </div>
    );
};

export default Dashboard;
