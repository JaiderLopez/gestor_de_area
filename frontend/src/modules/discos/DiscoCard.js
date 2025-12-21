import React, { useContext, useState } from 'react';

import { DiscoContext } from './DiscoContext';
import './Discos.css';

const DiscoCard = ({ disco, onEdit }) => {
  const { deleteDisco } = useContext(DiscoContext);
  const [isDeleting, setIsDeleting] = useState(false);

  const contenidosToShow = disco.contenidos?.slice(0, 3) || [];
  const remainingCount = disco.porcentaje_ocupado >= 0
    ? disco.contenidos.length - contenidosToShow.length
    : 0;

  // Clases dinámicas según porcentaje
  const getStatusClass = (percent) => {
    if (percent >= 80) return 'status-danger';
    if (percent >= 50) return 'status-warning';
    return 'status-safe';
  };

  const getFillClass = (percent) => {
    if (percent >= 80) return 'fill-danger';
    if (percent >= 50) return 'fill-warning';
    return 'fill-safe';
  };

  const statusClass = getStatusClass(disco.porcentaje_ocupado);
  const fillClass = getFillClass(disco.porcentaje_ocupado);

  const handleDelete = async () => {
    if (window.confirm(`¿Estás seguro de que quieres eliminar el disco DISCO "${disco.nombre}"?`)) {
      setIsDeleting(true);
      try {
        await deleteDisco(disco.id);
      } catch (error) {
        alert(`Error: ${error.message}`);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  return (
    <div className={`disco-card ${statusClass}`}>
      <div className="card-header">
        <div className="card-title-group">
          <h3>{disco.nombre}</h3>
          <span className="card-subtitle">{disco.tamanio_gb} GB Totales</span>
        </div>
        <div className="card-badges">
          <span className="card-type-badge">{disco.tipo}</span>
          <span className={`card-status-badge status-${disco.estado?.toLowerCase()}`}>
            {disco.estado === 'BUENO' && '✓ Bueno'}
            {disco.estado === 'EN_RIESGO' && '⚠ En Riesgo'}
            {disco.estado === 'DANADO' && '✗ Dañado'}
          </span>
        </div>
      </div>

      <div className="usage-stats">
        <div className="progress-labels">
          <span>Usado: {disco.espacio_usado ? disco.espacio_usado.toFixed(2) : 0} GB</span>
          <span>{disco.porcentaje_ocupado}%</span>
        </div>
        <div className="progress-bar-bg">
          <div
            className={`progress-bar-fill ${fillClass}`}
            style={{ width: `${disco.porcentaje_ocupado}%` }}
          ></div>
        </div>
      </div>

      <div className="content-preview">
        <h4>Contenido Reciente</h4>
        {contenidosToShow.length > 0 ? (
          <ul className="content-list">
            {contenidosToShow.map(c => (
              <li key={c.id}>{c.nombre}</li>
            ))}
            {remainingCount > 0 && <li>... y {remainingCount} más</li>}
          </ul>
        ) : (
          <p style={{ fontSize: '0.9rem', color: '#b5b5c3' }}>Sin contenido indexado</p>
        )}
      </div>

      <div className="card-actions">
        <button
          onClick={() => onEdit(disco)}
          className="btn-icon-action"
          title="Editar"
        >
          ✎
        </button>
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="btn-icon-action delete"
          title="Eliminar"
        >
          🗑
        </button>
      </div>
    </div>
  );
};

export default DiscoCard;
