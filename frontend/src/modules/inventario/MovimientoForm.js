import React, { useState, useContext } from 'react';
import { InventarioContext } from './InventarioContext';
import './Inventario.css';

const MovimientoForm = ({ dispositivo, onSave, onSuccess }) => {
    const [formData, setFormData] = useState({
        dispositivo: dispositivo.id,
        tipo_movimiento: 'ASIGNACION',
        origen: dispositivo.ubicacion || 'Almacén',
        destino: '',
        responsable: '', // Nuevo responsable
        observacion: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        if (!formData.destino) {
            setError("El destino es obligatorio.");
            setLoading(false);
            return;
        }

        try {
            await onSave(formData);
            if (onSuccess) onSuccess();
        } catch (err) {
            console.error(err);
            setError("Error al registrar movimiento.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form className="inventario-form" onSubmit={handleSubmit}>
            {error && <div className="alert alert-danger">{error}</div>}

            <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label>Equipo:</label>
                <div style={{ fontWeight: 'bold', color: '#ffffffff' }}>
                    {dispositivo.codigo_inventario} - {dispositivo.marca} {dispositivo.modelo}
                </div>
            </div>

            <div className="form-grid">
                <div className="form-group full-width">
                    <h3 className="section-title">Detalles del Movimiento</h3>
                </div>

                <div className="form-group">
                    <label>Tipo de Movimiento</label>
                    <select name="tipo_movimiento" value={formData.tipo_movimiento} onChange={handleChange}>
                        <option value="ASIGNACION">Asignación (A usuario)</option>
                        <option value="TRASLADO">Traslado (Ubicación)</option>
                        <option value="DEVOLUCION">Devolución (A bodega)</option>
                        <option value="REPARACION">Salida a Reparación</option>
                        <option value="BAJA">Dar de Baja</option>
                    </select>
                </div>

                <div className="form-group">
                    <label>Origen (Actual)</label>
                    <input
                        type="text"
                        name="origen"
                        value={formData.origen}
                        readOnly
                        className="input-readonly"
                        style={{ backgroundColor: '#f3f6f9' }}
                    />
                </div>

                <div className="form-group">
                    <label>Destino (Nueva Ubicación) *</label>
                    <input
                        type="text"
                        name="destino"
                        value={formData.destino}
                        onChange={handleChange}
                        placeholder="Ej: Oficina 205, Taller Externo..."
                        required
                    />
                </div>

                <div className="form-group">
                    <label>Nuevo Responsable</label>
                    <input
                        type="text"
                        name="responsable"
                        value={formData.responsable}
                        onChange={handleChange}
                        placeholder="Opcional. Ej: Usuario Final."
                    />
                </div>

                <div className="form-group full-width">
                    <label>Observaciones</label>
                    <textarea
                        name="observacion"
                        value={formData.observacion}
                        onChange={handleChange}
                        rows="3"
                        placeholder="Motivo del movimiento, estado físico del equipo, etc."
                    ></textarea>
                </div>
            </div>

            <div className="form-actions">
                <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
                    {loading ? 'Registrando...' : 'Confirmar Movimiento'}
                </button>
            </div>
        </form>
    );
};

export default MovimientoForm;
