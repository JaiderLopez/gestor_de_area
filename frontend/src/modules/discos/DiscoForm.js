import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { migrateContent } from '../../services/api';
import MigrationModal from './MigrationModal';
import './Discos.css'; // Importar el CSS

const DiscoForm = ({ disco, onSave, onSuccess }) => {
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

  const [migrationModal, setMigrationModal] = useState({
    isOpen: false,
    contenidoIndex: null,
    contenidoData: null
  });

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

    const totalSize = parseFloat(formData.tamanio_gb);
    if (!formData.tamanio_gb) {
      newErrors.tamanio_gb = 'El tamaño es obligatorio.';
    } else if (isNaN(totalSize) || totalSize <= 0) {
      newErrors.tamanio_gb = 'El tamaño debe ser un número positivo.';
    }

    // Validación de peso total de contenidos
    const totalContentWeight = formData.contenidos.reduce((sum, item) => sum + parseFloat(item.peso_gb || 0), 0);
    if (totalContentWeight > totalSize) {
      newErrors.tamanio_gb = `El peso total del contenido (${totalContentWeight.toFixed(2)} GB) supera la capacidad del disco (${totalSize} GB).`;
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
    const confirmDelete = window.confirm('¿Está seguro de que desea eliminar este campo de contenido?');
    if (!confirmDelete) return;

    const newContenidos = formData.contenidos.filter((_, i) => i !== index);
    setFormData(prevData => ({
      ...prevData,
      contenidos: newContenidos,
    }));
  };

  const handleMigrateClick = (index, contenido) => {
    // Solo permitir migración si el disco ya está guardado (tiene ID)
    if (!disco || !disco.id) {
      setMessage({ type: 'error', text: 'Debe guardar el disco antes de migrar contenidos.' });
      return;
    }

    // Solo permitir migración si el contenido tiene ID (ya está guardado)
    if (!contenido.id) {
      setMessage({ type: 'error', text: 'Debe guardar el contenido antes de migrarlo.' });
      return;
    }

    setMigrationModal({
      isOpen: true,
      contenidoIndex: index,
      contenidoData: contenido
    });
  };

  const handleMigrateConfirm = async (discoDestinoId) => {
    const { contenidoData, contenidoIndex } = migrationModal;

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const result = await migrateContent(contenidoData.id, discoDestinoId);

      // Eliminar el contenido migrado del formulario
      const newContenidos = formData.contenidos.filter((_, i) => i !== contenidoIndex);
      setFormData(prevData => ({
        ...prevData,
        contenidos: newContenidos,
      }));

      setMessage({
        type: 'success',
        text: result.message || 'Contenido migrado exitosamente.'
      });

      // Cerrar modal
      setMigrationModal({
        isOpen: false,
        contenidoIndex: null,
        contenidoData: null
      });

    } catch (error) {
      console.error(error);
      setMessage({
        type: 'error',
        text: error.message || 'Error al migrar el contenido.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleMigrateCancel = () => {
    setMigrationModal({
      isOpen: false,
      contenidoIndex: null,
      contenidoData: null
    });
  };

  const [selectedFiles, setSelectedFiles] = useState([]);

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      // Intentamos obtener el nombre de la carpeta raíz
      const fullPath = files[0].webkitRelativePath;
      const directoryName = fullPath.split('/')[0];
      setScanPath(directoryName);
      setSelectedFiles(files);
    }
  };

  const handleSelectFolderClick = () => {
    fileInputRef.current.click();
  };

  const handleScan = async () => {
    if (selectedFiles.length === 0) {
      setMessage({ type: 'error', text: 'Por favor, seleccione una carpeta válida para escanear.' });
      return;
    }

    setScanLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const topLevelItems = {};
      let totalSizeBytes = 0;

      selectedFiles.forEach(file => {
        totalSizeBytes += file.size;
        const relativePath = file.webkitRelativePath;
        const parts = relativePath.split('/');

        // El primer elemento es el nombre de la carpeta raíz seleccionada.
        // El segundo elemento es lo que consideraremos como ítem de primer nivel (archivo o carpeta hija).
        if (parts.length > 1) {
          const itemName = parts[1];
          if (!topLevelItems[itemName]) {
            topLevelItems[itemName] = {
              nombre: itemName,
              fecha_modificacion: new Date(file.lastModified).toISOString().slice(0, 10),
              peso_bytes: 0,
              es_carpeta: parts.length > 2
            };
          }
          topLevelItems[itemName].peso_bytes += file.size;
          // Si encontramos un archivo más reciente dentro, actualizamos la fecha
          const fileDate = new Date(file.lastModified).toISOString().slice(0, 10);
          if (fileDate > topLevelItems[itemName].fecha_modificacion) {
            topLevelItems[itemName].fecha_modificacion = fileDate;
          }
        }
      });

      const contenidos = Object.values(topLevelItems).map(item => ({
        nombre: item.nombre,
        fecha_modificacion: item.fecha_modificacion,
        peso_gb: (item.peso_bytes / (1024 ** 3)).toFixed(2)
      }));

      const totalSizeGB = (totalSizeBytes / (1024 ** 3)).toFixed(2);

      setFormData(prevData => ({
        ...prevData,
        contenidos: contenidos,
        nombre: scanPath || prevData.nombre,
        tamanio_gb: totalSizeGB || prevData.tamanio_gb,
      }));

      setMessage({ type: 'success', text: `Escaneo completado. Se encontraron ${contenidos.length} ítems principales.` });
    } catch (error) {
      setMessage({ type: 'error', text: `Error al procesar archivos: ${error.message}` });
    } finally {
      setScanLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setErrors({});
    setMessage({ type: '', text: '' });
    try {
      const savedDisco = await onSave(formData);
      setMessage({ type: 'success', text: 'Disco guardado con éxito.' });

      if (onSuccess) {
        onSuccess(savedDisco);
      } else {
        // Fallback if not using in modal
        setTimeout(() => navigate('/discos'), 1500);
      }
    } catch (error) {
      console.error(error);
      if (error.data && typeof error.data === 'object') {
        // Map backend field errors to local errors state
        const fieldErrors = {};
        Object.keys(error.data).forEach(key => {
          if (Array.isArray(error.data[key])) {
            fieldErrors[key] = error.data[key].join(' ');
          } else {
            fieldErrors[key] = error.data[key];
          }
        });
        setErrors(fieldErrors);
        setMessage({ type: 'error', text: 'Por favor, corrige los errores en el formulario.' });
      } else {
        setMessage({ type: 'error', text: `Error al guardar: ${error.message}` });
      }
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
                  placeholder="Seleccione una carpeta para escanear"
                  readOnly
                  className="scan-path-input"
                />
                <button type="button" onClick={handleSelectFolderClick} disabled={scanLoading}>
                  Seleccionar Carpeta
                </button>
                <button type="button" onClick={handleScan} disabled={scanLoading || selectedFiles.length === 0}>
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
                        <td data-label="Nombre">
                          <input
                            type="text"
                            value={item.nombre}
                            onChange={(e) => handleContentChange(index, 'nombre', e.target.value)}
                            placeholder="Nombre del contenido"
                          />
                        </td>
                        <td data-label="Fecha Modificación">
                          <input
                            type="date"
                            value={item.fecha_modificacion}
                            onChange={(e) => handleContentChange(index, 'fecha_modificacion', e.target.value)}
                          />
                        </td>
                        <td data-label="Peso (GB)">
                          <input
                            type="number"
                            step="0.01"
                            value={item.peso_gb}
                            onChange={(e) => handleContentChange(index, 'peso_gb', e.target.value)}
                            className="content-weight-input"
                          />
                        </td>
                        <td data-label="Acciones">
                          <div className="action-buttons-group">
                            <button
                              type="button"
                              onClick={() => removeContentRow(index)}
                              className="action-icon-button delete"
                              title="Eliminar contenido"
                            >
                              🗑️
                            </button>
                            {disco && disco.id && item.id && (
                              <button
                                type="button"
                                onClick={() => handleMigrateClick(index, item)}
                                className="action-icon-button migrate"
                                title="Migrar a otro disco"
                              >
                                ↗️
                              </button>
                            )}
                          </div>
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

        <MigrationModal
          isOpen={migrationModal.isOpen}
          onClose={handleMigrateCancel}
          contenido={migrationModal.contenidoData}
          discoOrigenId={disco?.id}
          onMigrate={handleMigrateConfirm}
        />
      </form>
    </div>
  );
};

export default DiscoForm;
