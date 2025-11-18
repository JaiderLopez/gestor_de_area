import React, { useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import { DiscoContext } from './DiscoContext'; // Import DiscoContext
import './Discos.css';

const DiscoCard = ({ disco }) => {
  const { deleteDisco } = useContext(DiscoContext); // Get deleteDisco from context
  const [isDeleting, setIsDeleting] = useState(false);
  const contenidosToShow = disco.contenidos?.slice(0, 5) || [];
  const remainingCount = disco.contenidos ? disco.contenidos.length - contenidosToShow.length : 0;

  const handleDelete = async () => {
    if (window.confirm(`¿Estás seguro de que quieres eliminar el disco "${disco.nombre}"?`)) {
      setIsDeleting(true);
      try {
        await deleteDisco(disco.id);
        // No need to update local state, context will handle it
        alert('Disco eliminado con éxito.');
      } catch (error) {
        alert(`Error al eliminar el disco: ${error.message}`);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  return (
    <div className="disco-card">
      <div className="card-header">
        <h3>{disco.nombre}</h3>
        <div className="card-actions">
          <Link to={`/discos/${disco.id}/edit`}>Editar</Link>
          <button onClick={handleDelete} disabled={isDeleting} className="btn-delete">
            {isDeleting ? 'Eliminando...' : 'Eliminar'}
          </button>
        </div>
      </div>
      <p><strong>Tipo:</strong> {disco.tipo}</p>
      <p><strong>Tamaño:</strong> {disco.tamanio_gb} GB</p>
      
      {contenidosToShow.length > 0 && (
        <div className="content-summary">
          <h4>Contenido:</h4>
          <ul>
            {contenidosToShow.map(contenido => (
              <li key={contenido.id}>{contenido.nombre}</li>
            ))}
            {remainingCount > 0 && (
              <li className="remaining-count">... y {remainingCount} más.</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default DiscoCard;
