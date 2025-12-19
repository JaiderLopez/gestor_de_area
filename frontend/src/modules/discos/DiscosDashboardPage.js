import React, { useState, useEffect, useContext, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { DiscoContext } from './DiscoContext';
import DiscoCard from './DiscoCard';
import DiscoForm from './DiscoForm';
import Modal from '../../components/common/Modal';
import { API_BASE_URL } from '../../services/api';
import './Discos.css';

const DiscosDashboardPage = () => {
  const { discos, loading, error, nextPage, fetchDiscos, addDisco, updateDisco } = useContext(DiscoContext);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDisco, setEditingDisco] = useState(null);

  const [filters, setFilters] = useState({
    search: '',
    tipo: '',
    contenido_fecha_desde: '',
    contenido_fecha_hasta: '',
    espacio_libre_min: '',
  });

  const applyFilters = useCallback((isNewQuery = true) => {
    const params = new URLSearchParams();
    if (filters.search) params.append('search', filters.search);
    if (filters.tipo) params.append('tipo', filters.tipo);
    if (filters.contenido_fecha_desde) params.append('contenido_fecha_desde', filters.contenido_fecha_desde);
    if (filters.contenido_fecha_hasta) params.append('contenido_fecha_hasta', filters.contenido_fecha_hasta);
    if (filters.espacio_libre_min) params.append('espacio_libre_min', filters.espacio_libre_min);

    const url = `${API_BASE_URL}/discos/?${params.toString()}`;
    fetchDiscos(url, isNewQuery);
  }, [filters, fetchDiscos]);

  useEffect(() => {
    applyFilters(true);
  }, [applyFilters]);

  const handleLoadMore = () => {
    if (nextPage) {
      fetchDiscos(nextPage, false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };


  const handleClear = () => {
    setFilters({
      search: '',
      tipo: '',
      contenido_fecha_desde: '',
      contenido_fecha_hasta: '',
      espacio_libre_min: '',
    });
    // Reset to default
    const url = `${API_BASE_URL}/discos/`;
    fetchDiscos(url, true);
  };

  // Modal Handlers
  const handleOpenCreateModal = (e) => {
    if (e) e.preventDefault();
    setEditingDisco(null); // Reset editing state
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (disco) => {
    setEditingDisco(disco);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingDisco(null);
  };

  const handleSaveDisco = async (formData) => {
    if (editingDisco) {
      return await updateDisco(editingDisco.id, formData);
    } else {
      return await addDisco(formData);
    }
  };

  const handleModalSuccess = () => {
    handleCloseModal();
    // Refresh list if needed, or rely on Context
    applyFilters(true); // Refetch to look fresh
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Gestor de Discos</h1>
        <button onClick={handleOpenCreateModal} className="btn btn-primary">
          + Nuevo Disco
        </button>
      </div>

      <div className="filters-bar">
        <div className="filter-group" style={{ flex: 2 }}>
          <input
            type="text"
            name="search"
            className="filter-input"
            value={filters.search}
            onChange={handleFilterChange}
            placeholder="🔍 Buscar disco..."
          />
        </div>

        <div className="filter-group">
          <select name="tipo" value={filters.tipo} onChange={handleFilterChange} className="filter-select">
            <option value="">Tipo: Todos</option>
            <option value="HDD">HDD</option>
            <option value="SSD">SSD</option>
            <option value="CD/DVD">CD/DVD</option>
          </select>
        </div>

        <div className="filter-group">
          <input
            type="number"
            name="espacio_libre_min"
            value={filters.espacio_libre_min}
            onChange={handleFilterChange}
            placeholder="Min Libre (GB)"
            className="filter-input"
          />
        </div>

        <div className="filter-group" style={{ flex: '0 0 auto' }}>
          <button onClick={handleClear} className="btn-clear" style={{ height: '100%' }}>Limpiar Filtros</button>
        </div>
      </div>

      {error && <p className="error-message">Error de conexión: {error}</p>}

      <div className="dashboard-grid">
        {discos.map(disco => (
          <DiscoCard
            key={disco.id}
            disco={disco}
            onEdit={handleOpenEditModal}
          />
        ))}
      </div>

      {loading && <p className="loading-message">Cargando discos...</p>}

      {!loading && discos.length === 0 && !error && (
        <div className="no-content-message">
          <p>No se encontraron discos con los filtros actuales.</p>
        </div>
      )}

      {nextPage && !loading && (
        <div className="load-more-container">
          <button onClick={handleLoadMore} className="load-more-button">Cargar más</button>
        </div>
      )}

      {/* Modal for Creating/Editing Disco */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingDisco ? "Editar Disco" : "Crear Nuevo Disco"}
        size="xlarge"
      >
        <DiscoForm
          disco={editingDisco} // Pass default values if editing
          onSave={handleSaveDisco} // Unified save handler
          onSuccess={handleModalSuccess}
        />
      </Modal>
    </div>
  );
};

export default DiscosDashboardPage;