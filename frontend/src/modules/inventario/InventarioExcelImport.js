import React, { useState } from 'react';
import { API_BASE_URL } from '../../services/api';
import './Inventario.css';

const InventarioExcelImport = ({ onImportSuccess }) => {
    const [importing, setImporting] = useState(false);
    const [importResult, setImportResult] = useState(null);

    const handleExportTemplate = () => {
        // Descargar plantilla desde el backend
        window.open(`${API_BASE_URL}/inventario/export-template/`, '_blank');
    };

    const handleFileSelect = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validar extensión
        if (!file.name.endsWith('.xlsx')) {
            alert('Por favor selecciona un archivo Excel (.xlsx)');
            return;
        }

        setImporting(true);
        setImportResult(null);

        try {
            // Crear FormData para enviar el archivo
            const formData = new FormData();
            formData.append('file', file);

            // Nota: Podríamos necesitar un header de autenticación aquí si la API lo requiere en el futuro
            const response = await fetch(`${API_BASE_URL}/inventario/import/`, {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();

            if (response.ok || response.status === 207) {
                setImportResult(data);
                if (data.success && onImportSuccess) {
                    onImportSuccess();
                }
            } else {
                setImportResult({
                    success: false,
                    created: 0,
                    updated: 0,
                    errors: [{ message: data.error || 'Error al procesar el archivo' }]
                });
            }
        } catch (error) {
            setImportResult({
                success: false,
                created: 0,
                updated: 0,
                errors: [{ message: `Error de conexión: ${error.message}` }]
            });
        } finally {
            setImporting(false);
            // Limpiar input
            e.target.value = '';
        }
    };

    const closeResult = () => {
        setImportResult(null);
    };

    return (
        <div className="excel-import-export-container">
            <button
                onClick={handleExportTemplate}
                className="btn-secondary"
                style={{ marginRight: '10px' }}
                title="Descargar plantilla Excel para importar inventario"
            >
                📥 Exportar Plantilla
            </button>

            <label className="btn-secondary" style={{ cursor: 'pointer', margin: 0 }}>
                📤 Importar Datos
                <input
                    type="file"
                    accept=".xlsx"
                    onChange={handleFileSelect}
                    style={{ display: 'none' }}
                    disabled={importing}
                />
            </label>

            {importing && (
                <span className="processing-indicator">
                    Procesando archivo...
                </span>
            )}

            {/* Modal de resultados */}
            {importResult && (
                <div className="modal-overlay" onClick={closeResult}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
                        <div className="modal-header">
                            <h2>{importResult.success ? '✅ Importación Exitosa' : '⚠️ Importación con Errores'}</h2>
                            <button onClick={closeResult} className="modal-close">×</button>
                        </div>
                        <div className="modal-body">
                            <div className="result-stats">
                                <p><strong>Total de registros:</strong> {importResult.total || 0}</p>
                                <p><strong>Creados:</strong> {importResult.created}</p>
                                <p><strong>Actualizados:</strong> {importResult.updated}</p>
                                {importResult.errors && importResult.errors.length > 0 && (
                                    <p className="error-text">
                                        <strong>Errores:</strong> {importResult.errors.length}
                                    </p>
                                )}
                            </div>

                            {importResult.errors && importResult.errors.length > 0 && (
                                <div className="error-list-container">
                                    <h3>Detalles de Errores:</h3>
                                    <div className="error-list">
                                        {importResult.errors.map((error, idx) => (
                                            <div key={idx} className="error-item">
                                                {error.row && <strong>Fila {error.row}</strong>}
                                                {error.sheet && <span> - Hoja: {error.sheet}</span>}
                                                {error.field && <span> - Campo: {error.field}</span>}
                                                <p>{error.message}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="modal-footer">
                            <button onClick={closeResult} className="btn btn-primary">
                                Cerrar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default InventarioExcelImport;
