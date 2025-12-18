import React, { useContext, useEffect, useState, useCallback } from 'react';
import { MantenimientoContext } from './MantenimientoContext';
import Modal from '../../components/common/Modal';
import MantenimientoForm from './MantenimientoForm';
import { API_BASE_URL } from '../../services/api';
import './Mantenimiento.css';

const MantenimientoDashboardPage = () => {
    const { mantenimientos, loading, error, fetchMantenimientos, addMantenimiento, updateMantenimiento } = useContext(MantenimientoContext);

    const [filters, setFilters] = useState({
        estado: 'PENDIENTE',
        search: ''
    });

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingMantenimiento, setEditingMantenimiento] = useState(null);

    const buildUrl = useCallback(() => {
        const params = new URLSearchParams();
        if (filters.estado) params.append('estado', filters.estado);
        if (filters.search) params.append('search', filters.search);
        // Default ordering
        params.append('ordering', 'fecha_programada');

        return `${API_BASE_URL}/mantenimiento/mantenimientos/?${params.toString()}`;
    }, [filters]);

    useEffect(() => {
        const url = buildUrl();
        fetchMantenimientos(url, true);
    }, [buildUrl, fetchMantenimientos]);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const handleOpenCreate = () => {
        setEditingMantenimiento(null);
        setIsModalOpen(true);
    };

    const handleOpenEdit = (mantenimiento) => {
        setEditingMantenimiento(mantenimiento);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingMantenimiento(null);
    };

    const handleSave = async (data) => {
        if (editingMantenimiento) {
            return await updateMantenimiento(editingMantenimiento.id, data);
        } else {
            return await addMantenimiento(data);
        }
    };

    const [expandedRows, setExpandedRows] = useState(new Set());

    const toggleRow = (id) => {
        const newExpandedRows = new Set(expandedRows);
        if (newExpandedRows.has(id)) {
            newExpandedRows.delete(id);
        } else {
            newExpandedRows.add(id);
        }
        setExpandedRows(newExpandedRows);
    };

    const handleSuccess = () => {
        handleCloseModal();
    };

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <h1>Gestión de Mantenimiento</h1>
                <button className="btn btn-primary" onClick={handleOpenCreate}>+ Programar Mantenimiento</button>
            </div>

            <div className="filters-bar">
                <div className="filter-group">
                    <select name="estado" value={filters.estado} onChange={handleFilterChange} className="filter-select">
                        <option value="">Todos los Estados</option>
                        <option value="PENDIENTE">Pendientes</option>
                        <option value="EN_PROCESO">En Proceso</option>
                        <option value="FINALIZADO">Finalizados</option>
                        <option value="CANCELADO">Cancelados</option>
                    </select>
                </div>
                <div className="filter-group" style={{ flex: 2 }}>
                    <input
                        type="text"
                        name="search"
                        value={filters.search}
                        onChange={handleFilterChange}
                        className="filter-input"
                        placeholder="Buscar por equipo, falla..."
                    />
                </div>
            </div>

            <div className="table-container">
                <table className="content-table">
                    <thead>
                        <tr>
                            <th>Fecha</th>
                            <th>Equipo</th>
                            <th>Tipo</th>
                            <th>Prioridad</th>
                            <th>Estado</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {mantenimientos.map(maint => (
                            <tr
                                key={maint.id}
                                className={expandedRows.has(maint.id) ? 'expanded' : ''}
                                onClick={() => window.innerWidth <= 768 && toggleRow(maint.id)}
                            >
                                <td data-label="Fecha">{maint.fecha_programada}</td>
                                <td data-label="Equipo">
                                    <div className="device-info">
                                        <span className="device-model">{maint.dispositivo_modelo}</span>
                                        <span className="device-serial">{maint.dispositivo_codigo}</span>
                                    </div>
                                    <span className="expand-indicator mobile-only">
                                        {expandedRows.has(maint.id) ? '▲' : '▼'}
                                    </span>
                                </td>
                                <td data-label="Tipo">{maint.tipo}</td>
                                <td data-label="Prioridad">
                                    <span className={`priority-badge priority-${maint.prioridad.toLowerCase()}`}>
                                        {maint.prioridad}
                                    </span>
                                </td>
                                <td data-label="Estado">
                                    <span className={`status-badge status-${maint.estado.toLowerCase().replace('_', '-')}`}>
                                        {maint.estado}
                                    </span>
                                </td>
                                <td data-label="Acciones" className="actions-cell">
                                    <button className="btn-icon" onClick={(e) => { e.stopPropagation(); handleOpenEdit(maint); }} title="Editar/Gestionar">✎</button>
                                </td>
                            </tr>
                        ))}
                        {!loading && mantenimientos.length === 0 && (
                            <tr><td colSpan="6" className="text-center">No hay mantenimientos registrados.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                title={editingMantenimiento ? `Gestionar Mantenimiento #${editingMantenimiento.id}` : "Programar Nuevo Mantenimiento"}
                size="medium"
            >
                <MantenimientoForm
                    mantenimiento={editingMantenimiento}
                    onSave={handleSave}
                    onSuccess={handleSuccess}
                />
            </Modal>
        </div>
    );
};

export default MantenimientoDashboardPage;
