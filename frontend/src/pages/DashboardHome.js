import React, { useEffect, useState } from 'react';
import { getDashboardStats } from '../services/api';

const DashboardHome = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const data = await getDashboardStats();
                setStats(data);
            } catch (error) {
                console.error("Error fetching stats:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    // Styles
    const cardStyle = {
        background: '#fff',
        borderRadius: '8px',
        padding: '24px',
        boxShadow: '0 0 20px 0 rgba(76, 87, 125, 0.02)',
        flex: '1',
        minWidth: '250px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between'
    };

    const gridStyle = {
        display: 'flex',
        gap: '24px',
        flexWrap: 'wrap',
        marginTop: '24px'
    };

    const welcomeStyle = {
        marginBottom: '30px'
    };

    const valueStyle = { fontSize: '2.5rem', fontWeight: 'bold', margin: '10px 0' };

    if (loading) return <div className="p-4">Cargando resumen...</div>;
    if (!stats) return <div className="p-4">No se pudo cargar el resumen.</div>;

    return (
        <div className="dashboard-home">
            <div style={welcomeStyle}>
                <h1 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#3f4254', marginBottom: '8px' }}>
                    Bienvenido al Gestor de Área
                </h1>
                <p style={{ color: '#b5b5c3' }}>Resumen general del estado del sistema.</p>
            </div>

            <div style={gridStyle}>
                {/* DISCOS */}
                <div style={cardStyle}>
                    <h3 style={{ fontSize: '1.1rem', color: '#181c32', margin: 0 }}>Discos Gestionados</h3>
                    <div style={{ ...valueStyle, color: '#3699ff' }}>{stats.discos.total}</div>
                    <p style={{ color: '#b5b5c3', fontSize: '0.9rem' }}>Discos catalogados</p>
                </div>

                {/* INVENTARIO */}
                <div style={cardStyle}>
                    <h3 style={{ fontSize: '1.1rem', color: '#181c32', margin: 0 }}>Inventario Total</h3>
                    <div style={{ ...valueStyle, color: '#0bb783' }}>{stats.inventario.total}</div>
                    <div style={{ display: 'flex', gap: '10px', fontSize: '0.85rem' }}>
                        <span style={{ color: '#ffa800' }}>En Reparación: {stats.inventario.estados['EN_PROCESO'] || 0}</span>
                        <span style={{ color: '#1bc5bd' }}>Disponibles: {stats.inventario.estados['DISPONIBLE'] || 0}</span>
                    </div>
                </div>

                {/* MANTENIMIENTOS */}
                <div style={cardStyle}>
                    <h3 style={{ fontSize: '1.1rem', color: '#181c32', margin: 0 }}>Mantenimientos Pendientes</h3>
                    <div style={{ ...valueStyle, color: '#f64e60' }}>{stats.mantenimiento.pendientes}</div>
                    <p style={{ color: '#b5b5c3', fontSize: '0.9rem' }}>Tareas por realizar</p>
                </div>
            </div>

            {/* UPCOMING MAINTENANCE */}
            <div style={{ marginTop: '40px' }}>
                <h3 style={{ fontSize: '1.2rem', marginBottom: '20px', color: '#3f4254' }}>Próximos Mantenimientos</h3>
                {stats.mantenimiento.proximos.length > 0 ? (
                    <div style={{ background: '#fff', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 0 20px 0 rgba(76, 87, 125, 0.02)' }}>
                        <table className="content-table" style={{ margin: 0 }}>
                            <thead style={{ background: '#f3f6f9' }}>
                                <tr>
                                    <th style={{ padding: '15px' }}>Fecha</th>
                                    <th style={{ padding: '15px' }}>Equipo</th>
                                    <th style={{ padding: '15px' }}>Prioridad</th>
                                </tr>
                            </thead>
                            <tbody>
                                {stats.mantenimiento.proximos.map(m => (
                                    <tr key={m.id} style={{ borderBottom: '1px solid #ebedf3' }}>
                                        <td style={{ padding: '15px' }}>{m.fecha}</td>
                                        <td style={{ padding: '15px' }}>{m.equipo}</td>
                                        <td style={{ padding: '15px' }}>
                                            <span className={`priority-badge priority-${m.prioridad.toLowerCase()}`}>{m.prioridad}</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div style={{ padding: '20px', background: '#fff', borderRadius: '8px', color: '#b5b5c3' }}>
                        No hay mantenimientos próximos programados.
                    </div>
                )}
            </div>
        </div>
    );
};

export default DashboardHome;
