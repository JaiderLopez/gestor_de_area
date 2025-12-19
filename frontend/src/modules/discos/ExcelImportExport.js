import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { API_BASE_URL } from '../../services/api';
import './Discos.css';

const ExcelImportExport = ({ onImportSuccess }) => {
    const [importing, setImporting] = useState(false);
    const [importResult, setImportResult] = useState(null);

    const handleExportTemplate = () => {
        // Descargar plantilla desde el backend
        window.open(`${API_BASE_URL}/discos/export-template/`, '_blank');
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

            const response = await fetch(`${API_BASE_URL}/discos/import/`, {
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
                    errors: [{ message: data.error || 'Error al procesar el archivo' }]
                });
            }
        } catch (error) {
            setImportResult({
                success: false,
                created: 0,
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
        <div className="excel-import-export">
            <button
                onClick={handleExportTemplate}
                className="btn-secondary"
                style={{ marginRight: '10px' }}
                title="Descargar plantilla Excel para importar discos"
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
                <span style={{ marginLeft: '10px', color: '#3699ff' }}>
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
                            <div style={{ marginBottom: '20px' }}>
                                <p><strong>Total de registros:</strong> {importResult.total || 0}</p>
                                <p><strong>Creados exitosamente:</strong> {importResult.created}</p>
                                {importResult.errors && importResult.errors.length > 0 && (
                                    <p style={{ color: '#f64e60' }}>
                                        <strong>Errores:</strong> {importResult.errors.length}
                                    </p>
                                )}
                            </div>

                            {importResult.errors && importResult.errors.length > 0 && (
                                <div>
                                    <h3>Detalles de Errores:</h3>
                                    <div style={{
                                        maxHeight: '300px',
                                        overflowY: 'auto',
                                        backgroundColor: '#fff5f8',
                                        padding: '10px',
                                        borderRadius: '8px'
                                    }}>
                                        {importResult.errors.map((error, idx) => (
                                            <div key={idx} style={{
                                                marginBottom: '10px',
                                                padding: '8px',
                                                backgroundColor: '#ffffff',
                                                borderLeft: '3px solid #f64e60',
                                                borderRadius: '4px'
                                            }}>
                                                {error.row && <strong>Fila {error.row}</strong>}
                                                {error.sheet && <span> - Hoja: {error.sheet}</span>}
                                                {error.field && <span> - Campo: {error.field}</span>}
                                                <p style={{ margin: '5px 0 0 0', color: '#5e6278' }}>
                                                    {error.message}
                                                </p>
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

export default ExcelImportExport;
