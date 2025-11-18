import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { scanDisco } from '../../services/api';
import './Discos.css'; // Importar el CSS

const DiscoForm = ({ disco, onSave }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    tipo: 'HDD',
    tamanio_gb: '',
    descripcion: '',
    contenidos: [],
  });
  const [scanPath, setScanPath] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [scanLoading, setScanLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const navigate = useNavigate();

  useEffect(() => {
    if (disco) {
      setFormData({
        nombre: disco.nombre || '',
        tipo: disco.tipo || 'HDD',
        tamanio_gb: disco.tamanio_gb || '',
        descripcion: disco.descripcion || '',
        contenidos: disco.contenidos || [],
      });
    }
  }, [disco]);

  const validate = () => {
    const newErrors = {};
    if (!formData.nombre) newErrors.nombre = 'El nombre es obligatorio.';
    if (!formData.tamanio_gb) {
      newErrors.tamanio_gb = 'El tamaño es obligatorio.';
    } else if (isNaN(formData.tamanio_gb) || Number(formData.tamanio_gb) <= 0) {
      newErrors.tamanio_gb = 'El tamaño debe ser un número positivo.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleContentChange = (index, field, value) => {
    const newContenidos = [...formData.contenidos];
    newContenidos[index][field] = value;
    setFormData(prevData => ({
      ...prevData,
      contenidos: newContenidos,
    }));
  };

  const handleScan = async () => {
    if (!scanPath) {
      setMessage({ type: 'error', text: 'Por favor, ingrese una ruta para escanear.' });
      return;
    }
    setScanLoading(true);
    setMessage({ type: '', text: '' });
    try {
      const data = await scanDisco(scanPath);
      setFormData(prevData => ({
        ...prevData,
        contenidos: data,
      }));
      setMessage({ type: 'success', text: 'Escaneo completado con éxito.' });
    } catch (error) {
      setMessage({ type: 'error', text: `Error al escanear: ${error.message}` });
    } finally {
      setScanLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setMessage({ type: '', text: '' });
    try {
      await onSave(formData);
      setMessage({ type: 'success', text: 'Disco guardado con éxito.' });
      setTimeout(() => navigate('/discos'), 1500);
    } catch (error) {
      setMessage({ type: 'error', text: `Error al guardar: ${error.message}` });
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="disco-form">
      {message.text && <div className={`message ${message.type}`}>{message.text}</div>}
      
      <label htmlFor="nombre">Nombre del Disco</label>
      <input
        id="nombre"
        type="text"
        name="nombre"
        value={formData.nombre}
        onChange={handleChange}
        placeholder="Nombre del disco"
        className={errors.nombre ? 'input-error' : ''}
      />
      {errors.nombre && <span className="error-text">{errors.nombre}</span>}

      <label htmlFor="tipo">Tipo de Disco</label>
      <select
        id="tipo"
        name="tipo"
        value={formData.tipo}
        onChange={handleChange}
      >
        <option value="HDD">HDD</option>
        <option value="SSD">SSD</option>
        <option value="CD/DVD">CD/DVD</option>
      </select>

      <label htmlFor="tamanio_gb">Tamaño (GB)</label>
      <input
        id="tamanio_gb"
        type="number"
        name="tamanio_gb"
        value={formData.tamanio_gb}
        onChange={handleChange}
        placeholder="Tamaño (GB)"
        className={errors.tamanio_gb ? 'input-error' : ''}
      />
      {errors.tamanio_gb && <span className="error-text">{errors.tamanio_gb}</span>}

      <label htmlFor="descripcion">Descripción</label>
      <textarea
        id="descripcion"
        name="descripcion"
        value={formData.descripcion}
        onChange={handleChange}
        placeholder="Descripción"
      />

      <div className="scan-section">
        <h3>Escanear Contenido</h3>
        <div className="scan-controls">
          <input
            type="text"
            value={scanPath}
            onChange={(e) => setScanPath(e.target.value)}
            placeholder="Ruta del directorio a escanear"
            disabled={scanLoading}
          />
          <button type="button" onClick={handleScan} disabled={scanLoading}>
            {scanLoading ? 'Escaneando...' : 'Escanear'}
          </button>
        </div>
        {formData.contenidos.length > 0 && (
          <table className="content-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Fecha Modificación</th>
                <th>Peso (GB)</th>
              </tr>
            </thead>
            <tbody>
              {formData.contenidos.map((item, index) => (
                <tr key={index}>
                  <td>{item.nombre}</td>
                  <td>{item.fecha_modificacion}</td>
                  <td>
                    <input
                      type="number"
                      value={item.peso_gb}
                      onChange={(e) => handleContentChange(index, 'peso_gb', e.target.value)}
                      className="content-weight-input"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <button type="submit" disabled={loading}>
        {loading ? 'Guardando...' : 'Guardar'}
      </button>
    </form>
  );
};

export default DiscoForm;
