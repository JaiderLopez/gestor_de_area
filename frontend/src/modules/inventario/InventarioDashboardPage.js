import React, { useEffect, useContext, useState, useCallback } from 'react';
import { InventarioContext } from './InventarioContext';
import Modal from '../../components/common/Modal';
import DispositivoForm from './DispositivoForm';
import MovimientoForm from './MovimientoForm';
import HistorialMovimientos from './HistorialMovimientos';
import MantenimientoForm from '../mantenimiento/MantenimientoForm';
import { createMantenimiento } from '../../services/api';
import './Inventario.css';

const InventarioDashboardPage = () => {
    const { dispositivos, categorias, loading, error, fetchDispositivos, fetchCategorias, addDispositivo, updateDispositivo, createMovimiento } = useContext(InventarioContext);

    const [filters, setFilters] = useState({
        search: '',
        categoria: '',
        estado: ''
    });

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalType, setModalType] = useState('create'); // 'create', 'edit', 'move', 'history', 'maintenance'
    const [editingDispositivo, setEditingDispositivo] = useState(null);

    const buildUrl = useCallback(() => {
        const params = new URLSearchParams();
        if (filters.search) params.append('search', filters.search);
        if (filters.categoria) params.append('categoria', filters.categoria);
        if (filters.estado) params.append('estado', filters.estado);

        return `http://127.0.0.1:8000/api/inventario/dispositivos/?${params.toString()}`;
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

    const handleSuccess = () => {
        handleCloseModal();
        // Optionally refresh URL if needed, but context handles simple cache update
    };

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <h1>Inventario de Hardware</h1>
                <button className="btn btn-primary" onClick={handleOpenCreate}>+ Agregar Equipo</button>
            </div>

            <div className="filters-bar">
                <div className="filter-group" style={{ flex: 2 }}>
                    <input
                        type="text"
                        name="search"
                        value={filters.search}
                        onChange={handleFilterChange}
                        className="filter-input"
                        placeholder="Buscar por código, serie, modelo..."
                    />
                </div>
                <div className="filter-group">
                    <select name="categoria" value={filters.categoria} onChange={handleFilterChange} className="filter-select">
                        <option value="">Todas las Categorías</option>
                        {categorias.map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.nombre}</option>
                        ))}
                    </select>
                </div>
                <div className="filter-group">
                    <select name="estado" value={filters.estado} onChange={handleFilterChange} className="filter-select">
                        <option value="">Todos los Estados</option>
                        <option value="ACTIVO">Activo</option>
                        <option value="DISPONIBLE">Disponible</option>
                        <option value="EN_REPARACION">En Reparación</option>
                        <option value="DAÑADO">Dañado</option>
                        <option value="BAJA">De Baja</option>
                    </select>
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
                            <tr key={disp.id}>
                                <td><span className="badge badge-light">{disp.codigo_inventario}</span></td>
                                <td>
                                    <div className="device-info">
                                        <span className="device-model">{disp.marca} {disp.modelo}</span>
                                        <span className="device-serial">{disp.serial}</span>
                                    </div>
                                </td>
                                <td>{disp.categoria_nombre}</td>
                                <td>{disp.ubicacion}</td>
                                <td>{disp.responsable}</td>
                                <td>
                                    <span className={`status-badge status-${disp.estado.toLowerCase()}`}>
                                        {disp.estado}
                                    </span>
                                </td>
                                <td>
                                    <button className="btn-icon" onClick={() => handleOpenMove(disp)} title="Mover/Asignar">⇄</button>
                                    <button className="btn-icon" onClick={() => handleOpenEdit(disp)} title="Editar">✎</button>
                                    <button className="btn-icon" onClick={() => handleOpenHistory(disp)} title="Ver Historial">📋</button>
                                    <button className="btn-icon" onClick={() => handleOpenMaintenance(disp)} title="Programar Mantenimiento">🔧</button>
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
