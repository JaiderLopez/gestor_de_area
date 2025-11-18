import React, { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { DiscoContext } from './DiscoContext';
import DiscoForm from './DiscoForm';
import { getDisco } from '../../services/api';

const DiscoEditPage = () => {
  const { id } = useParams();
  const { updateDisco } = useContext(DiscoContext);
  const [disco, setDisco] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDiscoData = async () => {
      try {
        const data = await getDisco(id);
        setDisco(data);
      } catch (error) {
        console.error('Error al obtener el disco:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDiscoData();
  }, [id]);

  const handleSave = async (formData) => {
    await updateDisco(id, formData);
  };

  if (loading) {
    return <p>Cargando...</p>;
  }

  return (
    <div>
      <h1>Editar Disco</h1>
      <DiscoForm disco={disco} onSave={handleSave} />
    </div>
  );
};

export default DiscoEditPage;