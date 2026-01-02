import React, { useState } from 'react';
import { createReportePublico } from '../../services/api';
// Reusing styles from other modules if possible, or defined in App.css
// Assuming 'inventario-form' and 'form-group' are global or we can reuse Mantenimiento.css conventions if imported globally

const PublicReporteForm = () => {
    const [formData, setFormData] = useState({
        solicitante: '',
        area: '',
        tipo: 'OTRO',
        descripcion: '',
        prioridad: 'MEDIA',
        evidencia: null
    });
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        setFormData(prev => ({ ...prev, evidencia: e.target.files[0] }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(false);

        // Build FormData for file upload
        const dataToSend = new FormData();
        dataToSend.append('solicitante', formData.solicitante);
        if (formData.area) dataToSend.append('area', formData.area);
        dataToSend.append('tipo', formData.tipo);
        dataToSend.append('descripcion', formData.descripcion);
        dataToSend.append('prioridad', formData.prioridad); // Optional logic: maybe public users can't set priority? Keeping it for now.
        if (formData.evidencia) {
            dataToSend.append('evidencia', formData.evidencia);
        }

        try {
            await createReportePublico(dataToSend);
            setSuccess(true);
            setFormData({
                solicitante: '',
                area: '',
                tipo: 'OTRO',
                descripcion: '',
                prioridad: 'MEDIA',
                evidencia: null
            });
        } catch (err) {
            setError("Error al enviar el reporte. Por favor intente nuevamente.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="card" style={{ padding: '2rem', textAlign: 'center', maxWidth: '600px', margin: '2rem auto' }}>
                <div style={{ color: 'green', fontSize: '3rem', marginBottom: '1rem' }}>✓</div>
                <h2>¡Reporte Recibido!</h2>
                <p>Tu incidencia ha sido registrada correctamente en el sistema.</p>
                <p>El equipo de sistemas revisará el caso a la brevedad.</p>
                <button
                    className="btn btn-primary"
                    onClick={() => setSuccess(false)}
                    style={{ marginTop: '1rem' }}
                >
                    Enviar otro reporte
                </button>
            </div>
        );
    }

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '1rem' }}>
            <h2 style={{ textAlign: 'center', marginBottom: '2rem' }}>Reportar Incidencia</h2>

            <form className="inventario-form card" onSubmit={handleSubmit} style={{ padding: '2rem' }}>
                {error && <div className="alert alert-danger">{error}</div>}

                <div className="form-grid">
                    <div className="form-group">
                        <label>Tu Nombre *</label>
                        <input
                            type="text"
                            name="solicitante"
                            value={formData.solicitante}
                            onChange={handleChange}
                            required
                            placeholder="Ej: Juan Pérez"
                        />
                    </div>

                    <div className="form-group">
                        <label>Área / Departamento</label>
                        <input
                            type="text"
                            name="area"
                            value={formData.area}
                            onChange={handleChange}
                            placeholder="Ej: Contabilidad"
                        />
                    </div>

                    <div className="form-group">
                        <label>Tipo de Problema</label>
                        <select name="tipo" value={formData.tipo} onChange={handleChange}>
                            <option value="FALLA_EQUIPO">Falla de Equipo (PC, Monitor...)</option>
                            <option value="RED">Internet / Red</option>
                            <option value="IMPRESORA">Impresora / Escáner</option>
                            <option value="SOFTWARE">Software / Programas</option>
                            <option value="OTRO">Otro</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Prioridad (Opcional)</label>
                        <select name="prioridad" value={formData.prioridad} onChange={handleChange}>
                            <option value="BAJA">Baja - Puede esperar</option>
                            <option value="MEDIA">Media - Afecta mi trabajo</option>
                            <option value="ALTA">Alta - Urgente / Crítico</option>
                        </select>
                    </div>

                    <div className="form-group full-width">
                        <label>Descripción del Problema *</label>
                        <textarea
                            name="descripcion"
                            value={formData.descripcion}
                            onChange={handleChange}
                            required
                            rows="4"
                            placeholder="Describe qué sucede, qué error ves, desde cuándo ocurre..."
                        />
                    </div>

                    <div className="form-group full-width">
                        <label>Evidencia (Opcional)</label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            style={{ paddingTop: '0.5rem' }}
                        />
                        <small style={{ color: '#666' }}>Sube una captura o foto del error.</small>
                    </div>
                </div>

                <div className="form-actions" style={{ marginTop: '2rem' }}>
                    <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
                        {loading ? 'Enviando...' : 'Enviar Reporte'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default PublicReporteForm;
