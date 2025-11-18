import React, { useContext } from 'react';
import { DiscoContext } from './DiscoContext';
import DiscoForm from './DiscoForm';

const DiscoNewPage = () => {
  const { addDisco } = useContext(DiscoContext);

  const handleSave = async (formData) => {
    await addDisco(formData);
  };

  return (
    <div>
      <h1>Nuevo Disco</h1>
      <DiscoForm onSave={handleSave} />
    </div>
  );
};

export default DiscoNewPage;