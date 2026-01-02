import React, { useState, useEffect, useCallback } from 'react';
import { getReportes, updateReporte, getReporteStats } from '../../services/api';
import './Reportes.css'; // Will create this css next

const AdminReportesPage = () => {
    const [reportes, setReportes] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(false);
    const [filterState, setFilterState] = useState('');

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const [reportesData, statsData] = await Promise.all([
                getReportes(filterState ? `?estado=${filterState}` : null),
                getReporteStats()
            ]);
            setReportes(reportesData.results || reportesData);
            setStats(statsData);
        } catch (error) {
            console.error("Error cargando reportes:", error);
        } finally {
            setLoading(false);
        }
    }, [filterState]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleStatusChange = async (id, newStatus) => {
        try {
            await updateReporte(id, { estado: newStatus });
            loadData(); // Refresh list
        } catch (error) {
            alert("Error al actualizar estado");
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'PENDIENTE': return <span className="badge badge-warning">Pendiente</span>;
            case 'EN_PROCESO': return <span className="badge badge-info">En Revisión</span>;
            case 'RESUELTO': return <span className="badge badge-success">Resuelto</span>;
            case 'DESCARTADO': return <span className="badge badge-danger">Descartado</span>;
            default: return status;
        }
    };

    return (
        <div className="reportes-admin-container">
            <header className="module-header">
                <h1>Gestión de Incidencias</h1>
                {stats && (
                    <div className="stats-mini-bar">
                        <span className="stat-pill warning">Pendientes: {stats.resumen_estados.pendientes}</span>
                        <span className="stat-pill info">En Revisión: {stats.resumen_estados.en_proceso}</span>
                        <span className="stat-pill success">Resueltos: {stats.resumen_estados.resueltos}</span>
                    </div>
                )}
            </header>

            <div className="filters-bar" style={{ marginBottom: '1rem', display: 'flex', gap: '1rem' }}>
                <select
                    className="filter-select"
                    value={filterState}
                    onChange={(e) => setFilterState(e.target.value)}
                >
                    <option value="">Todos los Estados</option>
                    <option value="PENDIENTE">Pendientes</option>
                    <option value="EN_PROCESO">En Revisión</option>
                    <option value="RESUELTO">Resueltos</option>
                </select>
                <button className="btn btn-secondary" onClick={loadData}>
                    Refrescar
                </button>
            </div>

            {loading ? <p>Cargando...</p> : (
                <div className="responsive-table-container">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Fecha</th>
                                <th>Solicitante</th>
                                <th>Tipo</th>
                                <th>Descripción</th>
                                <th>Prioridad</th>
                                <th>Estado</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {reportes.map(repo => (
                                <tr key={repo.id}>
                                    <td>{new Date(repo.fecha_creacion).toLocaleDateString()}</td>
                                    <td>
                                        <strong>{repo.solicitante}</strong>
                                        <br />
                                        <small>{repo.area}</small>
                                    </td>
                                    <td>{repo.tipo}</td>
                                    <td style={{ maxWidth: '300px' }}>
                                        {repo.descripcion}
                                        {repo.evidencia && (
                                            <div>
                                                <a href={repo.evidencia} target="_blank" rel="noreferrer" style={{ fontSize: '0.8rem', color: '#007bff' }}>
                                                    Ver Evidencia
                                                </a>
                                            </div>
                                        )}
                                    </td>
                                    <td>{repo.prioridad}</td>
                                    <td>{getStatusBadge(repo.estado)}</td>
                                    <td>
                                        <select
                                            value={repo.estado}
                                            onChange={(e) => handleStatusChange(repo.id, e.target.value)}
                                            style={{ padding: '0.25rem' }}
                                        >
                                            <option value="PENDIENTE">Pendiente</option>
                                            <option value="EN_PROCESO">En Revisión</option>
                                            <option value="RESUELTO">Resuelto</option>
                                            <option value="DESCARTADO">Descartado</option>
                                        </select>
                                    </td>
                                </tr>
                            ))}
                            {reportes.length === 0 && (
                                <tr>
                                    <td colSpan="7" style={{ textAlign: 'center', padding: '2rem' }}>
                                        No hay reportes encontrados.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default AdminReportesPage;
