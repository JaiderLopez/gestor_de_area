import React, { useEffect, useContext, useState, useCallback } from 'react';
import { InventarioContext } from './InventarioContext';
import Modal from '../../components/common/Modal';
import DispositivoForm from './DispositivoForm';
import MovimientoForm from './MovimientoForm';
import HistorialMovimientos from './HistorialMovimientos';
import MantenimientoForm from '../mantenimiento/MantenimientoForm';
import { createMantenimiento, API_BASE_URL } from '../../services/api';
import InventarioExcelImport from './InventarioExcelImport';
import './Inventario.css';

const InventarioDashboardPage = () => {
    const { dispositivos, categorias, loading, error, totalCount, fetchDispositivos, fetchCategorias, addDispositivo, updateDispositivo, createMovimiento } = useContext(InventarioContext);

    const [filters, setFilters] = useState({
        search: '',
        categoria: '',
        estado: '',
        ubicacion: ''
    });

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalType, setModalType] = useState('create'); // 'create', 'edit', 'move', 'history', 'maintenance'
    const [editingDispositivo, setEditingDispositivo] = useState(null);

    const buildUrl = useCallback(() => {
        const params = new URLSearchParams();
        if (filters.search) params.append('search', filters.search);
        if (filters.categoria) params.append('categoria', filters.categoria);
        if (filters.estado) params.append('estado', filters.estado);
        if (filters.ubicacion) params.append('ubicacion', filters.ubicacion);

        return `${API_BASE_URL}/inventario/dispositivos/?${params.toString()}`;
    }, [filters]);

    useEffect(() => {
        fetchCategorias();
    }, [fetchCategorias]);

    useEffect(() => {
        const url = buildUrl();
        fetchDispositivos(url, true);
    }, [buildUrl, fetchDispositivos]);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const handleResetFilters = () => {
        setFilters({
            search: '',
            categoria: '',
            estado: '',
            ubicacion: ''
        });
    };

    // Modal actions
    const handleOpenCreate = () => {
        setEditingDispositivo(null);
        setModalType('create');
        setIsModalOpen(true);
    };

    const handleOpenEdit = (dispositivo) => {
        setEditingDispositivo(dispositivo);
        setModalType('edit');
        setIsModalOpen(true);
    };

    const handleOpenMove = (dispositivo) => {
        setEditingDispositivo(dispositivo);
        setModalType('move');
        setIsModalOpen(true);
    };

    const handleOpenHistory = (dispositivo) => {
        setEditingDispositivo(dispositivo);
        setModalType('history');
        setIsModalOpen(true);
    };

    const handleOpenMaintenance = (dispositivo) => {
        setEditingDispositivo(dispositivo);
        setModalType('maintenance');
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingDispositivo(null);
    };

    const handleSave = async (data) => {
        if (modalType === 'move') {
            return await createMovimiento(data);
        } else if (modalType === 'maintenance') {
            return await createMantenimiento(data);
        } else if (editingDispositivo && modalType === 'edit') {
            return await updateDispositivo(editingDispositivo.id, data);
        } else {
            return await addDispositivo(data);
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
        // Optionally refresh URL if needed, but context handles simple cache update
    };

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <div className="title-with-count">
                    <h1>Inventario de Hardware</h1>
                    {!loading && <span className="results-counter">{totalCount} equipos</span>}
                    {loading && <span className="results-counter loading">Calculando...</span>}
                </div>
                <div className="header-actions">
                    <InventarioExcelImport onImportSuccess={() => fetchDispositivos(buildUrl(), true)} />
                    <button className="btn btn-primary" onClick={handleOpenCreate}>+ Agregar Equipo</button>
                </div>
            </div>

            <div className="filters-bar">
                <div className="filters-row">
                    <div className="filter-group">
                        <label className="filter-label">Buscar</label>
                        <input
                            type="text"
                            name="search"
                            value={filters.search}
                            onChange={handleFilterChange}
                            className="filter-input"
                            placeholder="Código, serie, modelo..."
                        />
                    </div>
                    <div className="filter-group">
                        <label className="filter-label">Categoría</label>
                        <select name="categoria" value={filters.categoria} onChange={handleFilterChange} className="filter-select">
                            <option value="">Todas las Categorías</option>
                            {categorias.map(cat => (
                                <option key={cat.id} value={cat.id}>{cat.nombre}</option>
                            ))}
                        </select>
                    </div>
                    <div className="filter-group">
                        <label className="filter-label">Estado</label>
                        <select name="estado" value={filters.estado} onChange={handleFilterChange} className="filter-select">
                            <option value="">Todos los Estados</option>
                            <option value="ACTIVO">Activo</option>
                            <option value="DISPONIBLE">Disponible</option>
                            <option value="EN_REPARACION">En Reparación</option>
                            <option value="DAÑADO">Dañado</option>
                            <option value="BAJA">De Baja</option>
                        </select>
                    </div>
                    <div className="filter-group">
                        <label className="filter-label">Ubicación</label>
                        <input
                            type="text"
                            name="ubicacion"
                            value={filters.ubicacion}
                            onChange={handleFilterChange}
                            className="filter-input"
                            placeholder="Ubicación..."
                        />
                    </div>
                    <div className="filter-group btn-group">
                        <label className="filter-label">&nbsp;</label>
                        <button className="btn-clear" onClick={handleResetFilters}>
                            Limpiar Filtros
                        </button>
                    </div>
                </div>
            </div>

            {/* Tabla de Resultados */}
            <div className="table-container">
                <table className="content-table">
                    <thead>
                        <tr>
                            <th>Código</th>
                            <th>Equipo</th>
                            <th>Categoría</th>
                            <th>Ubicación</th>
                            <th>Responsable</th>
                            <th>Estado</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {dispositivos.map(disp => (
                            <tr
                                key={disp.id}
                                className={expandedRows.has(disp.id) ? 'expanded' : ''}
                                onClick={() => window.innerWidth <= 768 && toggleRow(disp.id)}
                            >
                                <td data-label="Código"><span className="badge badge-light">{disp.codigo_inventario}</span></td>
                                <td data-label="Equipo">
                                    <div className="device-info">
                                        <span className="device-model">{disp.marca} {disp.modelo}</span>
                                        <span className="device-serial">{disp.serial}</span>
                                    </div>
                                    <span className="expand-indicator mobile-only">
                                        {expandedRows.has(disp.id) ? '▲' : '▼'}
                                    </span>
                                </td>
                                <td data-label="Categoría">{disp.categoria_nombre}</td>
                                <td data-label="Ubicación">{disp.ubicacion}</td>
                                <td data-label="Responsable">{disp.responsable}</td>
                                <td data-label="Estado">
                                    <span className={`status-badge status-${disp.estado.toLowerCase()}`}>
                                        {disp.estado}
                                    </span>
                                </td>
                                <td data-label="Acciones" className="actions-cell">
                                    <button className="btn-icon" onClick={(e) => { e.stopPropagation(); handleOpenMove(disp); }} title="Mover/Asignar">⇄</button>
                                    <button className="btn-icon" onClick={(e) => { e.stopPropagation(); handleOpenEdit(disp); }} title="Editar">✎</button>
                                    <button className="btn-icon" onClick={(e) => { e.stopPropagation(); handleOpenHistory(disp); }} title="Ver Historial">📋</button>
                                    <button className="btn-icon" onClick={(e) => { e.stopPropagation(); handleOpenMaintenance(disp); }} title="Programar Mantenimiento">🔧</button>
                                </td>
                            </tr>
                        ))}
                        {!loading && dispositivos.length === 0 && (
                            <tr>
                                <td colSpan="7" style={{ textAlign: 'center', padding: '2rem' }}>
                                    No se encontraron dispositivos.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal de Registro/Edición/Movimiento */}
            <Modal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                title={
                    modalType === 'move' ? "Registrar Movimiento" :
                        modalType === 'edit' ? `Editar ${editingDispositivo?.codigo_inventario}` :
                            modalType === 'history' ? `Historial de ${editingDispositivo?.codigo_inventario}` :
                                modalType === 'maintenance' ? `Programar Mantenimiento: ${editingDispositivo?.codigo_inventario}` :
                                    "Registrar Nuevo Equipo"
                }
                size={modalType === 'history' ? 'large' : (modalType === 'move' || modalType === 'maintenance' ? 'medium' : 'medium')}
            >
                {modalType === 'move' ? (
                    <MovimientoForm
                        dispositivo={editingDispositivo}
                        onSave={handleSave}
                        onSuccess={handleSuccess}
                    />
                ) : modalType === 'history' ? (
                    <HistorialMovimientos
                        dispositivo={editingDispositivo}
                    />
                ) : modalType === 'maintenance' ? (
                    <MantenimientoForm
                        defaultDispositivoId={editingDispositivo?.id}
                        onSave={handleSave}
                        onSuccess={handleSuccess}
                    />
                ) : (
                    <DispositivoForm
                        dispositivo={editingDispositivo}
                        onSave={handleSave}
                        onSuccess={handleSuccess}
                    />
                )}
            </Modal>
        </div>
    );
};

export default InventarioDashboardPage;
