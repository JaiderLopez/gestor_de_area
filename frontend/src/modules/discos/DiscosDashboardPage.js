import React, { useState, useEffect, useContext, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { DiscoContext } from './DiscoContext';
import DiscoCard from './DiscoCard';
import ThemeSwitch from './ThemeSwitch'; // Importar el interruptor de tema
import './Discos.css';

const DiscosDashboardPage = () => {
  const { discos, loading, error, nextPage, fetchDiscos } = useContext(DiscoContext);
  
  const [filters, setFilters] = useState({
    search: '',
    tipo: '',
    contenido_fecha_desde: '',
    contenido_fecha_hasta: '',
    espacio_libre_min: '',
    espacio_libre_max: '',
  });

  const applyFilters = useCallback((isNewQuery = true) => {
    const params = new URLSearchParams();
    if (filters.search) params.append('search', filters.search);
    if (filters.tipo) params.append('tipo', filters.tipo);
    if (filters.contenido_fecha_desde) params.append('contenido_fecha_desde', filters.contenido_fecha_desde);
    if (filters.contenido_fecha_hasta) params.append('contenido_fecha_hasta', filters.contenido_fecha_hasta);
    if (filters.espacio_libre_min) params.append('espacio_libre_min', filters.espacio_libre_min);
    if (filters.espacio_libre_max) params.append('espacio_libre_max', filters.espacio_libre_max);
    
    const url = `http://localhost:8000/api/discos/?${params.toString()}`;
    fetchDiscos(url, isNewQuery);
  }, [filters, fetchDiscos]);

  useEffect(() => {
    applyFilters(true);
  }, []); // Solo se ejecuta al montar el componente

  const handleLoadMore = () => {
    if (nextPage) {
      fetchDiscos(nextPage, false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleSearch = () => {
    applyFilters(true);
  };

  const handleClear = () => {
    setFilters({
      search: '',
      tipo: '',
      contenido_fecha_desde: '',
      contenido_fecha_hasta: '',
      espacio_libre_min: '',
      espacio_libre_max: '',
    });
    fetchDiscos('http://localhost:8000/api/discos/', true);
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Dashboard de Discos</h1>
        <div className="header-actions">
          <ThemeSwitch />
          <Link to="/discos/new" className="btn btn-primary">Añadir Disco</Link>
        </div>
      </div>

      <div className="filters-container">
        <input
          type="text"
          name="search"
          value={filters.search}
          onChange={handleFilterChange}
          placeholder="Buscar por nombre, contenido..."
        />
        <select name="tipo" value={filters.tipo} onChange={handleFilterChange}>
          <option value="">Tipo: Todos</option>
          <option value="HDD">HDD</option>
          <option value="SSD">SSD</option>
          <option value="CD/DVD">CD/DVD</option>
        </select>
        <input
          type="date"
          name="contenido_fecha_desde"
          value={filters.contenido_fecha_desde}
          onChange={handleFilterChange}
          title="Fecha de contenido (desde)"
        />
        <input
          type="date"
          name="contenido_fecha_hasta"
          value={filters.contenido_fecha_hasta}
          onChange={handleFilterChange}
          title="Fecha de contenido (hasta)"
        />
        <input
          type="number"
          name="espacio_libre_min"
          value={filters.espacio_libre_min}
          onChange={handleFilterChange}
          placeholder="Espacio libre mín. (GB)"
        />
        <input
          type="number"
          name="espacio_libre_max"
          value={filters.espacio_libre_max}
          onChange={handleFilterChange}
          placeholder="Espacio libre máx. (GB)"
        />
        <button onClick={handleSearch}>Buscar</button>
        <button onClick={handleClear} className="btn-secondary">Limpiar</button>
      </div>

      {error && <p className="error-message">Error: {error}</p>}
      
      <div className="dashboard-grid">
        {discos.map(disco => (
          <DiscoCard key={disco.id} disco={disco} />
        ))}
      </div>

      {loading && <p className="loading-message">Cargando...</p>}
      
      {nextPage && !loading && (
        <div className="load-more-container">
          <button onClick={handleLoadMore} className="load-more-button">Cargar más</button>
        </div>
      )}
    </div>
  );
};

export default DiscosDashboardPage;