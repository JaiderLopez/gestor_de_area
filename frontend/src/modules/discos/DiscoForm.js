import React, { useState, useEffect, useRef } from 'react';
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
  const fileInputRef = useRef(null);

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

  const addContentRow = () => {
    setFormData(prevData => ({
      ...prevData,
      contenidos: [
        ...prevData.contenidos,
        { nombre: '', fecha_modificacion: new Date().toISOString().slice(0, 10), peso_gb: '0.0' }
      ]
    }));
  };

  const removeContentRow = (index) => {
    const newContenidos = formData.contenidos.filter((_, i) => i !== index);
    setFormData(prevData => ({
      ...prevData,
      contenidos: newContenidos,
    }));
  };

  const handleFileSelect = (e) => {
    const files = e.target.files;
    if (files.length > 0) {
      // La propiedad webkitRelativePath nos da la ruta relativa del archivo dentro de la carpeta seleccionada.
      // Ej: "MiCarpeta/subcarpeta/archivo.txt". Queremos solo la parte de la carpeta principal.
      const fullPath = files[0].webkitRelativePath;
      const directoryPath = fullPath.split('/')[0];
      setScanPath(directoryPath);
    }
  };

  const handleSelectFolderClick = () => {
    fileInputRef.current.click();
  };

  const handleScan = async () => {
    if (!scanPath) {
      setMessage({ type: 'error', text: 'Por favor, seleccione una carpeta para escanear.' });
      return;
    }
    setScanLoading(true);
    setMessage({ type: '', text: '' });
    try {
      const data = await scanDisco(scanPath);
      setFormData(prevData => ({
        ...prevData,
        contenidos: data.contenidos,
        nombre: data.nombre_sugerido || prevData.nombre,
        tamanio_gb: data.tamanio_gb_sugerido || prevData.tamanio_gb,
      }));
      setMessage({ type: 'success', text: 'Escaneo completado. Nombre y tamaño sugeridos han sido rellenados.' });
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
    <div className="form-container-split">
      <form onSubmit={handleSubmit} className="disco-form">
        {message.text && <div className={`message ${message.type}`}>{message.text}</div>}
        
        <div className="form-columns">
          {/* Columna Izquierda */}
          <div className="form-column form-column-left">
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
                  type="file"
                  webkitdirectory="true"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  style={{ display: 'none' }}
                />
                <input
                  type="text"
                  value={scanPath}
                  placeholder="Ninguna carpeta seleccionada"
                  readOnly
                  className="scan-path-input"
                />
                <button type="button" onClick={handleSelectFolderClick} disabled={scanLoading}>
                  Seleccionar Carpeta
                </button>
                <button type="button" onClick={handleScan} disabled={scanLoading || !scanPath}>
                  {scanLoading ? 'Escaneando...' : 'Escanear'}
                </button>
              </div>
            </div>
          </div>

          {/* Columna Derecha */}
          <div className="form-column form-column-right">
            <div className="content-header">
              <h3>Contenido del Disco</h3>
              <button type="button" onClick={addContentRow} className="add-content-button">
                Añadir Fila
              </button>
            </div>
            {formData.contenidos.length > 0 ? (
              <div className="content-table-container">
                <table className="content-table">
                  <thead>
                    <tr>
                      <th>Nombre</th>
                      <th>Fecha Modificación</th>
                      <th>Peso (GB)</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {formData.contenidos.map((item, index) => (
                      <tr key={index}>
                        <td>
                          <input
                            type="text"
                            value={item.nombre}
                            onChange={(e) => handleContentChange(index, 'nombre', e.target.value)}
                            placeholder="Nombre del contenido"
                          />
                        </td>
                        <td>
                          <input
                            type="date"
                            value={item.fecha_modificacion}
                            onChange={(e) => handleContentChange(index, 'fecha_modificacion', e.target.value)}
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            step="0.01"
                            value={item.peso_gb}
                            onChange={(e) => handleContentChange(index, 'peso_gb', e.target.value)}
                            className="content-weight-input"
                          />
                        </td>
                        <td>
                          <button type="button" onClick={() => removeContentRow(index)} className="remove-content-button">
                            Eliminar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="no-content-message">
                <p>Aún no se ha añadido contenido.</p>
                <p>Haga clic en "Añadir Fila" para agregar contenido manualmente o escanee una carpeta.</p>
              </div>
            )}
          </div>
        </div>

        <button type="submit" disabled={loading} className="save-button">
          {loading ? 'Guardando...' : 'Guardar Disco'}
        </button>
      </form>
    </div>
  );
};

export default DiscoForm;
